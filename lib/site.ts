export const siteConfig = {
  name: "Eject",
  domain: "eject.co",
  url: "https://eject.co",
  tagline: "Stop paying $300 a year for your website.",
  shortTagline: "Your website. Free hosting. No monthly bill.",
  description:
    "Eject takes your Webflow, Framer, Wix, or Squarespace site and gives you back a free version you own forever. No more monthly bills.",
  email: "hi@eject.co",
  twitter: "@useeject",

  // Two tiers. Both are "done for you" — the difference is who.
  // Express: our system rebuilds your site automatically + we send the kit.
  // Concierge: a human hand-polishes it and ships the whole thing.
  pricing: {
    express: {
      id: "express",
      name: "Express",
      price: 49,
      blurb: "We auto-build your site. You get a finished folder plus AI editing instructions.",
      bullets: [
        "Your site, rebuilt automatically — pages, blog, forms, photos",
        "Step-by-step deploy guide for free hosting (10 mins, no coding)",
        "AI editing kit: instruction file + 100+ ready-to-use prompts",
        "Use any AI you already have (ChatGPT, Claude, Cursor — free tiers work)",
        "7 days of email support",
      ],
      cta: "Start for $49",
    },
    concierge: {
      id: "concierge",
      name: "Concierge",
      price: 299,
      blurb: "A human does the whole thing. You get a finished, deployed website — no setup needed.",
      bullets: [
        "Everything in Express, plus:",
        "Hand-polished pixel-perfect to your old site",
        "We deploy it and move your domain — no setup on your end",
        "One round of revisions included",
        "7-day delivery, with a real human you email",
        "30 days of priority support",
      ],
      cta: "Start for $299",
    },
  },
} as const;
