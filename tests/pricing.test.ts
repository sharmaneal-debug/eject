import assert from "node:assert/strict";
import { test } from "node:test";
import { automatedOffer, doneForYouOffer, normalizeTier, priceIdForTier, simpleSiteScope } from "../lib/pricing";
import { buildScanEstimate } from "../lib/scan-estimate";
import { getStripe, stripeConfigError, stripeKeyMode } from "../lib/stripe";
import { resendFromAddress, sendEmail } from "../lib/email";
import { readFileSync } from "node:fs";

test("offers are $99 automated and $199 done for you", () => {
  assert.equal(automatedOffer.price, 99);
  assert.equal(automatedOffer.id, "automated");
  assert.equal(doneForYouOffer.price, 199);
  assert.equal(doneForYouOffer.id, "done_for_you");
  assert.equal(simpleSiteScope.maxPages, 10);
  assert.equal(simpleSiteScope.maxForms, 1);
  assert.equal(simpleSiteScope.revisionRounds, 2);
  assert.equal(simpleSiteScope.handoffMinutes, 30);
  assert.deepEqual(automatedOffer.stripePriceEnv, ["STRIPE_PRICE_AUTOMATED", "STRIPE_PRICE_EXPRESS"]);
  assert.deepEqual(doneForYouOffer.stripePriceEnv, ["STRIPE_PRICE_DONE_FOR_YOU", "STRIPE_PRICE_CONCIERGE"]);
});

test("normalizeTier accepts legacy checkout query values", () => {
  assert.equal(normalizeTier("express"), "automated");
  assert.equal(normalizeTier("automated"), "automated");
  assert.equal(normalizeTier("concierge"), "done_for_you");
  assert.equal(normalizeTier("done_for_you"), "done_for_you");
  assert.equal(normalizeTier("diy"), null);
  assert.equal(normalizeTier(undefined), null);
});

test("price id env falls back to the legacy name", () => {
  const previous = {
    automated: process.env.STRIPE_PRICE_AUTOMATED,
    express: process.env.STRIPE_PRICE_EXPRESS,
    done: process.env.STRIPE_PRICE_DONE_FOR_YOU,
    concierge: process.env.STRIPE_PRICE_CONCIERGE,
  };
  delete process.env.STRIPE_PRICE_AUTOMATED;
  delete process.env.STRIPE_PRICE_EXPRESS;
  delete process.env.STRIPE_PRICE_DONE_FOR_YOU;
  delete process.env.STRIPE_PRICE_CONCIERGE;
  try {
    assert.equal(priceIdForTier("automated"), null);
    process.env.STRIPE_PRICE_EXPRESS = "price_legacy_auto";
    assert.equal(priceIdForTier("automated"), "price_legacy_auto");
    process.env.STRIPE_PRICE_AUTOMATED = "price_auto";
    assert.equal(priceIdForTier("automated"), "price_auto");
    process.env.STRIPE_PRICE_CONCIERGE = "price_legacy_dfy";
    assert.equal(priceIdForTier("done_for_you"), "price_legacy_dfy");
    process.env.STRIPE_PRICE_DONE_FOR_YOU = "price_dfy";
    assert.equal(priceIdForTier("done_for_you"), "price_dfy");
  } finally {
    restore("STRIPE_PRICE_AUTOMATED", previous.automated);
    restore("STRIPE_PRICE_EXPRESS", previous.express);
    restore("STRIPE_PRICE_DONE_FOR_YOU", previous.done);
    restore("STRIPE_PRICE_CONCIERGE", previous.concierge);
  }
});

test("scan estimate uses the automated price, not $499", () => {
  const estimate = buildScanEstimate("webflow");
  assert.equal(estimate.ejectThreeYearCost, 99);
  assert.equal(estimate.ejectThreeYearCost, automatedOffer.price);
  assert.notEqual(estimate.ejectThreeYearCost, 499);
  const scan = readFileSync(new URL("../app/api/scan/route.ts", import.meta.url), "utf8");
  assert.equal(scan.includes("499"), false);
});

test("live Stripe keys are refused", () => {
  assert.equal(stripeKeyMode("sk_test_example"), "test");
  assert.equal(stripeKeyMode("sk_live_example"), "live");
  const previous = process.env.STRIPE_SECRET_KEY;
  process.env.STRIPE_SECRET_KEY = "sk_live_example";
  try {
    assert.equal(getStripe(), null);
    assert.match(stripeConfigError() ?? "", /test mode only|refused/i);
  } finally {
    restore("STRIPE_SECRET_KEY", previous);
  }
});

test("email send is skipped when RESEND_FROM is unset", async () => {
  const previousKey = process.env.RESEND_API_KEY;
  const previousFrom = process.env.RESEND_FROM;
  process.env.RESEND_API_KEY = "re_test_not_used";
  delete process.env.RESEND_FROM;
  try {
    assert.equal(resendFromAddress(), null);
    const result = await sendEmail({ to: "buyer@example.com", subject: "hi", html: "<p>hi</p>", text: "hi" });
    assert.equal(result.ok, false);
    assert.equal(result.skipped, true);
    assert.equal(result.error, "RESEND_FROM not set");
  } finally {
    restore("RESEND_API_KEY", previousKey);
    restore("RESEND_FROM", previousFrom);
  }
});

test("checkout redirect sits outside the try/catch", () => {
  const src = readFileSync(new URL("../app/checkout/page.tsx", import.meta.url), "utf8");
  const tryAt = src.indexOf("try {");
  const catchAt = src.indexOf("} catch");
  const redirectAt = src.indexOf("redirect(result.url)");
  assert.ok(tryAt >= 0 && catchAt > tryAt && redirectAt > catchAt);
  assert.equal(src.slice(tryAt, catchAt).includes("redirect("), false);
});

function restore(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}
