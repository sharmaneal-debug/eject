/**
 * Autonomous delivery queue.
 *
 * A paid automated order is enqueued by the Stripe webhook. Nothing runs until
 * a cron call or a GitHub Actions worker picks it up.
 *
 * On Vercel the function does not crawl. Playwright plus a static move does
 * not fit the function size or time limit, so the webhook/cron dispatches
 * `.github/workflows/deliver-order.yml` when EJECT_GITHUB_TOKEN and
 * GITHUB_REPOSITORY are set. Locally, in tests, and when
 * EJECT_DELIVER_RUNNER=inprocess, a bounded HTTP crawl builds a static package
 * and emails it. That path is what the end-to-end test covers.
 */

import { analyzeSnapshot, type ComplexityReport } from "./complexity";
import { scoreCrawledSnapshot } from "./crawled-snapshot";
import { buildDelivery, deliveryDirFor, materializeDelivery } from "./delivery";
import {
  autonomousDeliveryEmail,
  deliveryFailureEmail,
  deliveryOpsNotice,
  refundFollowupEmail,
  resendFromAddress,
  sendEmail,
} from "./email";
import { crawlSite, type CrawlDeps } from "./http-crawl";
import { costOf, llmChat, PRICING_USD_PER_MTOK, resolveLlmConfig, type LlmChatResult, type LlmConfig, type LlmMessage } from "./llm";
import { getOrderStore, type DeliveryJob, type DeliveryLlm, type Order } from "./orders";
import { opsStoreWarning } from "./storage/plan";
import type { LookupFn } from "./ssrf";
import { zipStore } from "./zip-store";

export const MAX_DELIVERY_ATTEMPTS = 3;
export const WAITING_FOR_SITE_URL = "waiting for a site URL";
const BACKOFF_MS = [60_000, 5 * 60_000, 15 * 60_000];
const DISPATCH_STALE_MS = 45 * 60 * 1000;
const RUNNING_STALE_MS = 10 * 60 * 1000;
const ZIP_BYTE_CAP = 6_000_000;
const ESTIMATE_INPUT_TOKENS = 4_000;
const ESTIMATE_OUTPUT_TOKENS = 2_000;

export type DeliveryRunner = "github" | "inprocess";

export type DeliveryDeps = {
  now?: () => number;
  lookupFn?: LookupFn;
  fetchImpl?: typeof fetch;
  llmChat?: (config: LlmConfig, opts: { system: string; messages: LlmMessage[]; maxTokens: number }) => Promise<LlmChatResult>;
};

export type QueueItemResult = { orderId: string; state: string; error?: string };

export type QueueRun = {
  runner: DeliveryRunner;
  warning: string | null;
  githubConfigured: boolean;
  emailConfigured: boolean;
  results: QueueItemResult[];
};

let depsOverride: DeliveryDeps | null = null;

/** Test-only seam. Production leaves this unset. */
export function setDeliveryDepsForTests(deps: DeliveryDeps | null) {
  depsOverride = deps;
}

function activeDeps(explicit?: DeliveryDeps): DeliveryDeps {
  return { ...depsOverride, ...explicit };
}

export function deliveryRunner(env: Record<string, string | undefined> = process.env): DeliveryRunner {
  if (env.EJECT_DELIVER_RUNNER === "inprocess") return "inprocess";
  if (env.EJECT_DELIVER_RUNNER === "github" || env.VERCEL) return "github";
  return "inprocess";
}

export function githubDeliveryConfig(env: Record<string, string | undefined> = process.env): { token: string; repo: string; ref: string } | null {
  const token = env.EJECT_GITHUB_TOKEN?.trim() ?? "";
  const repo = env.GITHUB_REPOSITORY?.trim() ?? "";
  if (!token || !/^[\w.-]+\/[\w.-]+$/.test(repo)) return null;
  const ref = (env.EJECT_GITHUB_REF?.trim() || "main").replace(/^refs\/heads\//, "");
  if (ref.includes("..") || !/^[\w./-]+$/.test(ref)) return null;
  return { token, repo, ref };
}

export function emailDeliveryConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && resendFromAddress());
}

export function rebuildSpendCapUsd(env: Record<string, string | undefined> = process.env): number {
  const raw = env.EJECT_REBUILD_SPEND_CAP_USD;
  if (raw === undefined || raw.trim() === "") return 5;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) return 5;
  return value;
}

export function llmRebuildDecision(
  pageCount: number,
  env: Record<string, string | undefined> = process.env,
): { action: "skip_unset" | "skip_cap" | "skip_unpriced" | "run"; capUsd: number; estimateUsd: number | null; model?: string } {
  const capUsd = rebuildSpendCapUsd(env);
  let config: LlmConfig;
  try {
    config = resolveLlmConfig();
  } catch {
    return { action: "skip_unset", capUsd, estimateUsd: null };
  }
  if (!PRICING_USD_PER_MTOK[config.model]) {
    return { action: "skip_unpriced", capUsd, estimateUsd: null, model: config.model };
  }
  const pages = Math.max(1, pageCount);
  const estimateUsd = costOf(config.model, ESTIMATE_INPUT_TOKENS * pages, ESTIMATE_OUTPUT_TOKENS * pages);
  if (estimateUsd > capUsd) return { action: "skip_cap", capUsd, estimateUsd, model: config.model };
  return { action: "run", capUsd, estimateUsd, model: config.model };
}

export function isDeliveryDue(job: DeliveryJob, nowMs: number): boolean {
  if (job.state === "delivered" || job.state === "failed" || job.state === "skipped") return false;
  if (job.state === "queued" && job.lastError === WAITING_FOR_SITE_URL) return false;
  if (job.state === "running") return nowMs - Date.parse(job.updatedAt) > RUNNING_STALE_MS;
  if (job.state === "dispatched") return nowMs - Date.parse(job.dispatchedAt ?? job.updatedAt) > DISPATCH_STALE_MS;
  if (job.nextAttemptAt && Date.parse(job.nextAttemptAt) > nowMs) return false;
  return job.state === "queued";
}

export async function enqueuePaidOrder(orderId: string): Promise<Order | null> {
  const store = getOrderStore();
  const order = await store.get(orderId);
  if (!order || order.tier !== "automated" || order.status === "pending" || order.deliveryJob) return order;
  const now = new Date().toISOString();
  return store.update(order.id, {
    deliveryJob: { state: "queued", attempts: 0, enqueuedAt: now, updatedAt: now, llm: "unset" },
  });
}

export async function dispatchDeliveryWorkflow(
  orderId: string,
  env: Record<string, string | undefined> = process.env,
  fetchImpl: typeof fetch = fetch,
): Promise<{ ok: boolean; error?: string }> {
  if (!/^ord_[A-Za-z0-9]+$/.test(orderId)) return { ok: false, error: "bad order id" };
  const config = githubDeliveryConfig(env);
  if (!config) return { ok: false, error: "GitHub delivery is not configured" };
  try {
    const response = await fetchImpl(`https://api.github.com/repos/${config.repo}/actions/workflows/deliver-order.yml/dispatches`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "eject-delivery",
      },
      body: JSON.stringify({ ref: config.ref, inputs: { order_id: orderId } }),
    });
    if (response.status === 204 || response.ok) return { ok: true };
    return { ok: false, error: `GitHub dispatch failed (${response.status}).` };
  } catch {
    return { ok: false, error: "GitHub dispatch failed." };
  }
}

export async function kickDelivery(order: Order, deps?: DeliveryDeps): Promise<Order> {
  const job = order.deliveryJob;
  if (!job || job.state !== "queued" || job.attempts > 0 || job.lastError === WAITING_FOR_SITE_URL) return order;
  if (deliveryRunner() !== "github" || !order.siteUrl?.trim()) return order;
  const store = getOrderStore();
  const updatedAt = new Date().toISOString();
  const claimed = await store.compareAndUpdate(
    order.id,
    { deliveryState: "queued", attempts: 0 },
    {
      deliveryJob: {
        ...job,
        state: "dispatched",
        attempts: 1,
        runner: "github",
        dispatchedAt: updatedAt,
        updatedAt,
        lastError: undefined,
      },
    },
  );
  if (!claimed) return (await store.get(order.id)) ?? order;
  const runtime = activeDeps(deps);
  const result = await dispatchDeliveryWorkflow(order.id, process.env, runtime.fetchImpl);
  if (!result.ok) {
    await markAttemptFailure(claimed, result.error || "GitHub dispatch failed.", Date.now(), runtime.fetchImpl);
    return (await store.get(order.id)) ?? claimed;
  }
  return claimed;
}

function staticHtml(html: string): string {
  const stripped = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  if (/<html[\s>]/i.test(stripped)) return stripped.slice(0, 100_000);
  return `<!doctype html><html><head><meta charset="utf-8"></head><body>${stripped.slice(0, 100_000)}</body></html>`;
}

function llmLabel(action: ReturnType<typeof llmRebuildDecision>["action"]): DeliveryLlm {
  if (action === "run") return "ran";
  if (action === "skip_cap") return "over_cap";
  if (action === "skip_unpriced") return "unpriced";
  return "unset";
}

async function alertTerminal(order: Order, reason: string, fetchImpl?: typeof fetch): Promise<void> {
  const to = process.env.LEAD_NOTIFICATION_TO?.trim();
  const job = order.deliveryJob;
  if (!to || !job || job.alertedAt || !emailDeliveryConfigured()) return;
  const message = deliveryFailureEmail({
    orderId: order.id,
    siteUrl: order.siteUrl,
    attempts: job.attempts,
    reason,
  });
  const result = await sendEmail({ to, ...message, fetchImpl });
  if (!result.ok) return;
  await getOrderStore().update(order.id, {
    deliveryJob: { ...job, alertedAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  });
}

async function markAttemptFailure(order: Order, reason: string, nowMs: number, fetchImpl?: typeof fetch): Promise<QueueItemResult> {
  const store = getOrderStore();
  const current = (await store.get(order.id)) ?? order;
  const job = current.deliveryJob;
  if (!job) return { orderId: order.id, state: "missing", error: reason };
  const updatedAt = new Date(nowMs).toISOString();
  const clipped = reason.slice(0, 500);
  if (job.attempts >= MAX_DELIVERY_ATTEMPTS) {
    const failed = await store.update(order.id, {
      deliveryJob: { ...job, state: "failed", lastError: clipped, updatedAt, nextAttemptAt: undefined },
    });
    await alertTerminal(failed, clipped, fetchImpl);
    return { orderId: order.id, state: "failed", error: clipped };
  }
  const wait = BACKOFF_MS[Math.min(Math.max(job.attempts, 1) - 1, BACKOFF_MS.length - 1)] ?? 60_000;
  await store.update(order.id, {
    deliveryJob: { ...job, state: "queued", lastError: clipped, updatedAt, nextAttemptAt: new Date(nowMs + wait).toISOString() },
  });
  return { orderId: order.id, state: "queued", error: clipped };
}

async function stampConfig(order: Order, reason: string, nowMs: number): Promise<QueueItemResult> {
  const job = order.deliveryJob;
  if (!job || job.lastError === reason) return { orderId: order.id, state: job?.state ?? "queued", error: reason };
  await getOrderStore().update(order.id, {
    deliveryJob: { ...job, lastError: reason, updatedAt: new Date(nowMs).toISOString() },
  });
  return { orderId: order.id, state: job.state, error: reason };
}

async function markWaitingForSite(order: Order, nowMs: number): Promise<QueueItemResult> {
  const job = order.deliveryJob;
  if (!job) return { orderId: order.id, state: "missing", error: WAITING_FOR_SITE_URL };
  if (job.state === "queued" && job.lastError === WAITING_FOR_SITE_URL) {
    return { orderId: order.id, state: "queued", error: WAITING_FOR_SITE_URL };
  }
  await getOrderStore().update(order.id, {
    deliveryJob: { ...job, state: "queued", lastError: WAITING_FOR_SITE_URL, updatedAt: new Date(nowMs).toISOString() },
  });
  return { orderId: order.id, state: "queued", error: WAITING_FOR_SITE_URL };
}

async function dispatchQueued(order: Order, nowMs: number, fetchImpl?: typeof fetch): Promise<QueueItemResult> {
  const job = order.deliveryJob;
  if (!job) return { orderId: order.id, state: "missing" };
  if (!order.siteUrl?.trim()) return markWaitingForSite(order, nowMs);
  if (job.attempts >= MAX_DELIVERY_ATTEMPTS) return markAttemptFailure(order, job.lastError || "delivery attempts exhausted", nowMs, fetchImpl);
  const configError = githubDeliveryConfig()
    ? null
    : "GitHub delivery is not configured. Set EJECT_GITHUB_TOKEN and GITHUB_REPOSITORY. Playwright crawl and static-move cannot run inside a Vercel function.";
  if (configError) return stampConfig(order, configError, nowMs);
  const updatedAt = new Date(nowMs).toISOString();
  const claimed = await getOrderStore().compareAndUpdate(
    order.id,
    { deliveryState: job.state, attempts: job.attempts },
    {
      deliveryJob: {
        ...job,
        state: "dispatched",
        attempts: job.attempts + 1,
        runner: "github",
        dispatchedAt: updatedAt,
        updatedAt,
        lastError: undefined,
      },
    },
  );
  if (!claimed) return { orderId: order.id, state: job.state, error: "already claimed" };
  const result = await dispatchDeliveryWorkflow(order.id, process.env, fetchImpl);
  if (!result.ok) return markAttemptFailure(claimed, result.error || "GitHub dispatch failed.", nowMs, fetchImpl);
  return { orderId: order.id, state: "dispatched" };
}

async function deliverInProcess(order: Order, nowMs: number, deps: DeliveryDeps): Promise<QueueItemResult> {
  const store = getOrderStore();
  const job = order.deliveryJob;
  if (!job) return { orderId: order.id, state: "missing" };
  if (!order.email) {
    await store.update(order.id, {
      deliveryJob: { ...job, state: "skipped", lastError: "no customer email", updatedAt: new Date(nowMs).toISOString() },
    });
    return { orderId: order.id, state: "skipped", error: "no customer email" };
  }
  if (!order.siteUrl?.trim()) return markWaitingForSite(order, nowMs);
  if (job.attempts >= MAX_DELIVERY_ATTEMPTS) return markAttemptFailure(order, job.lastError || "delivery attempts exhausted", nowMs, deps.fetchImpl);

  const updatedAt = new Date(nowMs).toISOString();
  const claimed = await store.compareAndUpdate(
    order.id,
    { deliveryState: job.state, attempts: job.attempts },
    { deliveryJob: { ...job, state: "running", attempts: job.attempts + 1, runner: "inprocess", updatedAt, lastError: undefined } },
  );
  if (!claimed?.deliveryJob) return { orderId: order.id, state: job.state, error: "already claimed" };

  try {
    const crawlDeps: CrawlDeps = { lookupFn: deps.lookupFn, fetchImpl: deps.fetchImpl, now: deps.now };
    const snapshot = await crawlSite(order.siteUrl, crawlDeps);
    const report = analyzeSnapshot(snapshot, { tier: claimed.tier, amountUsd: claimed.amountCents / 100 });
    if (report.eligibility !== "ELIGIBLE") {
      await markOrderNotEligible(claimed, report, snapshot.finalUrl, deps.fetchImpl);
      return { orderId: claimed.id, state: "skipped", error: "not eligible" };
    }

    const decision = llmRebuildDecision(snapshot.pages.length);
    const packet = buildDelivery({ ...claimed, siteUrl: snapshot.finalUrl }, report, snapshot);
    packet.repoFiles.push({ path: "index.html", contents: staticHtml(snapshot.pages[0]?.html ?? "") });
    const llm = llmLabel(decision.action);
    if (decision.action === "run") {
      const config = resolveLlmConfig();
      const chat = deps.llmChat ?? llmChat;
      const result = await chat(config, {
        system: "Return one static page component. No secrets. No network calls.",
        messages: [{ role: "user", content: `Rebuild the home page of ${snapshot.finalUrl} as a single React component. Source text is already extracted.` }],
        maxTokens: 2000,
      });
      packet.repoFiles.push({ path: "rebuild/page.tsx", contents: result.text.slice(0, 100_000) });
    }
    packet.note = `${packet.note} Autonomous delivery wrote a static package from the HTTP crawl. The Playwright static move runs in GitHub Actions because it does not fit a Vercel function.`;
    await finishDeliveredOrder(claimed.id, {
      repoFiles: packet.repoFiles,
      note: packet.note,
      score: report,
      siteUrl: snapshot.finalUrl,
      llm,
      fetchImpl: deps.fetchImpl,
      packet,
    });
    return { orderId: claimed.id, state: "delivered" };
  } catch (err) {
    const reason = err instanceof Error ? err.message : "delivery failed";
    if (reason === "delivery email is already in progress") return { orderId: claimed.id, state: "running", error: reason };
    return markAttemptFailure(claimed, reason, nowMs, deps.fetchImpl);
  }
}

function packageAlreadySent(value: string | undefined): boolean {
  return Boolean(value && value !== "sending" && value !== "failed" && value !== "skipped");
}

export async function markOrderNotEligible(
  order: Order,
  report: ComplexityReport,
  siteUrl: string,
  fetchImpl?: typeof fetch,
): Promise<Order> {
  const store = getOrderStore();
  const current = (await store.get(order.id)) ?? order;
  const job = current.deliveryJob ?? order.deliveryJob;
  let emails = current.emails;
  if (current.email && !emails?.refund) {
    const refund = refundFollowupEmail({ name: current.name || "", siteUrl });
    const result = await sendEmail({ to: current.email, ...refund, fetchImpl });
    emails = { ...emails, refund: result.ok ? new Date().toISOString() : result.skipped ? "skipped" : "failed" };
  }
  await notifyOps(current, siteUrl, "not eligible", fetchImpl);
  return store.update(current.id, {
    siteUrl,
    score: report,
    status: "refund_recommended",
    emails,
    deliveryJob: job
      ? { ...job, state: "skipped", llm: "unset", lastError: "not eligible", updatedAt: new Date().toISOString() }
      : undefined,
  });
}

/** Shared by the GitHub Actions worker. Refuses to package a crawl that is not a simple site. */
export async function gateCrawledDelivery(
  order: Order,
  snapshotDir: string,
  siteUrl: string,
  fetchImpl?: typeof fetch,
): Promise<{ ok: true; report: ComplexityReport } | { ok: false; reason: "not eligible" | "no pages" }> {
  const report = await scoreCrawledSnapshot(snapshotDir, order);
  if (!report) return { ok: false, reason: "no pages" };
  if (report.eligibility !== "ELIGIBLE") {
    await markOrderNotEligible(order, report, siteUrl, fetchImpl);
    return { ok: false, reason: "not eligible" };
  }
  return { ok: true, report };
}

async function notifyOps(order: Order, siteUrl: string, llm: string, fetchImpl?: typeof fetch): Promise<void> {
  const to = process.env.LEAD_NOTIFICATION_TO?.trim();
  if (!to || !emailDeliveryConfigured()) return;
  const message = deliveryOpsNotice({ orderId: order.id, email: order.email || "", siteUrl, llm });
  await sendEmail({ to, ...message, fetchImpl });
}

export async function finishDeliveredOrder(
  orderId: string,
  input: {
    repoFiles: Array<{ path: string; contents: string }>;
    note: string;
    score?: Order["score"];
    siteUrl: string;
    llm: DeliveryLlm;
    fetchImpl?: typeof fetch;
    packet?: Order["delivery"];
    zipBytes?: Buffer;
  },
): Promise<Order> {
  const store = getOrderStore();
  const order = await store.get(orderId);
  if (!order?.deliveryJob) throw new Error("order is not queued");
  if (order.deliveryJob.state === "delivered") return order;
  if (!order.email) throw new Error("no customer email");
  const files = input.repoFiles.filter((file) => file.path && !file.path.split("/").includes(".."));
  const zipped = input.zipBytes ?? zipStore(files.map((file) => ({ path: file.path, contents: Buffer.from(file.contents) })));
  const attached = zipped.length > 0 && zipped.length <= ZIP_BYTE_CAP;
  let emails = order.emails ?? {};
  if (!packageAlreadySent(emails.package)) {
    const claimed = await store.compareAndUpdate(order.id, { packageEmail: "claimable" }, { emails: { ...emails, package: "sending" } });
    if (!claimed) {
      const current = await store.get(orderId);
      if (current?.deliveryJob?.state === "delivered") return current;
      if (!packageAlreadySent(current?.emails?.package)) throw new Error("delivery email is already in progress");
      emails = current?.emails ?? emails;
    } else {
      emails = claimed.emails ?? emails;
      const message = autonomousDeliveryEmail({
        name: order.name || "",
        siteUrl: input.siteUrl,
        fileCount: files.length,
        llm: input.llm,
        attached,
      });
      const result = await sendEmail({
        to: order.email,
        ...message,
        fetchImpl: input.fetchImpl,
        attachments: attached ? [{ filename: `${order.id}.zip`, content: zipped.toString("base64") }] : undefined,
      });
      if (!result.ok) {
        await store.update(order.id, { emails: { ...emails, package: result.skipped ? "skipped" : "failed" } });
        throw new Error(result.error || "customer email failed");
      }
      await notifyOps(order, input.siteUrl, input.llm, input.fetchImpl);
    }
  }
  if (!process.env.VERCEL && input.packet) {
    try {
      await materializeDelivery({ ...input.packet, repoFiles: files, note: input.note }, deliveryDirFor(order.id));
    } catch (err) {
      console.error("[delivery] disk write failed", err instanceof Error ? err.message : "error");
    }
  }
  const updatedAt = new Date().toISOString();
  return store.update(order.id, {
    siteUrl: input.siteUrl,
    score: input.score ?? order.score,
    status: "delivered",
    delivery: {
      ...(input.packet ?? order.delivery ?? {
        mode: "queued",
        llm: input.llm === "ran" ? "queued" : "absent",
        assetsPullable: false,
        rebuildEase: "unknown",
        hostingSteps: [],
        editor: { cli: "", kitPath: "/how-it-works", note: "" },
        repoFiles: files,
        note: input.note,
      }),
      repoFiles: files,
      note: input.note,
    },
    emails: { ...emails, package: packageAlreadySent(emails.package) ? emails.package : updatedAt },
    deliveryJob: {
      ...order.deliveryJob,
      state: "delivered",
      llm: input.llm,
      deliveredAt: updatedAt,
      updatedAt,
      lastError: undefined,
      nextAttemptAt: undefined,
    },
  });
}

export async function noteExternalFailure(orderId: string, reason: string, fetchImpl?: typeof fetch): Promise<void> {
  const order = await getOrderStore().get(orderId);
  if (!order?.deliveryJob) return;
  await markAttemptFailure(order, reason, Date.now(), fetchImpl);
}

export async function processDeliveryQueue(explicit?: DeliveryDeps): Promise<QueueRun> {
  const deps = activeDeps(explicit);
  const nowMs = deps.now ? deps.now() : Date.now();
  const runner = deliveryRunner();
  const warning = opsStoreWarning();
  const orders = await getOrderStore().list();
  const due = orders.filter((order) => order.deliveryJob && isDeliveryDue(order.deliveryJob, nowMs));
  const limit = runner === "inprocess" ? 1 : 5;
  const results: QueueItemResult[] = [];

  if (runner === "inprocess" && !emailDeliveryConfigured() && due.length) {
    for (const order of due.slice(0, limit)) {
      const reason = !process.env.RESEND_API_KEY ? "RESEND_API_KEY not set" : "RESEND_FROM not set";
      results.push(await stampConfig(order, reason, nowMs));
    }
    return { runner, warning, githubConfigured: Boolean(githubDeliveryConfig()), emailConfigured: false, results };
  }

  for (const order of due.slice(0, limit)) {
    if (runner === "github") results.push(await dispatchQueued(order, nowMs, deps.fetchImpl));
    else results.push(await deliverInProcess(order, nowMs, deps));
  }
  return { runner, warning, githubConfigured: Boolean(githubDeliveryConfig()), emailConfigured: emailDeliveryConfigured(), results };
}
