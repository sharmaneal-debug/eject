import assert from "node:assert/strict";
import { test } from "node:test";
import { analyzeSnapshot, type CrawlSnapshot } from "../lib/complexity";
import { costConstants } from "../lib/cost-constants";
import { assertPublicHttpUrl, isBlockedIp, SsrfError } from "../lib/ssrf";

function snapshot(pages: string[], sitemapPageCount = 0): CrawlSnapshot {
  return {
    requestedUrl: "https://example.com/",
    finalUrl: "https://example.com/",
    pages: pages.map((html, index) => ({
      url: index === 0 ? "https://example.com/" : `https://example.com/p${index}`,
      html,
      bytes: html.length,
    })),
    sitemapPageCount,
    scriptSamples: [],
    assetSamples: [],
  };
}

test("a simple page is eligible on both tiers", () => {
  const html = "<html><head><title>Studio</title></head><body><h1>Hello</h1><form></form></body></html>";
  const automated = analyzeSnapshot(snapshot([html]), { tier: "automated", amountUsd: 99 });
  const done = analyzeSnapshot(snapshot([html]), { tier: "done_for_you", amountUsd: 199 });
  assert.equal(automated.eligibility, "ELIGIBLE");
  assert.equal(automated.referral, "none");
  assert.equal(automated.formCount, 1);
  assert.equal(automated.migration.humanMinutes, costConstants.automatedReviewMinutes);
  assert.equal(done.eligibility, "ELIGIBLE");
  assert.equal(done.migration.humanMinutes, costConstants.doneForYouPolishMinutes + costConstants.handoffMinutes);
  assert.ok(automated.costToServe.totalUsd > 0);
  assert.ok(done.costToServe.humanUsd > automated.costToServe.humanUsd);
});

test("a repeated footer form counts once", () => {
  const page = "<html><body><form id='footer'></form><p>Page</p></body></html>";
  const report = analyzeSnapshot(snapshot([page, page, page]), { tier: "automated", amountUsd: 99 });
  assert.equal(report.formCount, 1);
  assert.equal(report.eligibility, "ELIGIBLE");
});

test("shopify is a refer-out", () => {
  const report = analyzeSnapshot(
    snapshot(["<html><script src='https://cdn.shopify.com/shop.js'></script></html>"]),
    { tier: "automated", amountUsd: 99 },
  );
  assert.equal(report.eligibility, "NOT_ELIGIBLE");
  assert.equal(report.referral, "refer_out");
});

test("more than 10 pages or more than 1 form is an add-on", () => {
  const pages = Array.from({ length: 11 }, () => "<html><p>page</p></html>");
  const overPages = analyzeSnapshot(snapshot(pages), { tier: "done_for_you", amountUsd: 199 });
  assert.equal(overPages.pageCount, 11);
  assert.equal(overPages.eligibility, "NOT_ELIGIBLE");
  assert.equal(overPages.referral, "add_on");

  const overForms = analyzeSnapshot(snapshot(["<html><form></form><form></form></html>"]), {
    tier: "automated",
    amountUsd: 99,
  });
  assert.equal(overForms.formCount, 2);
  assert.equal(overForms.referral, "add_on");
});

test("sitemap count can push a site over the page cap", () => {
  const report = analyzeSnapshot(snapshot(["<html><p>only crawled one</p></html>"], 12), {
    tier: "automated",
    amountUsd: 99,
  });
  assert.equal(report.pageCount, 12);
  assert.equal(report.referral, "add_on");
});

test("ssrf blocks private hosts, odd ports, credentials, and private DNS", async () => {
  const blocked = [
    "http://127.0.0.1/",
    "http://localhost/admin",
    "http://169.254.169.254/latest/meta-data",
    "https://example.com:8443/",
    "https://user:pass@example.com/",
    "file:///etc/passwd",
    "http://metadata.google.internal/",
    "https://app.internal/",
  ];
  for (const url of blocked) {
    await assert.rejects(() => assertPublicHttpUrl(url, async () => ["1.1.1.1"]), SsrfError);
  }
  await assert.rejects(
    () => assertPublicHttpUrl("https://example.com/", async () => ["10.1.2.3"]),
    (err: unknown) => err instanceof SsrfError && err.code === "private-dns",
  );
  const ok = await assertPublicHttpUrl("https://example.com/path", async () => ["1.1.1.1"]);
  assert.equal(ok.hostname, "example.com");
  assert.equal(isBlockedIp("192.168.1.9"), true);
  assert.equal(isBlockedIp("8.8.8.8"), false);
});
