import Stripe from "stripe";
import { normalizeTier, priceIdForTier, tierConfig, type Tier } from "./pricing";

export type { Tier } from "./pricing";
export { normalizeTier, priceIdForTier, tierConfig };

// Stripe is optional at build time so the site renders even without keys.
// At runtime, /api/checkout will return a 503 if STRIPE_SECRET_KEY is missing.
//
// We use the fetch HTTP client so the SDK works in Edge runtimes (Cloudflare
// Pages, Vercel Edge). Falls back to the default Node client when not in edge.
export type StripeKeyMode = "test" | "live" | "unknown";

export function stripeKeyMode(key: string | undefined): StripeKeyMode {
  if (!key) return "unknown";
  if (key.startsWith("sk_test_") || key.startsWith("rk_test_")) return "test";
  if (key.startsWith("sk_live_") || key.startsWith("rk_live_")) return "live";
  return "unknown";
}

export function stripeConfigError(): string | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return "Stripe is not configured. Set STRIPE_SECRET_KEY to a test key (sk_test_…) or set EJECT_STRIPE_MODE=mock for a local no-charge checkout.";
  }
  if (stripeKeyMode(key) === "live") {
    return "Live Stripe keys are refused. This checkout is test mode only.";
  }
  if (stripeKeyMode(key) !== "test") {
    return "STRIPE_SECRET_KEY must be a Stripe test secret (sk_test_…).";
  }
  return null;
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || stripeKeyMode(key) !== "test") return null;
  return new Stripe(key, {
    apiVersion: "2025-02-24.acacia",
    httpClient: Stripe.createFetchHttpClient(),
  });
}

export function isValidTier(t: unknown): t is Tier {
  return normalizeTier(t) !== null && (t === "automated" || t === "done_for_you");
}
