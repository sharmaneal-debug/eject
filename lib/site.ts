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

  // Two tiers. Yes — DIY is more expensive on purpose: it's a complete kit
  // (your site files + AI instructions + step-by-step guide) you keep forever.
  // DFY is just "we do the migration once, here's your finished site."
  pricing: {
    dfy: {
      id: "dfy",
      name: "Just do it for me",
      price: 299,
      blurb: "We migrate your whole site. You get a finished website that's ready to go.",
      bullets: [
        "We rebuild your site exactly as it looks today",
        "We move your blog posts, forms, and pages over",
        "We hand you a finished website on free hosting",
        "Done in 7 days, with one round of revisions",
      ],
      cta: "Start my migration",
    },
    diy: {
      id: "diy",
      name: "I want to do it myself",
      price: 499,
      blurb: "We give you everything you need to migrate your site yourself — and edit it forever with any AI.",
      bullets: [
        "Your site rebuilt as a folder of files (you own them)",
        "Step-by-step video walkthrough (40 minutes)",
        "AI instructions you copy-paste into ChatGPT, Claude, or Cursor",
        "100+ ready-to-use prompts for changing your site",
        "Free editor support for 30 days",
      ],
      cta: "Get the kit",
    },
  },
} as const;
