const automatedPrice = 99;
const doneForYouPrice = 199;

/**
 * Display copy and prices. Checkout, email, delivery, calculators, and
 * playbooks should read amounts from here. Checkout still accepts the
 * internal ids automated / done_for_you, plus the older express / concierge
 * query values.
 */
export const siteConfig = {
  name: "Eject",
  domain: "ejectfrom.com",
  url: "https://ejectfrom.com",
  tagline: "Move your site for $99.",
  shortTagline: "Move a simple site. $99 once.",
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
      blurb: "Automated move of a simple site.",
      bullets: ["Simple sites", "You own the files", "Editing guide included"],
      cta: `Buy for $${automatedPrice}`,
    },
    concierge: {
      id: "concierge" as const,
      name: "Custom",
      price: doneForYouPrice,
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
