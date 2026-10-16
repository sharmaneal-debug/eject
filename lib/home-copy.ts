import { AUTOMATED_REFUND_PROMISE } from "./legal";
import { siteConfig } from "./site";

export const HOME_H1 = "Move your website.";

export const HOME_LEDE = "Stop paying to host your website. Move it to your agent for free.";

export const HOME_DESCRIPTION = siteConfig.description;

export const SITE_URL_LABEL = "Enter your website here.";

/** Exact line shown under the estimate, before the buy button. */
export const AGENT_PRICE_LINE =
  "It's $99 here, and you can use a free ChatGPT account or any AI tool to manage this website.";

export const homeFaqItems = [
  {
    q: "What do I pay?",
    a: "The move is $99 once. After that you can use a free ChatGPT account or any AI tool to manage the website. Eject does not charge a monthly hosting fee. You still pay your domain registrar.",
  },
  {
    q: "Do I own the code?",
    a: "Yes. The files are yours.",
  },
  {
    q: "Which sites can move?",
    a: "Simple marketing, portfolio, and landing sites on Webflow, Framer, Wix, or Squarespace, about 10 pages. Stores, member areas, and large CMS sites are out.",
  },
  {
    q: "Will it look the same?",
    a: "We do not promise a visual match.",
  },
  {
    q: "What is the refund policy?",
    a: `${AUTOMATED_REFUND_PROMISE} The policy is at ${siteConfig.url}/refunds.`,
  },
  {
    q: "Where are the sample sites?",
    a: `Sample sites are at ${siteConfig.url}/samples. They are moved template pages, not customer logos.`,
  },
] as const;
