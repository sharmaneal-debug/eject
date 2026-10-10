import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { siteConfig } from "../lib/site";
import { ongoingYearlyUsd } from "../lib/pricing/ongoing";
import { PLATFORMS, SELF_HOSTED } from "../lib/pricing/platforms";
import { annualFromListPrice, annualFromRenewalCharge, calculateSavings } from "../lib/pricing/savings";
import { buildMovePlan } from "../lib/renewal/move-plan";

describe("eject offer prices", () => {
  it("reads Automated $99 from the shared config and keeps custom work unpriced", () => {
    assert.equal(siteConfig.pricing.express.id, "express");
    assert.equal(siteConfig.pricing.express.name, "Automated");
    assert.equal(siteConfig.pricing.express.price, 99);
    assert.equal(siteConfig.pricing.express.cta, "Buy now");
    assert.equal(siteConfig.pricing.concierge.id, "concierge");
    assert.equal(siteConfig.pricing.concierge.name, "Custom");
    assert.equal("price" in siteConfig.pricing.concierge, false);
    assert.equal(siteConfig.pricing.concierge.blurb, "We handle the migration for you, step by step.");
    assert.equal(siteConfig.description.includes("199"), false);
    assert.equal(siteConfig.pricing.concierge.blurb.toLowerCase().includes("neal"), false);
    assert.equal(siteConfig.pricing.concierge.cap.pages, 10);
    assert.equal(siteConfig.pricing.concierge.cap.forms, 1);
    assert.equal(siteConfig.pricing.concierge.cap.revisionRounds, 2);
    assert.equal(siteConfig.pricing.concierge.cap.handoffMinutes, 30);
  });
});

describe("platform price file", () => {
  it("has a source URL and a checked date on every plan, and no guessed zeroes", () => {
    assert.equal(SELF_HOSTED.annualUsd, ongoingYearlyUsd());
    assert.equal(SELF_HOSTED.annualUsd, SELF_HOSTED.domainUsdPerYear + SELF_HOSTED.hostingUsdPerYear);
    assert.match(SELF_HOSTED.sourceUrl, /^https:\/\//);
    assert.match(SELF_HOSTED.lastChecked, /^\d{4}-\d{2}-\d{2}$/);

    for (const platform of PLATFORMS) {
      assert.match(platform.pricingPageUrl, /^https:\/\//);
      assert.ok(platform.plans.length > 0);
      for (const plan of platform.plans) {
        assert.match(plan.sourceUrl, /^https:\/\//);
        assert.match(plan.lastChecked, /^\d{4}-\d{2}-\d{2}$/);
        assert.ok(plan.notes.length > 20);
        const amounts = [plan.yearlyBilledMonthlyUsd, plan.monthlyBilledUsd];
        if (plan.status === "needs-verification") {
          assert.ok(amounts.every((amount) => amount == null));
        } else {
          assert.equal(plan.status, "verified");
          assert.ok(amounts.some((amount) => amount != null && amount > 0));
        }
      }
    }
  });
});

describe("calculateSavings", () => {
  it("annualizes Framer Basic from the yearly list price", () => {
    const result = calculateSavings({
      platformId: "framer",
      planId: "basic",
      billing: "yearly",
      years: 3,
      ejectOneTimeUsd: 49,
    });
    assert.equal(result.priceStatus, "verified");
    assert.equal(result.annualPlatformUsd, 120);
    assert.equal(result.platformTotalUsd, 360);
    assert.equal(result.selfHostedTotalUsd, ongoingYearlyUsd() * 3);
    assert.equal(result.savingsVsSelfHostedUsd, 360 - ongoingYearlyUsd() * 3);
    assert.equal(result.netAfterEjectUsd, 360 - ongoingYearlyUsd() * 3 - 49);
    assert.equal(annualFromListPrice(result.plan!, "yearly"), 120);
  });

  it("refuses to invent a Framer month-to-month price", () => {
    const result = calculateSavings({
      platformId: "framer",
      planId: "pro",
      billing: "monthly",
      years: 1,
    });
    assert.equal(result.annualPlatformUsd, null);
    assert.equal(result.savingsVsSelfHostedUsd, null);
    assert.equal(result.priceStatus, "needs-verification");
    assert.match(result.unavailableReason ?? "", /month-to-month/i);
  });

  it("compares Framer Pro yearly list price with the ongoing config", () => {
    const result = calculateSavings({ platformId: "framer", planId: "pro", billing: "yearly", years: 1 });
    assert.equal(result.annualPlatformUsd, 360);
    assert.equal(result.annualSelfHostedUsd, ongoingYearlyUsd());
    assert.equal(result.savingsVsSelfHostedUsd, 360 - ongoingYearlyUsd());
  });

  it("uses Webflow Basic yearly and month-to-month figures that were both published", () => {
    const yearly = calculateSavings({ platformId: "webflow", planId: "basic", billing: "yearly", years: 1 });
    const monthly = calculateSavings({ platformId: "webflow", planId: "basic", billing: "monthly", years: 1 });
    assert.equal(yearly.annualPlatformUsd, 180);
    assert.equal(monthly.annualPlatformUsd, 300);
  });

  it("uses Squarespace and Wix yearly list prices", () => {
    const squarespace = calculateSavings({
      platformId: "squarespace",
      planId: "plus",
      billing: "yearly",
      years: 1,
    });
    const wix = calculateSavings({ platformId: "wix", planId: "business", billing: "yearly", years: 1 });
    assert.equal(squarespace.annualPlatformUsd, 49 * 12);
    assert.equal(wix.annualPlatformUsd, 39 * 12);
    assert.equal(squarespace.plan?.fitsSimpleSite, false);
    assert.equal(wix.plan?.fitsSimpleSite, false);
  });

  it("annualizes a pasted renewal charge and will not guess the interval", () => {
    const yearly = annualFromRenewalCharge(360, "year");
    const monthly = annualFromRenewalCharge(25, "month");
    assert.equal(yearly, 360);
    assert.equal(monthly, 300);
    const missing = calculateSavings({
      platformId: "webflow",
      planId: "basic",
      renewalChargeUsd: 180,
      renewalInterval: null,
    });
    assert.equal(missing.annualPlatformUsd, null);
    assert.equal(missing.usingCustomCharge, true);
  });

  it("does not price an unknown plan", () => {
    const result = calculateSavings({ platformId: "wix", planId: "cms", years: 3 });
    assert.equal(result.plan, null);
    assert.equal(result.platformTotalUsd, null);
  });
});

describe("buildMovePlan", () => {
  const now = new Date("2026-10-10T00:00:00Z");

  it("lists 90, 60, and 30 day steps before a renewal 100 days out", () => {
    const plan = buildMovePlan("2027-01-18", now);
    assert.ok(plan);
    assert.equal(plan!.daysUntil, 100);
    assert.deepEqual(
      plan!.steps.map((step) => step.id),
      ["90", "60", "30", "7", "0"],
    );
    assert.equal(plan!.steps.find((step) => step.id === "90")?.passed, false);
    assert.equal(plan!.steps.find((step) => step.id === "90")?.date, "2026-10-20");
  });

  it("marks the early steps passed when the renewal is 20 days away", () => {
    const plan = buildMovePlan("2026-10-30", now);
    assert.equal(plan?.daysUntil, 20);
    assert.equal(plan?.steps.find((step) => step.id === "90")?.passed, true);
    assert.equal(plan?.steps.find((step) => step.id === "60")?.passed, true);
    assert.equal(plan?.steps.find((step) => step.id === "30")?.passed, true);
    assert.equal(plan?.steps.find((step) => step.id === "7")?.passed, false);
  });
});
