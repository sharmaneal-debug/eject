#!/usr/bin/env tsx
/**
 * Eject — prospect audit
 * ----------------------
 * For an outbound prospect, computes the data needed to personalize the cold
 * email + Loom audit:
 *   - platform detection (Webflow / Framer / Wix / Squarespace)
 *   - Lighthouse score (Google PageSpeed Insights free tier)
 *   - estimated annual cost (heuristic by detected features)
 *   - CMS item count (rough)
 *
 * Output: a JSON record per URL appended to `data/audits/{date}.jsonl`.
 *
 * Usage:
 *   pnpm tsx scripts/audit.ts https://example.com
 *   pnpm tsx scripts/audit.ts --batch=data/prospects/2026-05-02.csv
 */

import { chromium } from "playwright";
import { mkdir, appendFile, readFile } from "node:fs/promises";
import path from "node:path";

type Audit = {
  url: string;
  hostname: string;
  platform: "webflow" | "framer" | "wix" | "squarespace" | "unknown";
  lighthousePerformance: number | null;
  estimatedMonthlyCost: number;
  estimatedAnnualCost: number;
  cmsCollections: number;
  cmsItemCount: number;
  hasCustomDomain: boolean;
  capturedAt: string;
};

async function detectAndMeasure(url: string): Promise<Audit> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.waitForTimeout(800);

  const html = await page.content();

  let platform: Audit["platform"] = "unknown";
  if (/<meta[^>]+content="Webflow"/i.test(html) || /webflow\.io/.test(html)) platform = "webflow";
  else if (/framerusercontent\.com|framer\.app|<meta[^>]+content="Framer"/i.test(html)) platform = "framer";
  else if (/static\.parastorage\.com|wix\.com Website Builder/i.test(html)) platform = "wix";
  else if (/squarespace\.com|sqsp\.net/i.test(html)) platform = "squarespace";

  // Rough CMS-item heuristics by platform.
  const cmsItemCount = await page.evaluate((p) => {
    if (p === "webflow") return document.querySelectorAll(".w-dyn-item, .wf-collection-list-wrapper > * > *").length;
    if (p === "framer") return document.querySelectorAll('[data-framer-name*="item" i]').length;
    return 0;
  }, platform);

  const cmsCollections = await page.evaluate((p) => {
    if (p === "webflow") return document.querySelectorAll(".w-dyn-list, .wf-collection-list-wrapper").length;
    return 0;
  }, platform);

  await browser.close();

  const hostname = new URL(url).hostname;
  const hasCustomDomain = !/\.(webflow\.io|framer\.app|framer\.website|squarespace\.com|wixsite\.com)$/.test(hostname);

  // Cost heuristic — conservative defaults; real personalization can override.
  let monthly = 0;
  if (platform === "webflow") {
    monthly = cmsCollections > 0 ? 39 : 23; // CMS or Business
    if (hasCustomDomain) monthly += 19; // Workspace seat
  } else if (platform === "framer") {
    monthly = hasCustomDomain ? 30 : 10;
    if (cmsItemCount > 50) monthly = 80; // Business
  } else if (platform === "wix") {
    monthly = hasCustomDomain ? 29 : 17;
  } else if (platform === "squarespace") {
    monthly = hasCustomDomain ? 23 : 16;
  }

  // Lighthouse via Google PageSpeed Insights (free, no API key required for low volume).
  let lighthousePerformance: number | null = null;
  try {
    const psi = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance`,
    );
    if (psi.ok) {
      const data = (await psi.json()) as { lighthouseResult?: { categories?: { performance?: { score?: number } } } };
      const score = data.lighthouseResult?.categories?.performance?.score;
      if (typeof score === "number") lighthousePerformance = Math.round(score * 100);
    }
  } catch {
    /* network or rate-limit; non-fatal */
  }

  return {
    url,
    hostname,
    platform,
    lighthousePerformance,
    estimatedMonthlyCost: monthly,
    estimatedAnnualCost: monthly * 12,
    cmsCollections,
    cmsItemCount,
    hasCustomDomain,
    capturedAt: new Date().toISOString(),
  };
}

async function run() {
  const args = process.argv.slice(2);
  const flags = Object.fromEntries(
    args
      .filter((a) => a.startsWith("--"))
      .map((a) => {
        const [k, v = "true"] = a.replace(/^--/, "").split("=");
        return [k, v];
      }),
  );
  const positional = args.filter((a) => !a.startsWith("--"));

  const targets: string[] = [];
  if (flags.batch) {
    const csv = await readFile(String(flags.batch), "utf8");
    csv.split(/\r?\n/).forEach((line) => {
      const url = line.split(",")[0]?.trim();
      if (url && /^https?:\/\//.test(url)) targets.push(url);
    });
  }
  if (positional.length) targets.push(...positional);

  if (!targets.length) {
    console.error("usage: pnpm tsx scripts/audit.ts <url> [--batch=path.csv]");
    process.exit(2);
  }

  const date = new Date().toISOString().slice(0, 10);
  const out = path.join("data", "audits", `${date}.jsonl`);
  await mkdir(path.dirname(out), { recursive: true });

  for (const url of targets) {
    try {
      console.log(`→ ${url}`);
      const audit = await detectAndMeasure(url);
      console.log(
        `  ${audit.platform}  ·  $${audit.estimatedAnnualCost}/yr  ·  Lighthouse ${audit.lighthousePerformance ?? "—"}  ·  ${audit.cmsItemCount} CMS items`,
      );
      await appendFile(out, JSON.stringify(audit) + "\n", "utf8");
    } catch (err) {
      console.warn(`  ! ${(err as Error).message}`);
    }
  }
  console.log(`\n✓ wrote audits to ${out}`);
}

run();
