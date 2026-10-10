// Vendor list prices for the savings calculator.
//
// Every number below was read from the vendor's own site on LAST_CHECKED.
// A null amount means that figure was not on the page we checked. Do not
// treat null as zero, and do not fill it in from memory.
//
// status "verified" means each non-null amount was on that source.
// status "needs-verification" means we do not have a number we are willing
// to show. There are no guessed prices in this file.

import { ongoingCost, ongoingYearlyUsd } from "./ongoing";

export const PRICING_LAST_CHECKED = "2026-10-10";

export type PlatformId = "webflow" | "framer" | "wix" | "squarespace";

export type VerificationStatus = "verified" | "needs-verification";

export type PlanPrice = {
  id: string;
  name: string;
  /** USD per month when the vendor's yearly billing price is expressed monthly. */
  yearlyBilledMonthlyUsd: number | null;
  /** USD per month on month-to-month billing, when the vendor published it. */
  monthlyBilledUsd: number | null;
  status: VerificationStatus;
  sourceUrl: string;
  lastChecked: string;
  /** True when this plan is the usual home of a simple marketing, portfolio, or landing site. */
  fitsSimpleSite: boolean;
  notes: string;
};

export type PlatformPricing = {
  id: PlatformId;
  name: string;
  pricingPageUrl: string;
  notes: string;
  plans: PlanPrice[];
};

const WEBFLOW_HELP =
  "https://help.webflow.com/hc/en-us/articles/51059955082387-Updated-pricing-and-simplified-plans-for-May-2026";

export const PLATFORMS: PlatformPricing[] = [
  {
    id: "webflow",
    name: "Webflow",
    pricingPageUrl: "https://webflow.com/pricing",
    notes:
      "Site-plan yearly rates are from webflow.com/pricing (yearly toggle) on 2026-10-10. Month-to-month site-plan rates are from Webflow's official May 2026 pricing update. CMS and Business site plans were combined into Premium. Ecommerce month-to-month rates were not on the yearly view of the pricing page.",
    plans: [
      {
        id: "basic",
        name: "Basic",
        yearlyBilledMonthlyUsd: 15,
        monthlyBilledUsd: 25,
        status: "verified",
        sourceUrl: "https://webflow.com/pricing",
        lastChecked: PRICING_LAST_CHECKED,
        fitsSimpleSite: true,
        notes: `Webflow describes Basic as the plan for simple sites that don't need a CMS. Yearly: $15/mo billed yearly, read on the pricing page. Month-to-month: $25/mo, from ${WEBFLOW_HELP}.`,
      },
      {
        id: "premium",
        name: "Premium",
        yearlyBilledMonthlyUsd: 25,
        monthlyBilledUsd: 39,
        status: "verified",
        sourceUrl: "https://webflow.com/pricing",
        lastChecked: PRICING_LAST_CHECKED,
        fitsSimpleSite: false,
        notes: `Premium is the combined CMS/Business plan for content-rich sites. Yearly: $25/mo billed yearly, read on the pricing page. Month-to-month: $39/mo, from ${WEBFLOW_HELP}. A heavy CMS is outside Eject's scope.`,
      },
      {
        id: "ecommerce-standard",
        name: "Ecommerce Standard",
        yearlyBilledMonthlyUsd: 29,
        monthlyBilledUsd: null,
        status: "verified",
        sourceUrl: "https://webflow.com/pricing",
        lastChecked: PRICING_LAST_CHECKED,
        fitsSimpleSite: false,
        notes:
          "Ecommerce Standard is $29/mo billed yearly on the pricing page. Month-to-month was not published on that view. Stores are outside Eject's scope.",
      },
      {
        id: "ecommerce-plus",
        name: "Ecommerce Plus",
        yearlyBilledMonthlyUsd: 74,
        monthlyBilledUsd: null,
        status: "verified",
        sourceUrl: "https://webflow.com/pricing",
        lastChecked: PRICING_LAST_CHECKED,
        fitsSimpleSite: false,
        notes:
          "Ecommerce Plus is $74/mo billed yearly on the pricing page. Month-to-month was not published on that view. Stores are outside Eject's scope.",
      },
      {
        id: "ecommerce-advanced",
        name: "Ecommerce Advanced",
        yearlyBilledMonthlyUsd: 212,
        monthlyBilledUsd: null,
        status: "verified",
        sourceUrl: "https://webflow.com/pricing",
        lastChecked: PRICING_LAST_CHECKED,
        fitsSimpleSite: false,
        notes:
          "Ecommerce Advanced is $212/mo billed yearly on the pricing page. Month-to-month was not published on that view. Stores are outside Eject's scope.",
      },
    ],
  },
  {
    id: "framer",
    name: "Framer",
    pricingPageUrl: "https://www.framer.com/pricing",
    notes:
      "On 2026-10-10 the pricing page, with Yearly billing selected, listed Basic at $10 per month and Pro at $30 per month. Mini, Business, and Scale were not listed. The page did not publish a separate month-to-month USD price. Additional editors were listed at $20/month; that seat price is not added into plan totals here.",
    plans: [
      {
        id: "basic",
        name: "Basic",
        yearlyBilledMonthlyUsd: 10,
        monthlyBilledUsd: null,
        status: "verified",
        sourceUrl: "https://www.framer.com/pricing",
        lastChecked: PRICING_LAST_CHECKED,
        fitsSimpleSite: true,
        notes:
          "Framer describes Basic as the plan for creative personal sites. $10/mo on the yearly billing view. Month-to-month USD was not on that page.",
      },
      {
        id: "pro",
        name: "Pro",
        yearlyBilledMonthlyUsd: 30,
        monthlyBilledUsd: null,
        status: "verified",
        sourceUrl: "https://www.framer.com/pricing",
        lastChecked: PRICING_LAST_CHECKED,
        fitsSimpleSite: true,
        notes:
          "Framer describes Pro as the plan for growing professional sites. $30/mo on the yearly billing view. A large CMS on Pro is still outside Eject's scope. Month-to-month USD was not on that page.",
      },
    ],
  },
  {
    id: "wix",
    name: "Wix",
    pricingPageUrl: "https://www.wix.com/plans",
    notes:
      "Wix's plans page localizes currency. USD yearly prices below are the figures Wix states on its own site for yearly subscriptions paid in full: https://www.wix.com/blog/how-much-is-a-wix-website (checked 2026-10-10). Month-to-month USD totals were not published as a single number there.",
    plans: [
      {
        id: "light",
        name: "Light",
        yearlyBilledMonthlyUsd: 17,
        monthlyBilledUsd: null,
        status: "verified",
        sourceUrl: "https://www.wix.com/blog/how-much-is-a-wix-website",
        lastChecked: PRICING_LAST_CHECKED,
        fitsSimpleSite: true,
        notes:
          "Wix describes Light as the plan for a basic online presence (custom domain, no payments). $17/mo on a yearly subscription paid in full.",
      },
      {
        id: "core",
        name: "Core",
        yearlyBilledMonthlyUsd: 29,
        monthlyBilledUsd: null,
        status: "verified",
        sourceUrl: "https://www.wix.com/blog/how-much-is-a-wix-website",
        lastChecked: PRICING_LAST_CHECKED,
        fitsSimpleSite: false,
        notes:
          "Wix describes Core as the first plan that accepts payments and basic eCommerce. $29/mo yearly, paid in full. Stores are outside Eject's scope.",
      },
      {
        id: "business",
        name: "Business",
        yearlyBilledMonthlyUsd: 39,
        monthlyBilledUsd: null,
        status: "verified",
        sourceUrl: "https://www.wix.com/blog/how-much-is-a-wix-website",
        lastChecked: PRICING_LAST_CHECKED,
        fitsSimpleSite: false,
        notes:
          "Wix describes Business as the plan for a standard eCommerce and marketing suite. $39/mo yearly, paid in full. Stores are outside Eject's scope.",
      },
      {
        id: "business-elite",
        name: "Business Elite",
        yearlyBilledMonthlyUsd: 159,
        monthlyBilledUsd: null,
        status: "verified",
        sourceUrl: "https://www.wix.com/blog/how-much-is-a-wix-website",
        lastChecked: PRICING_LAST_CHECKED,
        fitsSimpleSite: false,
        notes:
          "Wix describes Business Elite as the plan for advanced developer and large-catalog needs. $159/mo yearly, paid in full. Outside Eject's scope.",
      },
    ],
  },
  {
    id: "squarespace",
    name: "Squarespace",
    pricingPageUrl: "https://www.squarespace.com/pricing",
    notes:
      "USD prices from the plan comparison table on squarespace.com/pricing on 2026-10-10. Each cell showed a month-to-month rate and a yearly rate. Current plan names are Basic, Core, Plus, and Advanced.",
    plans: [
      {
        id: "basic",
        name: "Basic",
        yearlyBilledMonthlyUsd: 19,
        monthlyBilledUsd: 25,
        status: "verified",
        sourceUrl: "https://www.squarespace.com/pricing",
        lastChecked: PRICING_LAST_CHECKED,
        fitsSimpleSite: true,
        notes:
          "Comparison table: $25/mo month-to-month and $19/mo billed yearly. Suitable comparison for a simple brochure or portfolio. Commerce features on the plan are outside Eject's scope.",
      },
      {
        id: "core",
        name: "Core",
        yearlyBilledMonthlyUsd: 29,
        monthlyBilledUsd: 39,
        status: "verified",
        sourceUrl: "https://www.squarespace.com/pricing",
        lastChecked: PRICING_LAST_CHECKED,
        fitsSimpleSite: false,
        notes:
          "Comparison table: $39/mo month-to-month and $29/mo billed yearly. Squarespace marks Core as the recommended business plan. Heavier than a simple marketing site.",
      },
      {
        id: "plus",
        name: "Plus",
        yearlyBilledMonthlyUsd: 49,
        monthlyBilledUsd: 65,
        status: "verified",
        sourceUrl: "https://www.squarespace.com/pricing",
        lastChecked: PRICING_LAST_CHECKED,
        fitsSimpleSite: false,
        notes:
          "Comparison table: $65/mo month-to-month and $49/mo billed yearly. Commerce-oriented. Outside Eject's scope.",
      },
      {
        id: "advanced",
        name: "Advanced",
        yearlyBilledMonthlyUsd: 99,
        monthlyBilledUsd: 139,
        status: "verified",
        sourceUrl: "https://www.squarespace.com/pricing",
        lastChecked: PRICING_LAST_CHECKED,
        fitsSimpleSite: false,
        notes:
          "Comparison table: $139/mo month-to-month and $99/mo billed yearly. Commerce-oriented. Outside Eject's scope.",
      },
    ],
  },
];

export const SELF_HOSTED = {
  label: "Eject yearly cost",
  domainUsdPerYear: ongoingCost.domainUsdPerYear,
  hostingUsdPerYear: ongoingCost.hostingUsdPerYear,
  annualUsd: ongoingYearlyUsd(),
  status: "verified" as const,
  sourceUrl: ongoingCost.hostingSourceUrl,
  lastChecked: ongoingCost.hostingLastChecked,
  assumption: `About $${ongoingCost.domainUsdPerYear}/yr is a domain assumption. Hosting is $${ongoingCost.hostingUsdPerYear}/yr for Cloudflare Pages static assets (docs checked ${ongoingCost.hostingLastChecked}).`,
};

export const PLATFORM_IDS = PLATFORMS.map((p) => p.id);

export function getPlatform(id: string): PlatformPricing | undefined {
  return PLATFORMS.find((p) => p.id === id);
}

export function getPlan(platformId: string, planId: string): PlanPrice | undefined {
  return getPlatform(platformId)?.plans.find((p) => p.id === planId);
}

export function defaultPlanId(platformId: PlatformId): string {
  const platform = getPlatform(platformId);
  const simple = platform?.plans.find((p) => p.fitsSimpleSite);
  return simple?.id ?? platform?.plans[0]?.id ?? "";
}
