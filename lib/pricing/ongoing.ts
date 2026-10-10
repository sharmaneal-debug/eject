/**
 * Single source for the yearly self-hosted figure shown next to vendor prices.
 * Hosting is the checked Cloudflare Pages free-plan static rate.
 * The domain figure is an assumption. Pages must label it as one.
 */
export const ongoingCost = {
  domainUsdPerYear: 15,
  hostingUsdPerYear: 0,
  hostingSourceUrl: "https://developers.cloudflare.com/pages/functions/pricing/",
  hostingLastChecked: "2026-10-10",
} as const;

export function ongoingYearlyUsd(): number {
  return ongoingCost.domainUsdPerYear + ongoingCost.hostingUsdPerYear;
}

export function ongoingFootnote(moveFeeUsd: number): string {
  const { domainUsdPerYear, hostingUsdPerYear, hostingLastChecked } = ongoingCost;
  return `About $${domainUsdPerYear}/yr is a domain assumption. Your registrar sets the real price. Hosting is $${hostingUsdPerYear}/yr for Cloudflare Pages static assets (docs checked ${hostingLastChecked}). The $${moveFeeUsd} move is one-time and is not in the yearly figure.`;
}
