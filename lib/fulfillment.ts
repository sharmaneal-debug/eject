import { buildDelivery, deliveryDirFor, materializeDelivery } from "./delivery";
import { analyzeSnapshot } from "./complexity";
import { crawlSite, type CrawlDeps } from "./http-crawl";
import { getOrderStore, newOrderToken, type Order } from "./orders";
import { SsrfError } from "./ssrf";
import { getStripe, normalizeTier, tierConfig, type Tier } from "./stripe";
import { isMockSessionId } from "./checkout";
import { conciergeKickoffEmail, deliveryEmail, expressKickoffEmail, intakeReceivedEmail, refundFollowupEmail, sendEmail, sendPaidLeadNotification } from "./email";
import { logLead } from "./leads";
import { siteConfig } from "./site";

export function publicOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url).replace(/\/$/, "");
}

export function intakeUrlFor(origin: string, token: string): string {
  return `${origin.replace(/\/$/, "")}/intake?token=${encodeURIComponent(token)}`;
}

type PaidSession = {
  id: string;
  livemode?: boolean | null;
  payment_status?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  customer_email?: string | null;
  customer_details?: { email?: string | null; name?: string | null } | null;
  metadata?: { tier?: string | null; siteUrl?: string | null; orderId?: string | null } | null;
};

export async function markOrderPaidFromSession(session: PaidSession): Promise<Order> {
  if (session.livemode) {
    throw new Error("live mode payments are refused");
  }
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
    throw new Error("session is not paid");
  }
  const store = getOrderStore();
  const tier: Tier = normalizeTier(session.metadata?.tier) ?? "automated";
  const existing =
    (session.metadata?.orderId ? await store.get(session.metadata.orderId) : null) ??
    (await store.getBySession(session.id));
  const email = session.customer_details?.email || session.customer_email || existing?.email;
  const name = session.customer_details?.name || existing?.name;
  const amountCents = typeof session.amount_total === "number" ? session.amount_total : existing?.amountCents ?? tierConfig(tier).price * 100;

  if (!existing) {
    const created = await store.create({
      tier,
      siteUrl: session.metadata?.siteUrl || undefined,
      email: email || undefined,
      name: name || undefined,
      testMode: "stripe_test",
      amountCents,
      currency: session.currency || "usd",
    });
    return store.update(created.id, {
      status: "paid",
      paidAt: new Date().toISOString(),
      token: newOrderToken(),
      stripeSessionId: session.id,
      livemode: false,
    });
  }

  if (existing.status === "pending") {
    return store.update(existing.id, {
      status: "paid",
      paidAt: existing.paidAt ?? new Date().toISOString(),
      token: existing.token ?? newOrderToken(),
      stripeSessionId: session.id,
      email: email || existing.email,
      name: name || existing.name,
      siteUrl: existing.siteUrl || session.metadata?.siteUrl || undefined,
      amountCents,
      currency: session.currency || existing.currency,
      livemode: false,
    });
  }

  return store.update(existing.id, {
    email: email || existing.email,
    name: name || existing.name,
    stripeSessionId: existing.stripeSessionId || session.id,
  });
}

export async function markMockOrderPaid(orderId: string): Promise<Order> {
  if (process.env.EJECT_STRIPE_MODE !== "mock") {
    throw new Error("mock checkout is disabled");
  }
  const store = getOrderStore();
  const existing = await store.get(orderId);
  if (!existing || existing.testMode !== "mock") throw new Error("mock order not found");
  if (existing.livemode) throw new Error("live mode payments are refused");
  const sessionId = existing.stripeSessionId || `cs_test_mock_${existing.id}`;
  if (existing.status === "pending") {
    return store.update(existing.id, {
      status: "paid",
      paidAt: new Date().toISOString(),
      token: existing.token ?? newOrderToken(),
      stripeSessionId: sessionId,
      livemode: false,
    });
  }
  return existing;
}

export async function sendKickoffOnce(order: Order, origin = publicOrigin()): Promise<Order> {
  if (order.kickoffSentAt || order.kickoffAttemptedAt || !order.token) return order;
  const store = getOrderStore();
  const attempted = await store.update(order.id, { kickoffAttemptedAt: new Date().toISOString() });
  if (!attempted.email) {
    return store.update(order.id, { kickoffSkipReason: "no customer email" });
  }
  const intakeUrl = intakeUrlFor(origin, attempted.token!);
  const template =
    attempted.tier === "done_for_you"
      ? conciergeKickoffEmail({ name: attempted.name || "", siteUrl: attempted.siteUrl || "your site", intakeUrl })
      : expressKickoffEmail({ name: attempted.name || "", siteUrl: attempted.siteUrl || "your site", intakeUrl });
  const result = await sendEmail({ to: attempted.email, ...template });
  await sendPaidLeadNotification({
    name: attempted.name || "",
    email: attempted.email,
    tier: attempted.tier,
    siteUrl: attempted.siteUrl || "",
    amount: attempted.amountCents / 100,
    stripeSessionId: attempted.stripeSessionId,
  });
  await logLead({
    event: "checkout_paid",
    data: {
      orderId: attempted.id,
      tier: attempted.tier,
      siteUrl: attempted.siteUrl ?? "",
      email: attempted.email,
      amountPaid: attempted.amountCents / 100,
      kickoffEmailSent: result.ok,
      kickoffEmailError: result.error ?? null,
    },
  });
  if (result.ok) return store.update(attempted.id, { kickoffSentAt: new Date().toISOString() });
  return store.update(attempted.id, { kickoffSkipReason: result.error || "email skipped" });
}

export async function reconcileSession(sessionId: string, origin = publicOrigin()): Promise<Order | null> {
  if (!sessionId) return null;
  if (isMockSessionId(sessionId)) {
    if (process.env.EJECT_STRIPE_MODE !== "mock") return null;
    const order = await getOrderStore().getBySession(sessionId);
    if (!order || order.status === "pending") return null;
    return sendKickoffOnce(order, origin);
  }
  const stripe = getStripe();
  if (!stripe) return null;
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.livemode || session.payment_status !== "paid") return null;
  const order = await markOrderPaidFromSession(session);
  return sendKickoffOnce(order, origin);
}

export async function runPaidIntake(
  token: string,
  siteUrl: string,
  deps: CrawlDeps = {},
): Promise<{ ok: true; order: Order } | { ok: false; status: number; error: string }> {
  const store = getOrderStore();
  const order = await store.getByToken(token);
  if (!order || order.status === "pending") {
    return { ok: false, status: 403, error: "That link is not an active paid order." };
  }
  if (order.score) return { ok: true, order };
  const raw = siteUrl.trim();
  if (!raw) return { ok: false, status: 400, error: "Add the site URL." };

  let snapshot;
  try {
    snapshot = await crawlSite(raw, deps);
  } catch (err) {
    if (err instanceof SsrfError) {
      return { ok: false, status: 422, error: "That URL can't be scanned." };
    }
    return { ok: false, status: 422, error: err instanceof Error ? err.message : "We couldn't read that website." };
  }

  const report = analyzeSnapshot(snapshot, {
    tier: order.tier,
    amountUsd: order.amountCents / 100,
  });
  const eligible = report.eligibility === "ELIGIBLE";
  const delivery = eligible ? buildDelivery({ ...order, siteUrl: snapshot.finalUrl }, report, snapshot) : undefined;
  let repoDir: string | undefined;
  if (delivery && !process.env.VERCEL) {
    try {
      repoDir = await materializeDelivery(delivery, deliveryDirFor(order.id));
      delivery.repoDir = repoDir;
    } catch (err) {
      delivery.note = `${delivery.note} The repo files are stored on the order. Writing them to disk failed: ${err instanceof Error ? err.message : "unknown error"}.`;
    }
  }

  const updated = await store.update(order.id, {
    siteUrl: snapshot.finalUrl,
    score: report,
    delivery,
    status: eligible ? (repoDir ? "delivered" : "queued") : "refund_recommended",
  });
  await sendOrderMail(updated, "intake", intakeReceivedEmail({
    name: updated.name || "",
    siteUrl: snapshot.finalUrl,
    eligible,
  }));
  if (eligible && updated.token) {
    await sendOrderMail(updated, "delivery", deliveryEmail({
      name: updated.name || "",
      siteUrl: snapshot.finalUrl,
      kitUrl: `${publicOrigin()}/how-it-works`,
    }));
  }
  if (!eligible) {
    await sendOrderMail(updated, "refund", refundFollowupEmail({
      name: updated.name || "",
      siteUrl: snapshot.finalUrl,
    }));
  }
  return { ok: true, order: updated };
}

async function sendOrderMail(
  order: Order,
  kind: "intake" | "delivery" | "refund",
  message: { subject: string; text: string; html: string },
): Promise<void> {
  if (!order.email || order.emails?.[kind]) return;
  const result = await sendEmail({ to: order.email, subject: message.subject, text: message.text, html: message.html });
  await getOrderStore().update(order.id, {
    emails: {
      ...order.emails,
      [kind]: result.ok ? new Date().toISOString() : result.skipped ? "skipped" : "failed",
    },
  });
}
