/** Public checkout stays closed unless this is the exact string "true". */
export function checkoutOpen(): boolean {
  return process.env.CHECKOUT_OPEN === "true";
}

/** Buy buttons. Closed sends people to the list. Open starts test checkout. */
export function buyNowHref(): string {
  return checkoutOpen() ? "/checkout?tier=automated" : "/early-access";
}
