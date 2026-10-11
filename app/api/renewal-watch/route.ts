import { NextResponse } from "next/server";
import { calculateSavings } from "@/lib/pricing/savings";
import { siteConfig } from "@/lib/site";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { logError } from "@/lib/log-error";
import { buildMovePlan } from "@/lib/renewal/move-plan";
import { normalizeRenewalInput } from "@/lib/renewal/normalize";
import { sendRenewalConfirmation } from "@/lib/renewal/email";
import { saveSubscription } from "@/lib/renewal/subscriptions";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const limit = rateLimit({ key: `renewal:${clientIp(req)}`, windowMs: 60 * 60 * 1000, max: 8 });
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many signups from this network. Try again in an hour." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Send JSON." }, { status: 400 });
  }

  const normalized = normalizeRenewalInput(body);
  if (!normalized.ok) return NextResponse.json({ ok: false, error: normalized.error }, { status: 400 });

  try {
    const { subscription, info } = await saveSubscription(normalized.value);
    const origin = requestOrigin(req);
    let emailSent = false;
    try {
      emailSent = await sendRenewalConfirmation(subscription, origin);
    } catch (err) {
      logError("renewal-confirm", err);
    }

    const savings = calculateSavings({
      platformId: subscription.platform,
      planId: subscription.planId ?? "",
      billing: subscription.interval === "month" ? "monthly" : "yearly",
      years: 3,
      renewalChargeUsd: subscription.amountUsd,
      renewalInterval: subscription.interval,
      ejectOneTimeUsd: siteConfig.pricing.express.price,
    });
    const movePlan = buildMovePlan(subscription.renewalDate);

    return NextResponse.json({
      ok: true,
      persisted: info.durable,
      store: info.driver,
      emailSent,
      unsubscribePath: `/renewal-watch/unsubscribe?token=${encodeURIComponent(subscription.unsubscribeToken)}`,
      savings,
      movePlan,
      subscription: {
        id: subscription.id,
        email: subscription.email,
        platform: subscription.platform,
        planId: subscription.planId,
        planLabel: subscription.planLabel,
        renewalDate: subscription.renewalDate,
        amountUsd: subscription.amountUsd,
        interval: subscription.interval,
      },
    });
  } catch (err) {
    logError("renewal-watch", err);
    return NextResponse.json({ ok: false, error: "We couldn't save that. Try again." }, { status: 500 });
  }
}

function requestOrigin(req: Request): string {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (!host) return siteConfig.url;
  const proto = req.headers.get("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
}
