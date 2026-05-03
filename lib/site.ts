export const siteConfig = {
 name: "Eject",
 domain: "eject.co",
 url: "https://eject.co",
 tagline: "Stop paying $300 a year for your website.",
 shortTagline: "Your website. Free hosting. No monthly bill.",
 description:
 "Eject takes your Webflow, Framer, Wix, or Squarespace site and gives you back a free version you own forever. One you can edit just by chatting with AI.",
 email: "hi@eject.co",
 twitter: "@useeject",

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
 "It becomes yours: site files + AI editing kit + free hosting",
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
 "We rebuild, deploy, and move your domain. All of it",
 "Live in 7 days, with one round of revisions included",
 "Same AI editing kit, plus 30 days of priority support",
 ],
 cta: "Start for $299",
 },
 },
} as const;
