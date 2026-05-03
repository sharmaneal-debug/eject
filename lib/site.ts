export const siteConfig = {
 name: "Eject",
 domain: "ejectfrom.com",
 url: "https://ejectfrom.com",
 tagline: "Stop paying $300 a year for your website.",
 shortTagline: "Your website. Yours forever. No more monthly bills.",
 description:
 "Eject takes your Webflow, Framer, Wix, or Squarespace site and rebuilds it as a folder of files you own. Deploy it on any free host, edit it by chatting with AI.",
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
 blurb: "Paste your URL. We rebuild your site. You get a preview link, approve it, and it's yours.",
 bullets: [
 "Paste your site URL. That's the whole intake",
 "We rebuild it automatically (same fonts, photos, layout, copy)",
 "You get a preview link. Click around, see the real site",
 "Tell us anything that's off; we fix it",
 "Yours forever: site files, AI editing kit, 10-min setup guide for free hosting",
 ],
 cta: "Start for $49",
 },
 concierge: {
 id: "concierge",
 name: "Concierge",
 price: 299,
 blurb: "Don't want to deal with any of it? Send us a message. We have your new site live in 7 days.",
 bullets: [
 "Just message us. No setup, no questionnaire",
 "A human handles the whole thing personally",
 "We rebuild, deploy on free hosting, and move your domain. All of it",
 "Live in 7 days, with one round of revisions included",
 "Same AI editing kit, plus 30 days of priority support",
 ],
 cta: "Start for $299",
 },
 },
} as const;
