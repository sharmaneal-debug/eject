const automatedPrice = 99;

/**
 * Public copy and the only public price. Checkout still accepts the internal
 * ids automated / done_for_you, plus the older express / concierge query values.
 * The operator amount for a custom payment link lives in lib/operator-pricing.ts
 * and is not part of this object.
 */
export const siteConfig = {
  name: "Eject",
  domain: "ejectfrom.com",
  url: "https://ejectfrom.com",
  tagline: "Move a simple site. $99.",
  shortTagline: "You own the files.",
  description: "Move a simple site for $99. You own the files.",
  email: "hi@ejectfrom.com",
  twitter: "@useeject",

  legalEntity: {
    name: "Laniakea LLC",
    short: "Laniakea LLC",
    contactEmail: "hi@ejectfrom.com",
  },

  editing: {
    lead: "You edit the files by chatting with your own AI.",
    included: "An editing guide is included.",
  },

  pricing: {
    express: {
      id: "express" as const,
      name: "Automated",
      price: automatedPrice,
      blurb: "You own the files.",
      bullets: ["About 10 pages", "Editing guide included"],
      cta: "Buy now",
    },
    concierge: {
      id: "concierge" as const,
      name: "Custom",
      blurb: "We handle the migration for you, step by step.",
      cap: {
        pages: 10,
        forms: 1,
        revisionRounds: 2,
        handoffMinutes: 30,
      },
      bullets: ["We handle the migration for you, step by step."],
      cta: "Contact us",
    },
  },
} as const;

export function doneForYouCapLabel(): string {
  const cap = siteConfig.pricing.concierge.cap;
  return `up to about ${cap.pages} pages, ${cap.forms} form, ${cap.revisionRounds} revision rounds, and a ${cap.handoffMinutes}-minute handoff`;
}
