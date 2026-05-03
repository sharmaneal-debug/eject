export const siteConfig = {
 name: "Eject",
 domain: "ejectfrom.com",
 url: "https://ejectfrom.com",
 tagline: "Stop paying $300 a year for your website.",
 shortTagline: "Your website. Yours forever. No more monthly bills.",
 description:
 "Eject hands you a playbook + AI agent prompts to rebuild your Webflow, Framer, Wix, Squarespace, or WordPress site as files you own. Set up free hosting yourself in an afternoon, then edit your site forever by chatting with any AI.",
 email: "hi@ejectfrom.com",
 twitter: "@useeject",

 // Legal entity that owns this service. Used in footer copyright, privacy
 // policy, terms of service, refund policy, and Stripe billing descriptors.
 legalEntity: {
 name: "Laniakea LLC",
 short: "Laniakea LLC",
 contactEmail: "hi@ejectfrom.com",
 },

 // Two tiers. Both are "done for you". The difference is who.
 // Express: paste URL → our system rebuilds → preview link → you approve → yours.
 // Concierge: message us → human handles everything → done in 7 days.
 pricing: {
 express: {
 id: "express",
 name: "Express",
 price: 49,
 blurb: "We send you the playbook + AI prompts. You (or any chatbot you use) rebuild your site in an afternoon.",
 bullets: [
 "A step-by-step playbook customized to your site (every page, every section)",
 "AI agent prompts you paste into ChatGPT, Claude, or Cursor — free tiers all work",
 "A Next.js + Tailwind starter template the AI fills in with your content",
 "10-minute deploy guide for free hosting (Cloudflare, Vercel, Netlify — your pick)",
 "AI editing kit so you can change anything later, just by chatting",
 "30 days of email support if you get stuck anywhere",
 ],
 cta: "Start for $49",
 },
 concierge: {
 id: "concierge",
 name: "Concierge",
 price: 299,
 blurb: "Don't want to run the playbook yourself? We do every step for you. Live in 7 days.",
 bullets: [
 "Just message us. No playbook to follow, no AI prompts to run",
 "A human runs the whole rebuild on our infrastructure",
 "We deploy on a free host in your name and point your domain at it",
 "Live in 7 days, with one round of revisions included",
 "Same AI editing kit handed off to you for ongoing changes",
 "30 days of priority support",
 ],
 cta: "Start for $299",
 },
 },
} as const;
