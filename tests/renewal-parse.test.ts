import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseRenewalEmail } from "../lib/renewal/parse-email";
import { dueReminder } from "../lib/renewal/move-plan";

const NOW = new Date("2026-10-10T12:00:00Z");

describe("parseRenewalEmail", () => {
  it("reads a Framer yearly renewal", () => {
    const parsed = parseRenewalEmail(
      `From: billing@framer.com
Subject: Your Framer Pro plan renews soon

Your Framer site plan (Pro) will renew on November 12, 2026.
Amount due: $360.00 for the year.`,
      NOW,
    );
    assert.equal(parsed.platform, "framer");
    assert.equal(parsed.planId, "pro");
    assert.equal(parsed.planLabel, "Pro");
    assert.equal(parsed.amountUsd, 360);
    assert.equal(parsed.interval, "year");
    assert.equal(parsed.renewalDate, "2026-11-12");
  });

  it("reads a Webflow monthly rate on yearly billing", () => {
    const parsed = parseRenewalEmail(
      `Webflow
Your Premium site plan renews on Jan 3, 2027.
You'll be charged $25/mo (billed yearly).`,
      NOW,
    );
    assert.equal(parsed.platform, "webflow");
    assert.equal(parsed.planId, "premium");
    assert.equal(parsed.amountUsd, 25);
    assert.equal(parsed.interval, "month");
    assert.equal(parsed.renewalDate, "2027-01-03");
  });

  it("reads Wix Business Elite from the plan name alone", () => {
    const parsed = parseRenewalEmail(
      `Your Business Elite subscription renews on 15 March 2027. Total: $1,908.00 per year.`,
      NOW,
    );
    assert.equal(parsed.platform, "wix");
    assert.equal(parsed.planId, "business-elite");
    assert.equal(parsed.amountUsd, 1908);
    assert.equal(parsed.interval, "year");
    assert.equal(parsed.renewalDate, "2027-03-15");
  });

  it("reads a Squarespace Core invoice and prefers the renewal amount", () => {
    const parsed = parseRenewalEmail(
      `Squarespace
Thanks for being on Core.
A previous credit of $5.00 was applied.
Your renewal on October 10, 2027 will charge $348.00 per year.`,
      NOW,
    );
    assert.equal(parsed.platform, "squarespace");
    assert.equal(parsed.planId, "core");
    assert.equal(parsed.amountUsd, 348);
    assert.equal(parsed.interval, "year");
    assert.equal(parsed.renewalDate, "2027-10-10");
  });

  it("does not invent a platform, plan, amount, or date", () => {
    const parsed = parseRenewalEmail("Hello, your website looks great. Talk soon.", NOW);
    assert.equal(parsed.platform, null);
    assert.equal(parsed.planId, null);
    assert.equal(parsed.amountUsd, null);
    assert.equal(parsed.interval, null);
    assert.equal(parsed.renewalDate, null);
    assert.ok(parsed.notes.length >= 3);
  });

  it("keeps an amount without an interval", () => {
    const parsed = parseRenewalEmail(
      "Webflow Basic renews on 2026-12-01. Amount due: $180.00.",
      NOW,
    );
    assert.equal(parsed.platform, "webflow");
    assert.equal(parsed.planId, "basic");
    assert.equal(parsed.amountUsd, 180);
    assert.equal(parsed.interval, null);
    assert.equal(parsed.renewalDate, "2026-12-01");
  });

  it("does not treat a legacy CMS plan as a current price", () => {
    const parsed = parseRenewalEmail(
      "Your Webflow CMS plan renews on December 1, 2026 for $23/mo.",
      NOW,
    );
    assert.equal(parsed.platform, "webflow");
    assert.equal(parsed.planId, null);
    assert.equal(parsed.planLabel, "Cms");
    assert.ok(parsed.notes.some((note) => note.includes("needs verification")));
  });

  it("ignores an impossible calendar date", () => {
    const parsed = parseRenewalEmail("Framer Basic renews on 2026-02-31. $10/mo.", NOW);
    assert.equal(parsed.renewalDate, null);
  });

  it("does not match platform names inside other words", () => {
    const parsed = parseRenewalEmail("The framers of the constitution meet on November 1, 2026.", NOW);
    assert.equal(parsed.platform, null);
  });
});

describe("dueReminder", () => {
  it("picks the window that matches days remaining", () => {
    assert.equal(dueReminder(90, []), "90");
    assert.equal(dueReminder(61, []), "90");
    assert.equal(dueReminder(60, []), "60");
    assert.equal(dueReminder(30, []), "30");
    assert.equal(dueReminder(1, []), "30");
  });

  it("does not resend a slot or fire outside the windows", () => {
    assert.equal(dueReminder(90, ["90"]), null);
    assert.equal(dueReminder(45, ["60"]), null);
    assert.equal(dueReminder(0, []), null);
    assert.equal(dueReminder(120, []), null);
  });
});
