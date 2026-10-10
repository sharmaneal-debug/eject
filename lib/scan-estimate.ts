import { siteConfig } from "./site";
import { PLATFORM_MONTHLY_COST, type Platform } from "./platform";
import { costConstants } from "./cost-constants";

export function buildScanEstimate(platform: Platform) {
  const monthlyCostEstimate = PLATFORM_MONTHLY_COST[platform];
  const annualCostEstimate = monthlyCostEstimate * 12;
  const threeYearCostEstimate = annualCostEstimate * costConstants.scanComparisonYears;
  // What the customer pays Eject on the Express path. Domain registration is
  // paid either way, so it is not added here.
  const ejectThreeYearCost = siteConfig.pricing.express.price;
  const threeYearSavings = Math.max(0, threeYearCostEstimate - ejectThreeYearCost);
  return {
    monthlyCostEstimate,
    annualCostEstimate,
    threeYearCostEstimate,
    ejectThreeYearCost,
    threeYearSavings,
  };
}
