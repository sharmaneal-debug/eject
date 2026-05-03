import Stripe from "stripe";
import { siteConfig } from "./site";

// Stripe is optional at build time so the site renders even without keys.
// At runtime, /api/checkout will return a 503 if STRIPE_SECRET_KEY is missing.
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2025-02-24.acacia" });
}

// Map our internal tier ids to Stripe price ids set in env.
// Run `pnpm tsx scripts/setup-stripe.ts` to create these products + prices in
// your Stripe account, then paste the price ids into your .env.
export function priceIdForTier(tier: "diy" | "dfy"): string | null {
  if (tier === "diy") return process.env.STRIPE_PRICE_DIY ?? null;
  if (tier === "dfy") return process.env.STRIPE_PRICE_DFY ?? null;
  return null;
}

export type Tier = "diy" | "dfy";

export function tierConfig(tier: Tier) {
  return tier === "dfy" ? siteConfig.pricing.dfy : siteConfig.pricing.diy;
}
