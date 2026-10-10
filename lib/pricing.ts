/**
 * Checkout offers. Marketing pages should read this (via siteConfig.pricing)
 * instead of hardcoding prices.
 *
 * Offer 1 — automated, $99, simple sites.
 * Offer 2 — done for you, $199, hand-polished, same simple-site cap:
 *   up to ~10 pages, 1 form, 2 revision rounds, a 30-minute handoff.
 * Anything beyond that cap is a refer-out or a priced add-on.
 *
 * Stripe price ids come from env (test mode only). `pnpm setup-stripe`
 * create-or-lookups the test-mode products and prints the env lines.
 */

export const simpleSiteScope = {
  maxPages: 10,
  maxForms: 1,
  revisionRounds: 2,
  handoffMinutes: 30,
} as const;

export type Tier = "automated" | "done_for_you";

export type Offer = {
  id: Tier;
  name: string;
  price: number;
  blurb: string;
  bullets: readonly string[];
  cta: string;
  /** Env vars checked in order. The first set value wins. Legacy names stay as fallbacks. */
  stripePriceEnv: readonly string[];
  /** Stable lookup key for the test-mode product. Bump when the price changes. */
  stripeLookupKey: string;
};

const editingFirst =
  "You edit the site yourself by chatting with your own agent. The repo includes AGENTS.md and an editing playbook.";

export const automatedOffer: Offer = {
  id: "automated",
  name: "Automated",
  price: 99,
  blurb: "One payment for an automated migration of a simple site, then you edit it by chatting with your own agent.",
  bullets: [
    editingFirst,
    "Automated migration for a simple marketing, portfolio, or landing page.",
    `Included scope: up to ${simpleSiteScope.maxPages} pages and ${simpleSiteScope.maxForms} form. Past that, we refer you out or quote an add-on.`,
    "A content handoff plus hosting instructions. A preview link is not created automatically.",
    "Editing guide in the repo (AGENTS.md). Use Cursor, Claude, or ChatGPT. There is no separate editor subscription.",
  ],
  cta: "Start for $99",
  stripePriceEnv: ["STRIPE_PRICE_AUTOMATED", "STRIPE_PRICE_EXPRESS"],
  stripeLookupKey: "eject_automated_v2",
};

export const doneForYouOffer: Offer = {
  id: "done_for_you",
  name: "Done for you",
  price: 199,
  blurb: "We migrate a simple site by hand. You still edit it afterwards by chatting with your own agent.",
  bullets: [
    editingFirst,
    "Hand-polished migration. A person does the work inside a fixed scope.",
    `Cap: simple sites, up to ${simpleSiteScope.maxPages} pages, ${simpleSiteScope.maxForms} form, ${simpleSiteScope.revisionRounds} revision rounds, and a ${simpleSiteScope.handoffMinutes}-minute handoff.`,
    "Anything beyond that cap is a refer-out or a priced add-on, not this price.",
    "Same AGENTS.md editing handoff when the site is yours.",
  ],
  cta: "Start for $199",
  stripePriceEnv: ["STRIPE_PRICE_DONE_FOR_YOU", "STRIPE_PRICE_CONCIERGE"],
  stripeLookupKey: "eject_done_for_you_v2",
};

/** Keys match the existing pricing components. ids are the checkout tier ids. */
export const pricingConfig = {
  express: automatedOffer,
  concierge: doneForYouOffer,
} as const;

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
