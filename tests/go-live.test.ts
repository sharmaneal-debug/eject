import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import Stripe from "stripe";
import { GET as deliverCron } from "../app/api/cron/deliver-orders/route";
import { POST as webhook } from "../app/api/stripe/webhook/route";
import {
  deliveryRunner,
  gateCrawledDelivery,
  githubDeliveryConfig,
  finishDeliveredOrder,
  kickDelivery,
  llmRebuildDecision,
  processDeliveryQueue,
  setDeliveryDepsForTests,
  WAITING_FOR_SITE_URL,
} from "../lib/auto-deliver";
import { discoveredPageCount, scoreCrawledSnapshot } from "../lib/crawled-snapshot";
import { runPaidIntake } from "../lib/fulfillment";
import { deliveryDirFor } from "../lib/delivery";
import { getOrderStore, resetOrderStoreForTests } from "../lib/orders";
import { buildOpsStatus } from "../lib/ops-status";
import { getStripe, liveStripeAllowed, stripeConfigError } from "../lib/stripe";
import { opsStoreWarning, resolveStorePlan } from "../lib/storage/plan";
import { zipStore } from "../lib/zip-store";

const saved = {
  ORDERS_STORE: process.env.ORDERS_STORE,
  ORDERS_DIR: process.env.ORDERS_DIR,
  EJECT_STRIPE_MODE: process.env.EJECT_STRIPE_MODE,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM: process.env.RESEND_FROM,
  LEAD_NOTIFICATION_TO: process.env.LEAD_NOTIFICATION_TO,
  VERCEL: process.env.VERCEL,
  CHECKOUT_OPEN: process.env.CHECKOUT_OPEN,
  CRON_SECRET: process.env.CRON_SECRET,
  KV_REST_API_URL: process.env.KV_REST_API_URL,
  KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
  POSTGRES_URL: process.env.POSTGRES_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  LLM_PROVIDER: process.env.LLM_PROVIDER,
  LLM_BASE_URL: process.env.LLM_BASE_URL,
  LLM_API_KEY: process.env.LLM_API_KEY,
  LLM_MODEL: process.env.LLM_MODEL,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  EJECT_REBUILD_SPEND_CAP_USD: process.env.EJECT_REBUILD_SPEND_CAP_USD,
  EJECT_GITHUB_TOKEN: process.env.EJECT_GITHUB_TOKEN,
  GITHUB_REPOSITORY: process.env.GITHUB_REPOSITORY,
  EJECT_DELIVER_RUNNER: process.env.EJECT_DELIVER_RUNNER,
};

function restoreEnv() {
  for (const [name, value] of Object.entries(saved)) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
  setDeliveryDepsForTests(null);
  resetOrderStoreForTests();
}

async function useFileStore() {
  const dir = await mkdtemp(path.join(tmpdir(), "eject-golive-"));
  process.env.ORDERS_STORE = "file";
  process.env.ORDERS_DIR = dir;
  delete process.env.VERCEL;
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  delete process.env.BLOB_READ_WRITE_TOKEN;
  delete process.env.POSTGRES_URL;
  delete process.env.DATABASE_URL;
  delete process.env.RESEND_API_KEY;
  delete process.env.RESEND_FROM;
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.LLM_API_KEY;
  delete process.env.EJECT_GITHUB_TOKEN;
  delete process.env.EJECT_DELIVER_RUNNER;
  resetOrderStoreForTests();
  return dir;
}

function signedWebhook(payload: string, secret: string, key: string) {
  const stripe = new Stripe(key, { apiVersion: "2025-02-24.acacia" });
  const signature = stripe.webhooks.generateTestHeaderString({ payload, secret });
  return new Request("http://localhost:3000/api/stripe/webhook", {
    method: "POST",
    headers: { "stripe-signature": signature },
    body: payload,
  });
}

function paidEvent(input: { id: string; livemode: boolean; siteUrl: string; email: string }) {
  return JSON.stringify({
    id: `evt_${input.id}`,
    object: "event",
    api_version: "2025-02-24.acacia",
    created: 1_700_000_000,
    livemode: input.livemode,
    type: "checkout.session.completed",
    data: {
      object: {
        id: input.id,
        object: "checkout.session",
        livemode: input.livemode,
        payment_status: "paid",
        amount_total: 9900,
        currency: "usd",
        customer_details: { email: input.email, name: "Neal" },
        metadata: { tier: "automated", siteUrl: input.siteUrl },
      },
    },
  });
}

const pageHtml = "<!doctype html><html><head><title>Studio</title></head><body><h1>Hello</h1></body></html>";

function siteFetch(sent: Array<{ to: string[]; subject: string; attachments?: Array<{ filename: string }> }>): typeof fetch {
  return async (input, init) => {
    const url = String(input);
    if (url.includes("api.resend.com")) {
      const body = JSON.parse(String(init?.body ?? "{}")) as { to: string[]; subject: string; attachments?: Array<{ filename: string }> };
      sent.push(body);
      return new Response(JSON.stringify({ id: "re_test" }), { status: 200, headers: { "content-type": "application/json" } });
    }
    if (url.includes("api.github.com")) {
      return new Response(null, { status: 204 });
    }
    if (url.includes("sitemap") || url.endsWith("/robots.txt")) return new Response("missing", { status: 404 });
    if (url.includes("example.com")) {
      return new Response(pageHtml, { status: 200, headers: { "content-type": "text/html" } });
    }
    return new Response("unexpected", { status: 500 });
  };
}

test("live keys and events stay off unless both switches are set", () => {
  const liveKey = `sk_live_${"a".repeat(24)}`;
  const testKey = `sk_test_${"b".repeat(24)}`;
  delete process.env.CHECKOUT_OPEN;
  delete process.env.EJECT_STRIPE_MODE;
  process.env.STRIPE_SECRET_KEY = liveKey;
  assert.equal(liveStripeAllowed(), false);
  assert.equal(getStripe(), null);
  assert.match(stripeConfigError() ?? "", /refused/);

  process.env.CHECKOUT_OPEN = "true";
  assert.equal(getStripe(), null);
  process.env.EJECT_STRIPE_MODE = "live";
  delete process.env.CHECKOUT_OPEN;
  assert.equal(getStripe(), null);

  process.env.CHECKOUT_OPEN = "true";
  process.env.EJECT_STRIPE_MODE = "live";
  assert.equal(liveStripeAllowed(), true);
  assert.equal(stripeConfigError(), null);
  assert.ok(getStripe());

  process.env.STRIPE_SECRET_KEY = testKey;
  assert.equal(liveStripeAllowed(), false);
  assert.ok(getStripe());
  assert.equal(stripeConfigError(), null);
  restoreEnv();
});

test("store uses KV or Upstash when configured and warns on Vercel without one", () => {
  delete process.env.ORDERS_STORE;
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  delete process.env.BLOB_READ_WRITE_TOKEN;
  delete process.env.POSTGRES_URL;
  delete process.env.DATABASE_URL;
  delete process.env.VERCEL;
  assert.equal(resolveStorePlan().kind, "file");
  assert.equal(resolveStorePlan().durable, true);
  assert.equal(opsStoreWarning(), null);

  process.env.VERCEL = "1";
  assert.match(opsStoreWarning() ?? "", /KV_REST_API_URL/);
  assert.match(opsStoreWarning() ?? "", /UPSTASH_REDIS_REST_URL/);

  process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
  process.env.UPSTASH_REDIS_REST_TOKEN = "token";
  assert.equal(resolveStorePlan().kind, "kv");
  assert.equal(resolveStorePlan().durable, true);
  assert.equal(opsStoreWarning(), null);

  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  process.env.KV_REST_API_URL = "https://kv.example.test";
  process.env.KV_REST_API_TOKEN = "token";
  assert.equal(resolveStorePlan().kind, "kv");
  assert.equal(opsStoreWarning(), null);

  process.env.EJECT_GITHUB_TOKEN = "dispatch-test-token";
  process.env.GITHUB_REPOSITORY = "acme/eject";
  process.env.EJECT_GITHUB_REF = "main/../../etc";
  assert.equal(githubDeliveryConfig(), null);
  process.env.EJECT_GITHUB_REF = "main";
  assert.equal(githubDeliveryConfig()?.ref, "main");
  restoreEnv();
});

test("KV REST store round-trips an order", async () => {
  const dir = await useFileStore();
  const memory = new Map<string, string>();
  const sets = new Map<string, Set<string>>();
  const original = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (!url.startsWith("https://kv.example.test")) return original(input, init);
    const command = JSON.parse(String(init?.body ?? "[]")) as string[];
    const [op, key, arg] = command;
    if (op === "SET") {
      memory.set(key, arg ?? "");
      return Response.json({ result: "OK" });
    }
    if (op === "GET") return Response.json({ result: memory.get(key) ?? null });
    if (op === "SADD") {
      const set = sets.get(key) ?? new Set<string>();
      set.add(arg ?? "");
      sets.set(key, set);
      return Response.json({ result: 1 });
    }
    if (op === "SMEMBERS") return Response.json({ result: [...(sets.get(key) ?? [])] });
    return Response.json({ result: null });
  };
  try {
    delete process.env.ORDERS_STORE;
    process.env.KV_REST_API_URL = "https://kv.example.test";
    process.env.KV_REST_API_TOKEN = "token";
    resetOrderStoreForTests();
    const created = await getOrderStore().create({
      tier: "automated",
      testMode: "stripe_test",
      amountCents: 9900,
      currency: "usd",
      email: "buyer@example.com",
    });
    assert.equal(getOrderStore().kind, "kv");
    assert.equal(getOrderStore().durable, true);
    resetOrderStoreForTests();
    const loaded = await getOrderStore().get(created.id);
    assert.equal(loaded?.email, "buyer@example.com");
    assert.equal(loaded?.livemode, false);
  } finally {
    globalThis.fetch = original;
    await rm(dir, { recursive: true, force: true });
    restoreEnv();
  }
});

test("webhook to delivered email, with the queue visible on ops status", async () => {
  const dir = await useFileStore();
  const written: string[] = [];
  const sent: Array<{ to: string[]; subject: string; text?: string; attachments?: Array<{ filename: string; content: string }> }> = [];
  let llmCalls = 0;
  const key = `sk_test_${"b".repeat(24)}`;
  const secret = `whsec_${"c".repeat(24)}`;
  try {
    process.env.CHECKOUT_OPEN = "true";
    process.env.EJECT_STRIPE_MODE = "stripe_test";
    process.env.STRIPE_SECRET_KEY = key;
    process.env.STRIPE_WEBHOOK_SECRET = secret;
    const payload = paidEvent({ id: "cs_test_e2e", livemode: false, siteUrl: "https://example.com", email: "buyer@example.com" });
    const response = await webhook(signedWebhook(payload, secret, key));
    assert.equal(response.status, 200);
    const body = (await response.json()) as { orderId?: string; delivery?: string };
    assert.equal(body.delivery, "queued");
    const queued = await getOrderStore().get(body.orderId!);
    assert.equal(queued?.status, "paid");
    assert.equal(queued?.livemode, false);
    assert.equal(queued?.deliveryJob?.state, "queued");

    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM = "Eject <hi@example.com>";
    process.env.LEAD_NOTIFICATION_TO = "ops@example.com";
    process.env.CRON_SECRET = "cron-test";
    process.env.LLM_PROVIDER = "openai-compat";
    process.env.LLM_BASE_URL = "https://api.deepseek.com";
    process.env.LLM_API_KEY = "llm-test";
    process.env.LLM_MODEL = "deepseek-flash";
    process.env.EJECT_REBUILD_SPEND_CAP_USD = "2";
    setDeliveryDepsForTests({
      now: () => 1_700_000_000_000,
      lookupFn: async () => ["1.1.1.1"],
      llmChat: async () => {
        llmCalls += 1;
        return { text: "export default function Page(){return null}", usage: { inputTokens: 12, outputTokens: 8, stopReason: "end" } };
      },
      fetchImpl: async (input, init) => {
        const url = String(input);
        if (url.includes("api.resend.com")) {
          const mail = JSON.parse(String(init?.body ?? "{}")) as (typeof sent)[number];
          sent.push(mail);
          return new Response(JSON.stringify({ id: "re_test" }), { status: 200, headers: { "content-type": "application/json" } });
        }
        return siteFetch([])(input, init);
      },
    });

    const cron = await deliverCron(new Request("http://localhost:3000/api/cron/deliver-orders", { headers: { authorization: "Bearer cron-test" } }));
    assert.equal(cron.status, 200);
    const cronBody = (await cron.json()) as { results: Array<{ state: string }> };
    assert.equal(cronBody.results[0]?.state, "delivered");
    assert.equal(llmCalls, 1);

    const delivered = await getOrderStore().get(body.orderId!);
    assert.equal(delivered?.status, "delivered");
    assert.equal(delivered?.deliveryJob?.llm, "ran");
    assert.ok(delivered?.delivery?.repoFiles.some((file) => file.path === "index.html"));
    assert.ok(delivered?.delivery?.repoFiles.some((file) => file.path === "rebuild/page.tsx"));
    written.push(deliveryDirFor(delivered!.id));

    const customer = sent.find((mail) => mail.to[0] === "buyer@example.com");
    const notice = sent.find((mail) => mail.to[0] === "ops@example.com");
    assert.match(customer?.subject ?? "", /ready/);
    assert.match(customer?.attachments?.[0]?.filename ?? "", /\.zip$/);
    assert.ok(Buffer.from(customer?.attachments?.[0]?.content ?? "", "base64").subarray(0, 2).equals(Buffer.from("PK")));
    assert.match(notice?.subject ?? "", /Delivered/);

    const status = buildOpsStatus(await getOrderStore().list());
    assert.equal(status.queue[0]?.state, "delivered");
    assert.equal(status.queue[0]?.id, body.orderId);
    assert.equal(status.warning, null);
  } finally {
    await rm(dir, { recursive: true, force: true });
    for (const folder of written) await rm(folder, { recursive: true, force: true });
    restoreEnv();
  }
});

test("model rebuild is skipped when the estimate is over the cap, and static delivery still emails", async () => {
  const dir = await useFileStore();
  const written: string[] = [];
  let llmCalls = 0;
  const key = `sk_test_${"d".repeat(24)}`;
  const secret = `whsec_${"e".repeat(24)}`;
  try {
    process.env.CHECKOUT_OPEN = "true";
    process.env.EJECT_STRIPE_MODE = "stripe_test";
    process.env.STRIPE_SECRET_KEY = key;
    process.env.STRIPE_WEBHOOK_SECRET = secret;
    process.env.LLM_PROVIDER = "openai-compat";
    process.env.LLM_BASE_URL = "https://api.deepseek.com";
    process.env.LLM_API_KEY = "llm-test";
    process.env.LLM_MODEL = "deepseek-flash";
    process.env.EJECT_REBUILD_SPEND_CAP_USD = "0";
    assert.equal(llmRebuildDecision(1).action, "skip_cap");
    const payload = paidEvent({ id: "cs_test_cap", livemode: false, siteUrl: "https://example.com/cap", email: "buyer@example.com" });
    const response = await webhook(signedWebhook(payload, secret, key));
    const body = (await response.json()) as { orderId?: string };
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM = "Eject <hi@example.com>";
    process.env.LEAD_NOTIFICATION_TO = "ops@example.com";
    setDeliveryDepsForTests({
      now: () => 1_700_000_000_000,
      lookupFn: async () => ["1.1.1.1"],
      llmChat: async () => {
        llmCalls += 1;
        return { text: "nope", usage: { inputTokens: 1, outputTokens: 1, stopReason: "end" } };
      },
      fetchImpl: siteFetch([]),
    });
    const run = await processDeliveryQueue();
    assert.equal(run.results[0]?.state, "delivered");
    assert.equal(llmCalls, 0);
    const order = await getOrderStore().get(body.orderId!);
    assert.equal(order?.deliveryJob?.llm, "over_cap");
    written.push(deliveryDirFor(order!.id));
  } finally {
    await rm(dir, { recursive: true, force: true });
    for (const folder of written) await rm(folder, { recursive: true, force: true });
    restoreEnv();
  }
});

test("delivery cron retries then alerts, and refuses a missing secret", async () => {
  const dir = await useFileStore();
  const sent: Array<{ to: string[]; subject: string }> = [];
  let now = 1_700_000_000_000;
  try {
    delete process.env.CRON_SECRET;
    const open = await deliverCron(new Request("http://localhost:3000/api/cron/deliver-orders"));
    const openBody = (await open.json()) as { skipped?: string };
    assert.equal(openBody.skipped, "CRON_SECRET not set");
    process.env.CRON_SECRET = "cron-test";
    const denied = await deliverCron(new Request("http://localhost:3000/api/cron/deliver-orders", { headers: { authorization: "Bearer wrong" } }));
    assert.equal(denied.status, 401);

    const store = getOrderStore();
    const order = await store.create({
      tier: "automated",
      testMode: "stripe_test",
      amountCents: 9900,
      currency: "usd",
      email: "buyer@example.com",
      siteUrl: "https://example.com/fail",
    });
    await store.update(order.id, {
      status: "paid",
      deliveryJob: { state: "queued", attempts: 0, enqueuedAt: new Date(now).toISOString(), updatedAt: new Date(now).toISOString(), llm: "unset" },
    });
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM = "Eject <hi@example.com>";
    process.env.LEAD_NOTIFICATION_TO = "ops@example.com";
    delete process.env.LLM_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    setDeliveryDepsForTests({
      now: () => now,
      lookupFn: async () => ["1.1.1.1"],
      fetchImpl: async (input, init) => {
        const url = String(input);
        if (url.includes("api.resend.com")) {
          sent.push(JSON.parse(String(init?.body ?? "{}")) as { to: string[]; subject: string });
          return new Response(JSON.stringify({ id: "re_fail" }), { status: 200, headers: { "content-type": "application/json" } });
        }
        return new Response("nope", { status: 500 });
      },
    });
    await processDeliveryQueue();
    now += 120_000;
    await processDeliveryQueue();
    now += 6 * 60_000;
    await processDeliveryQueue();
    const failed = await getOrderStore().get(order.id);
    assert.equal(failed?.deliveryJob?.state, "failed");
    assert.equal(failed?.deliveryJob?.attempts, 3);
    assert.match(sent.find((mail) => mail.to[0] === "ops@example.com")?.subject ?? "", /failed/i);
    assert.equal(sent.some((mail) => mail.to[0] === "buyer@example.com"), false);
  } finally {
    await rm(dir, { recursive: true, force: true });
    restoreEnv();
  }
});

test("on Vercel the queue dispatches GitHub Actions and does not crawl", async () => {
  const dir = await useFileStore();
  let crawled = false;
  let dispatchUrl = "";
  let dispatchBody = "";
  try {
    process.env.VERCEL = "1";
    process.env.EJECT_GITHUB_TOKEN = "dispatch-test-token";
    process.env.GITHUB_REPOSITORY = "acme/eject";
    process.env.CRON_SECRET = "cron-test";
    assert.equal(deliveryRunner(), "github");
    assert.ok(githubDeliveryConfig());
    const store = getOrderStore();
    const order = await store.create({
      tier: "automated",
      testMode: "stripe_test",
      amountCents: 9900,
      currency: "usd",
      email: "buyer@example.com",
      siteUrl: "https://example.com",
    });
    await store.update(order.id, {
      status: "paid",
      deliveryJob: { state: "queued", attempts: 0, enqueuedAt: new Date().toISOString(), updatedAt: new Date().toISOString(), llm: "unset" },
    });
    setDeliveryDepsForTests({
      lookupFn: async () => {
        crawled = true;
        return ["1.1.1.1"];
      },
      fetchImpl: async (input, init) => {
        dispatchUrl = String(input);
        dispatchBody = String(init?.body ?? "");
        const header = new Headers(init?.headers).get("authorization") ?? "";
        assert.equal(header, "Bearer dispatch-test-token");
        return new Response(null, { status: 204 });
      },
    });
    const cron = await deliverCron(new Request("http://localhost:3000/api/cron/deliver-orders", { headers: { authorization: "Bearer cron-test" } }));
    const body = (await cron.json()) as { runner: string; warning: string | null; results: Array<{ state: string }> };
    assert.equal(body.runner, "github");
    assert.match(body.warning ?? "", /KV_REST_API_URL/);
    assert.equal(body.results[0]?.state, "dispatched");
    assert.equal(crawled, false);
    assert.match(dispatchUrl, /\/repos\/acme\/eject\/actions\/workflows\/deliver-order\.yml\/dispatches$/);
    assert.equal(JSON.parse(dispatchBody).inputs.order_id, order.id);
    const updated = await getOrderStore().get(order.id);
    assert.equal(updated?.deliveryJob?.state, "dispatched");
    assert.equal(updated?.deliveryJob?.runner, "github");

    const ops = buildOpsStatus(await getOrderStore().list());
    assert.match(ops.warning ?? "", /No durable order store/);
    assert.equal(ops.queue[0]?.state, "dispatched");
  } finally {
    await rm(dir, { recursive: true, force: true });
    restoreEnv();
  }
});

test("closed checkout ignores a signed test event and live events stay refused", async () => {
  const dir = await useFileStore();
  const key = `sk_test_${"f".repeat(24)}`;
  const secret = `whsec_${"g".repeat(24)}`;
  try {
    process.env.STRIPE_SECRET_KEY = key;
    process.env.STRIPE_WEBHOOK_SECRET = secret;
    process.env.EJECT_STRIPE_MODE = "stripe_test";
    delete process.env.CHECKOUT_OPEN;
    const ignored = await webhook(signedWebhook(paidEvent({ id: "cs_test_closed", livemode: false, siteUrl: "https://example.com", email: "buyer@example.com" }), secret, key));
    const ignoredBody = (await ignored.json()) as { ignored?: boolean };
    assert.equal(ignored.status, 200);
    assert.equal(ignoredBody.ignored, true);
    assert.equal((await getOrderStore().list()).length, 0);

    const live = await webhook(signedWebhook(paidEvent({ id: "cs_test_still_live", livemode: true, siteUrl: "https://example.com", email: "buyer@example.com" }), secret, key));
    assert.equal(live.status, 400);
    process.env.CHECKOUT_OPEN = "true";
    process.env.EJECT_STRIPE_MODE = "live";
    const stillTestKey = await webhook(signedWebhook(paidEvent({ id: "cs_test_flags_only", livemode: true, siteUrl: "https://example.com", email: "buyer@example.com" }), secret, key));
    assert.equal(stillTestKey.status, 400);
    assert.equal((await getOrderStore().list()).length, 0);

    const liveKey = `sk_live_${"h".repeat(24)}`;
    process.env.STRIPE_SECRET_KEY = liveKey;
    const accepted = await webhook(signedWebhook(paidEvent({ id: "cs_live_ok", livemode: true, siteUrl: "https://example.com", email: "buyer@example.com" }), secret, liveKey));
    assert.equal(accepted.status, 200);
    const acceptedBody = (await accepted.json()) as { orderId?: string };
    const order = await getOrderStore().get(acceptedBody.orderId!);
    assert.equal(order?.livemode, true);
    assert.equal(order?.testMode, "stripe_live");
    assert.equal(order?.deliveryJob?.state, "queued");
  } finally {
    await rm(dir, { recursive: true, force: true });
    restoreEnv();
  }
});

test("a missing site URL stays queued and intake resumes delivery", async () => {
  const dir = await useFileStore();
  const written: string[] = [];
  const sent: Array<{ to: string[]; subject: string; attachments?: Array<{ filename: string }> }> = [];
  try {
    const store = getOrderStore();
    const waiting = await store.create({
      tier: "automated",
      testMode: "stripe_test",
      amountCents: 9900,
      currency: "usd",
      email: "buyer@example.com",
    });
    const queuedAt = new Date().toISOString();
    await store.update(waiting.id, {
      status: "paid",
      token: "tok_waiting_site",
      emails: { delivery: "2020-01-01T00:00:00.000Z" },
      deliveryJob: { state: "queued", attempts: 0, enqueuedAt: queuedAt, updatedAt: queuedAt, llm: "unset" },
    });
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM = "Eject <hi@example.com>";
    process.env.LEAD_NOTIFICATION_TO = "ops@example.com";
    delete process.env.LLM_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    setDeliveryDepsForTests({
      now: () => 1_700_000_000_000,
      lookupFn: async () => ["1.1.1.1"],
      fetchImpl: siteFetch(sent),
    });
    const held = await processDeliveryQueue();
    assert.equal(held.results[0]?.state, "queued");
    assert.equal(held.results[0]?.error, WAITING_FOR_SITE_URL);
    const parked = await store.get(waiting.id);
    assert.equal(parked?.deliveryJob?.state, "queued");
    assert.equal(parked?.deliveryJob?.attempts, 0);
    assert.equal((await processDeliveryQueue()).results.length, 0);

    const intake = await runPaidIntake("tok_waiting_site", "https://example.com/studio", {
      lookupFn: async () => ["1.1.1.1"],
      fetchImpl: siteFetch(sent),
    });
    assert.equal(intake.ok, true);
    const resumed = await store.get(waiting.id);
    assert.equal(resumed?.deliveryJob?.state, "queued");
    assert.equal(resumed?.deliveryJob?.lastError, undefined);
    assert.match(resumed?.siteUrl ?? "", /example\.com/);

    const run = await processDeliveryQueue();
    assert.equal(run.results[0]?.state, "delivered");
    const customer = sent.find((mail) => mail.to[0] === "buyer@example.com" && mail.attachments?.length);
    assert.match(customer?.attachments?.[0]?.filename ?? "", /\.zip$/);
    written.push(deliveryDirFor(waiting.id));
  } finally {
    await rm(dir, { recursive: true, force: true });
    for (const folder of written) await rm(folder, { recursive: true, force: true });
    restoreEnv();
  }
});

test("parallel kickDelivery dispatches GitHub once", async () => {
  const dir = await useFileStore();
  let dispatches = 0;
  try {
    process.env.VERCEL = "1";
    process.env.EJECT_GITHUB_TOKEN = "dispatch-test-token";
    process.env.GITHUB_REPOSITORY = "acme/eject";
    const store = getOrderStore();
    const created = await store.create({
      tier: "automated",
      testMode: "stripe_test",
      amountCents: 9900,
      currency: "usd",
      email: "buyer@example.com",
      siteUrl: "https://example.com",
    });
    const now = new Date().toISOString();
    const order = await store.update(created.id, {
      status: "paid",
      deliveryJob: { state: "queued", attempts: 0, enqueuedAt: now, updatedAt: now, llm: "unset" },
    });
    setDeliveryDepsForTests({
      fetchImpl: async (input) => {
        if (!String(input).includes("api.github.com")) return new Response("no", { status: 500 });
        dispatches += 1;
        await new Promise((resolve) => setTimeout(resolve, 40));
        return new Response(null, { status: 204 });
      },
    });
    await Promise.all([kickDelivery(order), kickDelivery(order)]);
    assert.equal(dispatches, 1);
    const saved = await store.get(order.id);
    assert.equal(saved?.deliveryJob?.state, "dispatched");
    assert.equal(saved?.deliveryJob?.attempts, 1);
  } finally {
    await rm(dir, { recursive: true, force: true });
    restoreEnv();
  }
});

test("KV compareAndUpdate lets one caller claim the order", async () => {
  const memory = new Map<string, string>();
  const sets = new Map<string, Set<string>>();
  const original = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (!url.startsWith("https://kv.example.test")) return original(input, init);
    const command = JSON.parse(String(init?.body ?? "[]")) as string[];
    const [op, key, arg] = command;
    if (op === "SET") {
      if (command.includes("NX") && memory.has(key)) return Response.json({ result: null });
      memory.set(key, arg ?? "");
      return Response.json({ result: "OK" });
    }
    if (op === "GET") return Response.json({ result: memory.has(key) ? memory.get(key) : null });
    if (op === "DEL") {
      memory.delete(key);
      return Response.json({ result: 1 });
    }
    if (op === "SADD") {
      const set = sets.get(key) ?? new Set<string>();
      set.add(arg ?? "");
      sets.set(key, set);
      return Response.json({ result: 1 });
    }
    if (op === "SMEMBERS") return Response.json({ result: [...(sets.get(key) ?? [])] });
    return Response.json({ result: null });
  };
  try {
    delete process.env.ORDERS_STORE;
    delete process.env.VERCEL;
    process.env.KV_REST_API_URL = "https://kv.example.test";
    process.env.KV_REST_API_TOKEN = "token";
    resetOrderStoreForTests();
    const store = getOrderStore();
    const created = await store.create({
      tier: "automated",
      testMode: "stripe_test",
      amountCents: 9900,
      currency: "usd",
      email: "buyer@example.com",
      siteUrl: "https://example.com",
    });
    const now = new Date().toISOString();
    const job = { state: "queued" as const, attempts: 0, enqueuedAt: now, updatedAt: now, llm: "unset" as const };
    await store.update(created.id, { status: "paid", deliveryJob: job });
    memory.set(`eject:deliver-lock:${created.id}`, "held");
    const blocked = await store.compareAndUpdate(created.id, { deliveryState: "queued", attempts: 0 }, {
      deliveryJob: { ...job, state: "dispatched", attempts: 1, updatedAt: now },
    });
    assert.equal(blocked, null);
    assert.equal((await store.get(created.id))?.deliveryJob?.state, "queued");
    memory.delete(`eject:deliver-lock:${created.id}`);
    const [first, second] = await Promise.all([
      store.compareAndUpdate(created.id, { deliveryState: "queued", attempts: 0 }, {
        deliveryJob: { ...job, state: "dispatched", attempts: 1, runner: "github", updatedAt: now },
      }),
      store.compareAndUpdate(created.id, { deliveryState: "queued", attempts: 0 }, {
        deliveryJob: { ...job, state: "dispatched", attempts: 1, runner: "github", updatedAt: now },
      }),
    ]);
    assert.equal([first, second].filter(Boolean).length, 1);
    assert.equal((await store.get(created.id))?.deliveryJob?.attempts, 1);
    assert.equal((await store.get(created.id))?.deliveryJob?.state, "dispatched");
  } finally {
    globalThis.fetch = original;
    restoreEnv();
  }
});

test("a shopify crawl is not packaged", async () => {
  const dir = await useFileStore();
  const snapshot = await mkdtemp(path.join(tmpdir(), "eject-snap-"));
  const sent: Array<{ to: string[]; subject: string; attachments?: Array<{ filename?: string }> }> = [];
  try {
    await mkdir(path.join(snapshot, "pages"), { recursive: true });
    await writeFile(
      path.join(snapshot, "pages", "_root.json"),
      JSON.stringify({
        url: "https://shop.example",
        html: "<html><script src='https://cdn.shopify.com/shopify.js'></script><a href='/cart'>Cart</a></html>",
      }),
    );
    const store = getOrderStore();
    const created = await store.create({
      tier: "automated",
      testMode: "stripe_test",
      amountCents: 9900,
      currency: "usd",
      email: "buyer@example.com",
      siteUrl: "https://shop.example",
    });
    const now = new Date().toISOString();
    const order = await store.update(created.id, {
      status: "paid",
      deliveryJob: { state: "running", attempts: 1, enqueuedAt: now, updatedAt: now, llm: "unset", runner: "github" },
    });
    const plain = await scoreCrawledSnapshot(snapshot, { ...order, siteUrl: "https://shop.example" });
    assert.equal(plain?.eligibility, "NOT_ELIGIBLE");
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM = "Eject <hi@example.com>";
    process.env.LEAD_NOTIFICATION_TO = "ops@example.com";
    const gate = await gateCrawledDelivery(order, snapshot, "https://shop.example", async (input, init) => {
      if (String(input).includes("api.resend.com")) {
        sent.push(JSON.parse(String(init?.body ?? "{}")) as (typeof sent)[number]);
        return new Response(JSON.stringify({ id: "re_test" }), { status: 200, headers: { "content-type": "application/json" } });
      }
      return new Response("no", { status: 500 });
    });
    assert.equal(gate.ok, false);
    if (!gate.ok) assert.equal(gate.reason, "not eligible");
    const saved = await store.get(order.id);
    assert.equal(saved?.status, "refund_recommended");
    assert.equal(saved?.deliveryJob?.state, "skipped");
    assert.equal(saved?.deliveryJob?.lastError, "not eligible");
    assert.equal(sent.some((mail) => mail.attachments?.length), false);
  } finally {
    await rm(dir, { recursive: true, force: true });
    await rm(snapshot, { recursive: true, force: true });
    restoreEnv();
  }
});

test("intake leaves an in-flight delivery job alone", async () => {
  const dir = await useFileStore();
  const written: string[] = [];
  try {
    const store = getOrderStore();
    const created = await store.create({
      tier: "automated",
      testMode: "stripe_test",
      amountCents: 9900,
      currency: "usd",
      email: "buyer@example.com",
      siteUrl: "https://example.com",
    });
    const now = new Date().toISOString();
    await store.update(created.id, {
      status: "paid",
      token: "tok_inflight",
      deliveryJob: { state: "dispatched", attempts: 1, enqueuedAt: now, updatedAt: now, llm: "unset", runner: "github" },
    });
    const intake = await runPaidIntake("tok_inflight", "https://example.com/studio", {
      lookupFn: async () => ["1.1.1.1"],
      fetchImpl: siteFetch([]),
    });
    assert.equal(intake.ok, true);
    const saved = await store.get(created.id);
    assert.equal(saved?.deliveryJob?.state, "dispatched");
    assert.equal(saved?.deliveryJob?.attempts, 1);
    assert.equal(saved?.status, "paid");
    written.push(deliveryDirFor(created.id));
  } finally {
    await rm(dir, { recursive: true, force: true });
    for (const folder of written) await rm(folder, { recursive: true, force: true });
    restoreEnv();
  }
});

test("a crashed package send can be claimed again after it goes stale", async () => {
  const dir = await useFileStore();
  const written: string[] = [];
  try {
    const store = getOrderStore();
    const created = await store.create({
      tier: "automated",
      testMode: "stripe_test",
      amountCents: 9900,
      currency: "usd",
      email: "buyer@example.com",
      siteUrl: "https://example.com",
    });
    const now = new Date().toISOString();
    await store.update(created.id, {
      status: "paid",
      emails: { package: `sending:${now}` },
      deliveryJob: { state: "running", attempts: 1, enqueuedAt: now, updatedAt: now, llm: "unset", runner: "inprocess" },
    });
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM = "Eject <hi@example.com>";
    await assert.rejects(
      finishDeliveredOrder(created.id, {
        repoFiles: [{ path: "index.html", contents: "<h1>Hi</h1>" }],
        note: "package",
        siteUrl: "https://example.com",
        llm: "unset",
        fetchImpl: async () => new Response(JSON.stringify({ id: "re_test" }), { status: 200, headers: { "content-type": "application/json" } }),
      }),
      /already in progress/,
    );
    assert.equal((await store.get(created.id))?.status, "paid");
    const stale = new Date(Date.now() - 3 * 60 * 1000).toISOString();
    await store.update(created.id, { emails: { package: `sending:${stale}` } });
    const delivered = await finishDeliveredOrder(created.id, {
      repoFiles: [{ path: "index.html", contents: "<h1>Hi</h1>" }],
      note: "package",
      siteUrl: "https://example.com",
      llm: "unset",
      fetchImpl: async () => new Response(JSON.stringify({ id: "re_test" }), { status: 200, headers: { "content-type": "application/json" } }),
    });
    assert.equal(delivered.status, "delivered");
    assert.match(delivered.emails?.package ?? "", /^\d{4}-/);
    written.push(deliveryDirFor(created.id));
  } finally {
    await rm(dir, { recursive: true, force: true });
    for (const folder of written) await rm(folder, { recursive: true, force: true });
    restoreEnv();
  }
});

test("crawl score counts discovered pages and measured scripts", async () => {
  const snapshot = await mkdtemp(path.join(tmpdir(), "eject-score-"));
  try {
    await mkdir(path.join(snapshot, "pages"), { recursive: true });
    const page = { url: "https://example.com/", html: "<html><body><h1>Hello</h1></body></html>" };
    await writeFile(path.join(snapshot, "pages", "_root.json"), JSON.stringify(page));
    const order = { siteUrl: "https://example.com/", tier: "automated" as const, amountCents: 9900 };
    await writeFile(path.join(snapshot, "discovery.json"), JSON.stringify({ crawledPageCount: 1, discoveredPageCount: 11 }));
    const wide = await scoreCrawledSnapshot(snapshot, order);
    assert.equal(wide?.eligibility, "NOT_ELIGIBLE");
    assert.ok((wide?.pageCount ?? 0) > 10);
    await writeFile(path.join(snapshot, "discovery.json"), JSON.stringify({ crawledPageCount: 1, discoveredPageCount: 1 }));
    await writeFile(path.join(snapshot, "scripts.json"), JSON.stringify({ items: [{ url: "https://cdn.example/app.js", bytes: 4_000_000 }] }));
    const heavy = await scoreCrawledSnapshot(snapshot, order);
    assert.equal(heavy?.eligibility, "NOT_ELIGIBLE");
    assert.ok((heavy?.scriptBytes ?? 0) > 3_000_000);
  } finally {
    await rm(snapshot, { recursive: true, force: true });
  }
});

test("intake stops a queued order when the site is not eligible", async () => {
  const dir = await useFileStore();
  try {
    const store = getOrderStore();
    const created = await store.create({
      tier: "automated",
      testMode: "stripe_test",
      amountCents: 9900,
      currency: "usd",
      email: "buyer@example.com",
      siteUrl: "https://shop.example",
    });
    const now = new Date().toISOString();
    await store.update(created.id, {
      status: "paid",
      token: "tok_shop",
      deliveryJob: { state: "queued", attempts: 0, enqueuedAt: now, updatedAt: now, llm: "unset" },
    });
    const shopHtml = "<html><script src='https://cdn.shopify.com/shopify.js'></script><a href='/cart'>Cart</a></html>";
    const intake = await runPaidIntake("tok_shop", "https://shop.example", {
      lookupFn: async () => ["1.1.1.1"],
      fetchImpl: async (input) => {
        const url = String(input);
        if (url.includes("sitemap") || url.endsWith("/robots.txt")) return new Response("missing", { status: 404 });
        return new Response(shopHtml, { status: 200, headers: { "content-type": "text/html" } });
      },
    });
    assert.equal(intake.ok, true);
    const saved = await store.get(created.id);
    assert.equal(saved?.status, "refund_recommended");
    assert.equal(saved?.deliveryJob?.state, "skipped");
    assert.equal(saved?.deliveryJob?.lastError, "not eligible");
    assert.equal((await processDeliveryQueue()).results.length, 0);
  } finally {
    await rm(dir, { recursive: true, force: true });
    restoreEnv();
  }
});

test("discovered page count keeps a failed overflow URL", () => {
  const captured = Array.from({ length: 10 }, (_, index) => `https://example.com/${index || ""}`);
  const failed = "https://example.com/overflow";
  assert.equal(discoveredPageCount([captured, [failed], []]), 11);
  assert.equal(discoveredPageCount([["https://example.com/"], captured, []]), 10);
});

test("zip store writes a PK archive of the named file", () => {
  const archive = zipStore([{ path: "index.html", contents: Buffer.from("<h1>Hi</h1>") }]);
  assert.equal(archive.subarray(0, 2).toString(), "PK");
  assert.ok(archive.includes(Buffer.from("index.html")));
  assert.ok(archive.includes(Buffer.from("<h1>Hi</h1>")));
  const skipped = zipStore([{ path: "../secrets.env", contents: Buffer.from("nope") }]);
  assert.equal(skipped.includes(Buffer.from("secrets.env")), false);
});
