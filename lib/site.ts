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
  tagline: "Move a simple site. Keep the files.",
  shortTagline: "Simple sites. About 10 pages.",
  description: "Simple sites only. About 10 pages. Automated $99. Done for you $199.",
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
      name: "Done for you",
      price: doneForYouPrice,
      blurb: "We handle the move.",
      cap: {
        pages: 10,
        forms: 1,
        revisionRounds: 2,
        handoffMinutes: 30,
      },
      bullets: ["About 10 pages", "1 form"],
      cta: "Book a call",
    },
  },
} as const;

export function doneForYouCapLabel(): string {
  const cap = siteConfig.pricing.concierge.cap;
  return `up to about ${cap.pages} pages, ${cap.forms} form, ${cap.revisionRounds} revision rounds, and a ${cap.handoffMinutes}-minute handoff`;
}
