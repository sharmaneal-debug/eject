/**
 * Checkout tier ids and Stripe test-mode price lookup.
 * Dollar amounts, names, and the simple-site cap come from lib/site.ts.
 */

import { operatorDoneForYouUsd } from "./operator-pricing";
import { siteConfig } from "./site";

const automatedDisplay = siteConfig.pricing.express;
const doneForYouDisplay = siteConfig.pricing.concierge;

export const simpleSiteScope = {
  maxPages: doneForYouDisplay.cap.pages,
  maxForms: doneForYouDisplay.cap.forms,
  revisionRounds: doneForYouDisplay.cap.revisionRounds,
  handoffMinutes: doneForYouDisplay.cap.handoffMinutes,
} as const;

export type Tier = "automated" | "done_for_you";

export type Offer = {
  id: Tier;
  name: string;
  price: number;
  blurb: string;
  bullets: readonly string[];
  cta: string;
  stripePriceEnv: readonly string[];
  stripeLookupKey: string;
};

export const automatedOffer: Offer = {
  id: "automated",
  name: automatedDisplay.name,
  price: automatedDisplay.price,
  blurb: automatedDisplay.blurb,
  bullets: automatedDisplay.bullets,
  cta: automatedDisplay.cta,
  stripePriceEnv: ["STRIPE_PRICE_AUTOMATED", "STRIPE_PRICE_EXPRESS"],
  stripeLookupKey: "eject_automated_v2",
};

export const doneForYouOffer: Offer = {
  id: "done_for_you",
  name: doneForYouDisplay.name,
  price: operatorDoneForYouUsd,
  blurb: doneForYouDisplay.blurb,
  bullets: doneForYouDisplay.bullets,
  cta: doneForYouDisplay.cta,
  stripePriceEnv: ["STRIPE_PRICE_DONE_FOR_YOU", "STRIPE_PRICE_CONCIERGE"],
  stripeLookupKey: "eject_done_for_you_v2",
};

export const offers = [automatedOffer, doneForYouOffer] as const;

export function normalizeTier(value: unknown): Tier | null {
  if (value === "automated" || value === "express") return "automated";
  if (value === "done_for_you" || value === "concierge") return "done_for_you";
  return null;
}

export function tierConfig(tier: Tier): Offer {
  return tier === "done_for_you" ? doneForYouOffer : automatedOffer;
}

export function priceIdForTier(tier: Tier): string | null {
  for (const name of tierConfig(tier).stripePriceEnv) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return null;
}
