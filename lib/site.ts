import { pricingConfig } from "./pricing";

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

 // Offer 1 (express key): $99 automated. Offer 2 (concierge key): $199 done for you.
 // Canonical checkout ids are automated and done_for_you. See lib/pricing.ts.
 pricing: pricingConfig,
} as const;
