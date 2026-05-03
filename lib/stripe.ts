import Stripe from "stripe";
import { siteConfig } from "./site";

// Stripe is optional at build time so the site renders even without keys.
// At runtime, /api/checkout will return a 503 if STRIPE_SECRET_KEY is missing.
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2025-02-24.acacia" });
}

export type Tier = "express" | "concierge";

// Map our internal tier ids to Stripe price ids set in env.
// Run `pnpm setup-stripe` to create these products + prices in your Stripe
// account, then paste the price ids into your .env.
export function priceIdForTier(tier: Tier): string | null {
  if (tier === "express") return process.env.STRIPE_PRICE_EXPRESS ?? null;
  if (tier === "concierge") return process.env.STRIPE_PRICE_CONCIERGE ?? null;
  return null;
}

export function tierConfig(tier: Tier) {
  return tier === "concierge" ? siteConfig.pricing.concierge : siteConfig.pricing.express;
}

export function isValidTier(t: unknown): t is Tier {
  return t === "express" || t === "concierge";
}
