import {
  SELF_HOSTED,
  getPlan,
  getPlatform,
  type PlanPrice,
  type PlatformId,
  type VerificationStatus,
} from "./platforms";

export type BillingChoice = "yearly" | "monthly";
export type ChargeInterval = "month" | "year";

export type SavingsInput = {
  platformId: PlatformId;
  planId: string;
  billing?: BillingChoice;
  years?: number;
  /** A real renewal charge from the customer's email, in USD. Overrides the list price when set. */
  renewalChargeUsd?: number | null;
  renewalInterval?: ChargeInterval | null;
  ejectOneTimeUsd?: number;
};

export type SavingsResult = {
  platformName: string;
  plan: PlanPrice | null;
  billing: BillingChoice;
  years: number;
  priceStatus: VerificationStatus | "custom" | "unavailable";
  /** Annualized platform cost. Null when we refuse to invent a number. */
  annualPlatformUsd: number | null;
  annualSelfHostedUsd: number;
  platformTotalUsd: number | null;
  selfHostedTotalUsd: number;
  ejectOneTimeUsd: number;
  /** Platform total minus self-hosted total. Does not subtract the Eject fee. */
  savingsVsSelfHostedUsd: number | null;
  /** Same savings after subtracting the one-time Eject fee. Can be negative. */
  netAfterEjectUsd: number | null;
  unavailableReason?: string;
  usingCustomCharge: boolean;
  sources: { label: string; url: string; lastChecked: string }[];
};

export function annualFromListPrice(plan: PlanPrice, billing: BillingChoice): number | null {
  if (plan.status !== "verified") return null;
  if (billing === "yearly") {
    return plan.yearlyBilledMonthlyUsd == null ? null : roundMoney(plan.yearlyBilledMonthlyUsd * 12);
  }
  return plan.monthlyBilledUsd == null ? null : roundMoney(plan.monthlyBilledUsd * 12);
}

export function annualFromRenewalCharge(
  amountUsd: number,
  interval: ChargeInterval | null,
): number | null {
  if (!Number.isFinite(amountUsd) || amountUsd < 0) return null;
  if (interval === "year") return roundMoney(amountUsd);
  if (interval === "month") return roundMoney(amountUsd * 12);
  return null;
}

export function calculateSavings(input: SavingsInput): SavingsResult {
  const years = clampYears(input.years ?? 3);
  const billing = input.billing ?? "yearly";
  const ejectOneTimeUsd = roundMoney(input.ejectOneTimeUsd ?? 0);
  const platform = getPlatform(input.platformId);
  const plan = getPlan(input.platformId, input.planId) ?? null;
  const sources: { label: string; url: string; lastChecked: string }[] = [
    {
      label: "Self-hosted static hosting",
      url: SELF_HOSTED.sourceUrl,
      lastChecked: SELF_HOSTED.lastChecked,
    },
  ];
  if (platform) {
    sources.unshift({
      label: `${platform.name} pricing`,
      url: plan?.sourceUrl ?? platform.pricingPageUrl,
      lastChecked: plan?.lastChecked ?? SELF_HOSTED.lastChecked,
    });
  }

  const base = {
    platformName: platform?.name ?? input.platformId,
    plan,
    billing,
    years,
    annualSelfHostedUsd: SELF_HOSTED.annualUsd,
    selfHostedTotalUsd: roundMoney(SELF_HOSTED.annualUsd * years),
    ejectOneTimeUsd,
    sources,
  };

  const custom = input.renewalChargeUsd;
  if (custom != null) {
    const annual = annualFromRenewalCharge(custom, input.renewalInterval ?? null);
    if (annual == null) {
      return {
        ...base,
        priceStatus: "unavailable",
        annualPlatformUsd: null,
        platformTotalUsd: null,
        savingsVsSelfHostedUsd: null,
        netAfterEjectUsd: null,
        usingCustomCharge: true,
        unavailableReason:
          "The renewal email has an amount, but not whether it is per month or per year. Add the interval before we annualize it.",
      };
    }
    return finish(base, annual, "custom", true);
  }

  if (!plan) {
    return {
      ...base,
      priceStatus: "unavailable",
      annualPlatformUsd: null,
      platformTotalUsd: null,
      savingsVsSelfHostedUsd: null,
      netAfterEjectUsd: null,
      usingCustomCharge: false,
      unavailableReason: "That plan is not in the checked price list. We will not guess a price.",
    };
  }

  if (plan.status !== "verified") {
    return {
      ...base,
      priceStatus: "needs-verification",
      annualPlatformUsd: null,
      platformTotalUsd: null,
      savingsVsSelfHostedUsd: null,
      netAfterEjectUsd: null,
      usingCustomCharge: false,
      unavailableReason: "This plan is marked needs-verification, so the calculator will not show a dollar savings figure.",
    };
  }

  const annual = annualFromListPrice(plan, billing);
  if (annual == null) {
    return {
      ...base,
      priceStatus: "needs-verification",
      annualPlatformUsd: null,
      platformTotalUsd: null,
      savingsVsSelfHostedUsd: null,
      netAfterEjectUsd: null,
      usingCustomCharge: false,
      unavailableReason:
        billing === "monthly"
          ? "The vendor page we checked did not publish a month-to-month USD price for this plan."
          : "The vendor page we checked did not publish a yearly USD price for this plan.",
    };
  }

  return finish(base, annual, "verified", false);
}

function finish(
  base: Omit<
    SavingsResult,
    | "priceStatus"
    | "annualPlatformUsd"
    | "platformTotalUsd"
    | "savingsVsSelfHostedUsd"
    | "netAfterEjectUsd"
    | "usingCustomCharge"
  >,
  annualPlatformUsd: number,
  priceStatus: SavingsResult["priceStatus"],
  usingCustomCharge: boolean,
): SavingsResult {
  const platformTotalUsd = roundMoney(annualPlatformUsd * base.years);
  const savingsVsSelfHostedUsd = roundMoney(platformTotalUsd - base.selfHostedTotalUsd);
  const netAfterEjectUsd = roundMoney(savingsVsSelfHostedUsd - base.ejectOneTimeUsd);
  return {
    ...base,
    priceStatus,
    annualPlatformUsd,
    platformTotalUsd,
    savingsVsSelfHostedUsd,
    netAfterEjectUsd,
    usingCustomCharge,
  };
}

export function clampYears(years: number): number {
  if (!Number.isFinite(years)) return 3;
  return Math.min(5, Math.max(1, Math.round(years)));
}

export function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatUsd(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  });
}
