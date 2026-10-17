/** Public checkout stays closed unless this is the exact string "true". */
export function checkoutOpen(): boolean {
  return process.env.CHECKOUT_OPEN === "true";
}

/** Buy buttons. Closed sends people to the list. Open starts test checkout. */
export function buyNowHref(): string {
  return checkoutOpen() ? "/checkout?tier=automated" : "/early-access";
}

/**
 * Landing-page buy CTA. Always enters /checkout.
 * While CHECKOUT_OPEN is off, that page redirects to /early-access and does not start Stripe.
 */
export function moveCheckoutHref(siteUrl?: string): string {
  const params = new URLSearchParams({ tier: "automated" });
  if (siteUrl) params.set("url", siteUrl);
  return `/checkout?${params.toString()}`;
}
