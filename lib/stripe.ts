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

type Env = Record<string, string | undefined>;

/**
 * Live keys and live webhook events stay refused unless both switches are on
 * and the secret is actually a live key. Test keys keep working either way.
 */
export function liveStripeAllowed(env: Env = process.env): boolean {
  return env.EJECT_STRIPE_MODE === "live" && env.CHECKOUT_OPEN === "true" && stripeKeyMode(env.STRIPE_SECRET_KEY) === "live";
}

export function stripeConfigError(env: Env = process.env): string | null {
  const key = env.STRIPE_SECRET_KEY;
  if (!key) {
    return "Stripe is not configured. Set STRIPE_SECRET_KEY to a test key (sk_test_…) or set EJECT_STRIPE_MODE=mock for a local no-charge checkout.";
  }
  const mode = stripeKeyMode(key);
  if (mode === "live") {
    if (!liveStripeAllowed(env)) {
      return "Live Stripe keys are refused unless EJECT_STRIPE_MODE=live and CHECKOUT_OPEN=true.";
    }
    return null;
  }
  if (mode !== "test") {
    return "STRIPE_SECRET_KEY must be a Stripe test secret (sk_test_…) or a live secret when live mode is explicitly enabled.";
  }
  return null;
}

function stripeClient(key: string) {
  return new Stripe(key, {
    apiVersion: "2025-02-24.acacia",
    httpClient: Stripe.createFetchHttpClient(),
  });
}

export function getStripe(env: Env = process.env) {
  const key = env.STRIPE_SECRET_KEY;
  const mode = stripeKeyMode(key);
  if (!key) return null;
  if (mode === "test") return stripeClient(key);
  if (mode === "live" && liveStripeAllowed(env)) return stripeClient(key);
  return null;
}

export function isValidTier(t: unknown): t is Tier {
  return normalizeTier(t) !== null && (t === "automated" || t === "done_for_you");
}
