import { PLATFORM_LABELS, type Platform } from "../platform";
import { siteConfig } from "../site";
import { ongoingCost } from "./ongoing";
import { PLATFORMS, PRICING_LAST_CHECKED, getPlatform, type PlanPrice, type PlatformId } from "./platforms";
import { annualFromListPrice, formatUsd, roundMoney } from "./savings";

/**
 * Published-plan ranges for the landing estimate.
 * Uses the same annualized list prices as the savings calculator.
 * Does not use PLATFORM_MONTHLY_COST. Those are single typical figures, and
 * this page must not present a made-up exact bill.
 * Yearly savings does not subtract the domain (paid either way) or the
 * one-time move fee. It subtracts only the checked static hosting rate.
 */

const PRICED: ReadonlySet<string> = new Set(["webflow", "framer", "wix", "squarespace"]);

export type HostingRange = {
  /** False when we have no checked price list for the detected platform. */
  pricedPlatform: boolean;
  platformLabel: string;
  lowUsd: number;
  highUsd: number;
  savingsLowUsd: number;
  savingsHighUsd: number;
  /** True when every figure in the range is from a simple-site plan. */
  simplePlansOnly: boolean;
  checked: string;
  note: string;
  savingsNote: string;
  sources: { label: string; url: string }[];
};

function isPriced(platform: Platform): platform is PlatformId {
  return PRICED.has(platform);
}

function annualized(plan: PlanPrice): number[] {
  const yearly = annualFromListPrice(plan, "yearly");
  const monthly = annualFromListPrice(plan, "monthly");
  const values: number[] = [];
  if (yearly != null) values.push(yearly);
  if (monthly != null) values.push(monthly);
  return values;
}

function span(values: number[]): { low: number; high: number } {
  let low = values[0] ?? 0;
  let high = values[0] ?? 0;
  for (const value of values) {
    if (value < low) low = value;
    if (value > high) high = value;
  }
  return { low, high };
}

function contributingPlans(platformId: PlatformId, simpleOnly: boolean): PlanPrice[] {
  const platform = getPlatform(platformId);
  if (!platform) return [];
  return platform.plans.filter((plan) => annualized(plan).length > 0 && (!simpleOnly || plan.fitsSimpleSite));
}

function pricesFrom(plans: PlanPrice[]): number[] {
  return plans.flatMap(annualized);
}

const GENERAL_NAMES = "Webflow, Framer, Wix, and Squarespace";

export function hostingPriceRange(platform: Platform): HostingRange {
  const generalPlans = PLATFORMS.flatMap((item) => contributingPlans(item.id, true));
  const generalPrices = pricesFrom(generalPlans);
  const general = span(generalPrices);

  if (!isPriced(platform)) {
    const label = PLATFORM_LABELS[platform];
    const rangeText = `${formatUsd(general.low)} to ${formatUsd(general.high)} per year`;
    const note =
      platform === "other"
        ? `We couldn't tell the platform, so this is the general range of published simple-site plans on ${GENERAL_NAMES}: ${rangeText}. It is not your bill.`
        : `We detected ${label}. We don't have a checked public price list for it, so this is the general range of published simple-site plans on ${GENERAL_NAMES}: ${rangeText}. It is not your bill.`;
    return finish({
      pricedPlatform: false,
      platformLabel: label,
      lowUsd: general.low,
      highUsd: general.high,
      simplePlansOnly: true,
      note,
      plans: generalPlans,
    });
  }

  const simplePlans = contributingPlans(platform, true);
  const simplePrices = pricesFrom(simplePlans);
  const simple = span(simplePrices);
  const useSimple = simplePrices.length > 1 && simple.low !== simple.high;
  const plans = useSimple ? simplePlans : contributingPlans(platform, false);
  const prices = useSimple ? simplePrices : pricesFrom(plans);
  const { low, high } = span(prices);
  const name = getPlatform(platform)?.name ?? PLATFORM_LABELS[platform];
  const note = useSimple
    ? `${name} published prices for a simple site run from ${formatUsd(low)} to ${formatUsd(high)} per year. We don't know your plan, so this is a range, not your bill. Prices checked ${PRICING_LAST_CHECKED}.`
    : `${name} published plan prices run from ${formatUsd(low)} to ${formatUsd(high)} per year. The low end is the simple-site plan. The high end includes plans that are usually outside a simple site. We don't know your plan, so this is a range, not your bill. Prices checked ${PRICING_LAST_CHECKED}.`;

  return finish({
    pricedPlatform: true,
    platformLabel: name,
    lowUsd: low,
    highUsd: high,
    simplePlansOnly: useSimple,
    note,
    plans,
  });
}

function sourceLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "source";
  }
}

function finish(input: {
  pricedPlatform: boolean;
  platformLabel: string;
  lowUsd: number;
  highUsd: number;
  simplePlansOnly: boolean;
  note: string;
  plans: PlanPrice[];
}): HostingRange {
  const hosting = ongoingCost.hostingUsdPerYear;
  const sources: { label: string; url: string }[] = [];
  const seen = new Set<string>();
  for (const plan of input.plans) {
    if (seen.has(plan.sourceUrl)) continue;
    seen.add(plan.sourceUrl);
    sources.push({ label: sourceLabel(plan.sourceUrl), url: plan.sourceUrl });
  }
  return {
    pricedPlatform: input.pricedPlatform,
    platformLabel: input.platformLabel,
    lowUsd: input.lowUsd,
    highUsd: input.highUsd,
    savingsLowUsd: roundMoney(Math.max(0, input.lowUsd - hosting)),
    savingsHighUsd: roundMoney(Math.max(0, input.highUsd - hosting)),
    simplePlansOnly: input.simplePlansOnly,
    checked: PRICING_LAST_CHECKED,
    note: input.note,
    savingsNote: `Estimated yearly savings is that same range. Static hosting can be $0 a year, and the domain stays on your registrar either way. The $${siteConfig.pricing.express.price} move is one-time, so it is not subtracted from the yearly range.`,
    sources,
  };
}

export function formatUsdRange(low: number, high: number): string {
  return `${formatUsd(low)}–${formatUsd(high)}`;
}
