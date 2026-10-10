import { ongoingCost } from "./pricing/ongoing";
import { simpleSiteScope } from "./pricing";

/**
 * Cost-to-serve estimates. Eligibility caps come from lib/pricing.ts
 * (simpleSiteScope) so the offer and the score use the same numbers.
 * Figures are planning estimates in USD, not invoices.
 */
export const costConstants = {
  // Simple marketing / portfolio / landing pages only.
  maxEligiblePages: simpleSiteScope.maxPages,
  maxEligibleCmsCollections: 2,
  maxEligibleCmsItems: 40,
  maxEligibleForms: simpleSiteScope.maxForms,
  revisionRounds: simpleSiteScope.revisionRounds,
  handoffMinutes: simpleSiteScope.handoffMinutes,
  maxScriptBytes: 3_000_000,
  assumedBytesPerExternalScript: 80_000,
  maxAssetCountForEasyPull: 150,

  // Bounded crawl used after payment. Not a full-site mirror.
  crawlMaxPages: 16,
  crawlPerPageTimeoutMs: 8_000,
  crawlTotalBudgetMs: 25_000,
  htmlByteCap: 1_000_000,
  assetSampleCount: 6,
  scriptSampleCount: 4,

  // Migration time, in minutes.
  minutesBase: 20,
  minutesPerPage: 15,
  minutesPerForm: 10,
  reviewMinutesFlat: 20,
  /** Person time on the $99 automated tier: a short review, not a rebuild. */
  automatedReviewMinutes: 20,
  /** Person time on the custom tier inside the cap, plus the included handoff. */
  doneForYouPolishMinutes: 90,

  // What it costs us to serve one simple site.
  computeUsdPerPage: 0.03,
  computeUsdPerAsset: 0.002,
  tokensUsdPerPage: 0.12,
  hostingUsdFlat: ongoingCost.hostingUsdPerYear,
  humanUsdPerHour: 75,
  stripePercent: 0.029,
  stripeFixedUsd: 0.3,
  domainUsdPerYear: ongoingCost.domainUsdPerYear,

  // Free scan compares a typical platform bill with the automated offer price.
  scanComparisonYears: 3,
} as const;

export function roundUsd(n: number): number {
  return Math.round(n * 100) / 100;
}
