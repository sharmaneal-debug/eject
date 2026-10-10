import { getStripe, priceIdForTier, stripeConfigError, tierConfig, type Tier } from "./stripe";
import { getOrderStore } from "./orders";
import { logLead } from "./leads";
import type Stripe from "stripe";

export type CheckoutResult =
  | { kind: "redirect"; url: string; orderId: string }
  | { kind: "unavailable"; reason: string };

export function isMockStripe(): boolean {
  return process.env.EJECT_STRIPE_MODE === "mock";
}

export async function createCheckoutSession(input: {
  tier: Tier;
  origin: string;
  siteUrl?: string;
  email?: string;
  name?: string;
}): Promise<CheckoutResult> {
  const cfg = tierConfig(input.tier);
  const store = getOrderStore();
  const order = await store.create({
    tier: input.tier,
    siteUrl: input.siteUrl,
    email: input.email,
    name: input.name,
    testMode: isMockStripe() ? "mock" : "stripe_test",
    amountCents: cfg.price * 100,
    currency: "usd",
  });

  await logLead({
    event: "checkout_started",
    data: { orderId: order.id, tier: input.tier, siteUrl: input.siteUrl ?? "", testMode: order.testMode },
  });

  if (isMockStripe()) {
    const sessionId = `cs_test_mock_${order.id}`;
    await store.update(order.id, { stripeSessionId: sessionId });
    const url = `${input.origin.replace(/\/$/, "")}/checkout/mock?order=${encodeURIComponent(order.id)}`;
    return { kind: "redirect", url, orderId: order.id };
  }

  const configError = stripeConfigError();
  if (configError) return { kind: "unavailable", reason: configError };
  const stripe = getStripe();
  if (!stripe) return { kind: "unavailable", reason: "Stripe test mode is not configured." };

  const priceId = priceIdForTier(input.tier);
  const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = priceId
    ? { price: priceId, quantity: 1 }
    : {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: cfg.price * 100,
          product_data: {
            name: `Eject ${cfg.name}`,
            description: "Simple-site migration. Test mode only.",
          },
        },
      };

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [lineItem],
      success_url: `${input.origin.replace(/\/$/, "")}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${input.origin.replace(/\/$/, "")}/checkout/cancel`,
      customer_email: input.email || undefined,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      custom_text: {
        submit: {
          message:
            "Test mode. After payment you submit the site URL. We score simple marketing sites only. Stores and heavy CMS sites are refunded or referred out. A preview link is not created automatically.",
        },
      },
      metadata: {
        tier: input.tier,
        siteUrl: (input.siteUrl ?? "").slice(0, 500),
        orderId: order.id,
      },
      payment_intent_data: {
        metadata: {
          tier: input.tier,
          siteUrl: (input.siteUrl ?? "").slice(0, 500),
          orderId: order.id,
        },
      },
    });
    if (!session.url) return { kind: "unavailable", reason: "Stripe did not return a checkout URL." };
    await store.update(order.id, { stripeSessionId: session.id });
    return { kind: "redirect", url: session.url, orderId: order.id };
  } catch (err) {
    console.error("[checkout] stripe session create failed:", err instanceof Error ? err.message : "error");
    return {
      kind: "unavailable",
      reason: "Stripe checkout could not be started. Use a test secret key (sk_test_…) or set EJECT_STRIPE_MODE=mock.",
    };
  }
}

export function mockSessionId(orderId: string): string {
  return `cs_test_mock_${orderId}`;
}

export function isMockSessionId(sessionId: string): boolean {
  return sessionId.startsWith("cs_test_mock_");
}

