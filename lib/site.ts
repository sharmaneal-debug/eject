export const siteConfig = {
  name: "Eject",
  domain: "eject.dev",
  url: "https://eject.dev",
  tagline: "Eject from Webflow. Own your site. Pay $5 a year.",
  shortTagline: "Own your site. Pay $5 a year.",
  description:
    "Eject migrates your Framer, Webflow, Wix, or Squarespace site to a clean Next.js codebase you own — deployed to Cloudflare Pages free, edited by chat.",
  email: "hi@eject.dev",
  twitter: "@geteject",
  pricing: {
    diy: { name: "DIY Guided", price: 49, blurb: "URL in. Repo out. Self-deploy guide." },
    dwy: { name: "Done-with-You", price: 299, blurb: "We migrate. You launch. 30-min Zoom included." },
    dfy: { name: "Done-for-You", price: 1499, blurb: "Hand off. Wired up. Editor trained on your site." },
  },
  retainer: {
    hobby: { name: "Editor — Hobby", price: 79, blurb: "Chat-edit your site. Up to 50 edits/mo." },
    pro: { name: "Editor — Pro", price: 149, blurb: "Unlimited edits, monthly Lighthouse + SEO report." },
  },
} as const;
