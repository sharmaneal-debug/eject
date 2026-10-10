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
  tagline: "Edit your site by chatting.",
  shortTagline: "Move a simple site once. Then edit it by chatting with your own AI.",
  description:
    "After the move, you edit your own site by chatting with your own AI agent. An editing guide and agent instructions are included. Automated is a $99 one-time migration for a simple site. Done for you is $199, done by hand, for simple sites up to about 10 pages.",
  email: "hi@ejectfrom.com",
  twitter: "@useeject",

  legalEntity: {
    name: "Laniakea LLC",
    short: "Laniakea LLC",
    contactEmail: "hi@ejectfrom.com",
  },

  editing: {
    lead: "After the move, you edit your own site by chatting with your own AI agent.",
    included: "An editing guide and agent instructions are included.",
  },

  pricing: {
    express: {
      id: "express" as const,
      name: "Automated",
      price: automatedPrice,
      blurb:
        "An automated migration of a simple marketing, portfolio, or landing site. You review the pages before DNS. Not a preview before you pay, and not a CMS extract.",
      bullets: [
        "An automated migration of a simple site",
        "You review the pages before anyone points DNS",
        "An editing guide and agent instructions, so you edit by chatting with your own AI",
        "A short guide for putting the result on a free static host",
        "A DNS checklist for when you are ready to switch",
        "30 days of email support if you get stuck",
      ],
      cta: `Start for $${automatedPrice}`,
    },
    concierge: {
      id: "concierge" as const,
      name: "Done for you",
      price: doneForYouPrice,
      blurb:
        `Not a buy-now button. Book a call. Neal and a colleague do the move by hand for a simple site: up to about 10 pages, 1 form, 2 revision rounds, and a 30-minute handoff. You pay $${doneForYouPrice} after the call if we take the work. Beyond the cap, we refer out or quote an add-on.`,
      cap: {
        pages: 10,
        forms: 1,
        revisionRounds: 2,
        handoffMinutes: 30,
      },
      bullets: [
        "A person moves the pages by hand",
        "Simple sites only: about 10 pages, 1 form, 2 revision rounds",
        "A 30-minute handoff when the pages are ready",
        "The same editing guide and agent instructions, so you edit by chatting afterward",
        "Help deploying on a free host in an account you control",
        "Beyond the cap, we refer out or quote a priced add-on",
      ],
      cta: "Book a call",
    },
  },
} as const;

export function doneForYouCapLabel(): string {
  const cap = siteConfig.pricing.concierge.cap;
  return `up to about ${cap.pages} pages, ${cap.forms} form, ${cap.revisionRounds} revision rounds, and a ${cap.handoffMinutes}-minute handoff`;
}
