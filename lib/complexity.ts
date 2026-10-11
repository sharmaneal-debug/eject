import { costConstants, roundUsd } from "./cost-constants";
import { detectPlatformFromPages, PLATFORM_LABELS, type Platform } from "./platform";
import type { Tier } from "./stripe";

export type Eligibility = "ELIGIBLE" | "NOT_ELIGIBLE";
export type Referral = "none" | "refund" | "refer_out" | "add_on";
export type RebuildEase = "easy" | "review" | "manual";

export type CrawlSnapshot = {
  requestedUrl: string;
  finalUrl: string;
  pages: Array<{ url: string; html: string; bytes: number }>;
  sitemapPageCount: number;
  scriptSamples: Array<{ url: string; bytes: number }>;
  assetSamples: Array<{ url: string; bytes: number }>;
};

export type ComplexityReport = {
  eligibility: Eligibility;
  referral: Referral;
  reasons: string[];
  platform: Platform;
  platformLabel: string;
  pageCount: number;
  crawledPageCount: number;
  assetCount: number;
  assetBytes: number;
  scriptCount: number;
  scriptBytes: number;
  scriptBytesEstimated: boolean;
  animationSignals: string[];
  cmsCollections: number;
  cmsItems: number;
  formCount: number;
  ecommerceSignals: string[];
  membershipSignals: string[];
  assetsPullable: boolean;
  rebuildEase: RebuildEase;
  migration: {
    automatedMinutes: number;
    reviewMinutes: number;
    humanMinutes: number;
    totalHours: number;
    label: string;
  };
  costToServe: {
    computeUsd: number;
    tokensUsd: number;
    hostingUsd: number;
    humanUsd: number;
    stripeFeeUsd: number;
    totalUsd: number;
    currency: "USD";
  };
};

const ECOM_SIGNALS: Array<{ id: string; re: RegExp }> = [
  { id: "shopify", re: /cdn\.shopify\.com|Shopify\.theme|myshopify\.com/i },
  { id: "add-to-cart", re: /add[\s-]?to[\s-]?cart/i },
  { id: "cart", re: /href=["'][^"']*\/cart(?:\/|["'])/i },
  { id: "checkout", re: /href=["'][^"']*\/checkout(?:\/|["'])/i },
  { id: "product-schema", re: /"@type"\s*:\s*"Product"/i },
  { id: "snipcart", re: /snipcart/i },
];

const MEMBERSHIP_SIGNALS: Array<{ id: string; re: RegExp }> = [
  { id: "memberstack", re: /memberstack/i },
  { id: "memberspace", re: /memberspace/i },
  { id: "outseta", re: /outseta/i },
  { id: "auth-wall", re: /customers\/login|member-?only|members only/i },
];

const ANIMATION_SIGNALS: Array<{ id: string; re: RegExp }> = [
  { id: "framer", re: /framerusercontent|data-framer|framer-motion/i },
  { id: "gsap", re: /\bgsap\b|scrolltrigger/i },
  { id: "lottie", re: /lottie/i },
  { id: "webflow-ix", re: /data-w-id|webflow\.js/i },
];

function countMatches(html: string, re: RegExp): number {
  return html.match(re)?.length ?? 0;
}

function uniqueMatches(html: string, re: RegExp): string[] {
  const found = new Set<string>();
  for (const match of html.matchAll(re)) {
    const value = match[1] || match[2];
    if (value) found.add(value);
  }
  return Array.from(found);
}

function pageSignals(html: string) {
  const assets = uniqueMatches(
    html,
    /<(?:img|source|video)[^>]+src=["']([^"']+)["']|href=["']([^"']+\.(?:css|woff2?|ttf))["']/gi,
  );
  const scripts = uniqueMatches(html, /<script[^>]+src=["']([^"']+)["']/gi);
  const inline = Array.from(html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)).map((m) => m[1] ?? "");
  return {
    assets,
    scripts,
    inlineBytes: inline.reduce((sum, body) => sum + body.length, 0),
    forms: countMatches(html, /<form\b/gi),
    // Webflow collection lists only. A bare "collection-list" also matches Squarespace's script manifest
    // ("squarespace-blog-collection-list", ...), which flagged every Squarespace 7.1 site as 9 CMS blocks.
    cmsCollections: countMatches(html, /\bw-dyn-list\b|wf-collection-list/gi),
    cmsItems: countMatches(html, /w-dyn-item/gi),
    ecommerce: ECOM_SIGNALS.filter((signal) => signal.re.test(html)).map((signal) => signal.id),
    membership: MEMBERSHIP_SIGNALS.filter((signal) => signal.re.test(html)).map((signal) => signal.id),
    animation: ANIMATION_SIGNALS.filter((signal) => signal.re.test(html)).map((signal) => signal.id),
  };
}

export function analyzeSnapshot(
  snapshot: CrawlSnapshot,
  opts: { tier: Tier; amountUsd: number },
): ComplexityReport {
  const htmlPages = snapshot.pages.map((page) => page.html);
  const platform = detectPlatformFromPages(htmlPages);
  const parsed = snapshot.pages.map((page) => pageSignals(page.html));

  const assetSet = new Set(parsed.flatMap((page) => page.assets));
  const scriptSet = new Set(parsed.flatMap((page) => page.scripts));
  const dataAssets = Array.from(assetSet).filter((url) => url.startsWith("data:") || url.startsWith("blob:"));
  const assetCount = assetSet.size;
  const sampledAssetBytes = snapshot.assetSamples.reduce((sum, sample) => sum + sample.bytes, 0);
  const assetBytes = sampledAssetBytes;
  const inlineBytes = parsed.reduce((sum, page) => sum + page.inlineBytes, 0);
  const sampledScriptBytes = snapshot.scriptSamples.reduce((sum, sample) => sum + sample.bytes, 0);
  const unsampledScripts = Math.max(0, scriptSet.size - snapshot.scriptSamples.length);
  const scriptBytes = inlineBytes + sampledScriptBytes + unsampledScripts * costConstants.assumedBytesPerExternalScript;
  const scriptBytesEstimated = unsampledScripts > 0 || snapshot.scriptSamples.length === 0;
  const formCount = parsed.reduce((max, page) => Math.max(max, page.forms), 0);
  const cmsCollections = Math.max(0, ...parsed.map((page) => page.cmsCollections), 0);
  const cmsItems = Math.max(0, ...parsed.map((page) => page.cmsItems), 0);
  const ecommerceSignals = Array.from(new Set(parsed.flatMap((page) => page.ecommerce)));
  const membershipSignals = Array.from(new Set(parsed.flatMap((page) => page.membership)));
  const animationSignals = Array.from(new Set(parsed.flatMap((page) => page.animation)));
  const pageCount = Math.max(snapshot.pages.length, snapshot.sitemapPageCount);

  const commerceHeavy =
    platform === "shopify" ||
    ecommerceSignals.includes("shopify") ||
    ecommerceSignals.includes("snipcart") ||
    ecommerceSignals.filter((id) => id !== "shopify").length >= 2;

  const blockers: string[] = [];
  if (commerceHeavy) {
    blockers.push("Store or cart behavior showed up. Eject only takes simple marketing, portfolio, and landing pages.");
  }
  if (cmsCollections > costConstants.maxEligibleCmsCollections || cmsItems > costConstants.maxEligibleCmsItems) {
    blockers.push(
      `CMS weight is above the simple-site limit (${cmsCollections} collection blocks, ${cmsItems} items; limits are ${costConstants.maxEligibleCmsCollections} and ${costConstants.maxEligibleCmsItems}).`,
    );
  }
  if (pageCount > costConstants.maxEligiblePages) {
    blockers.push(
      `Page count is ${pageCount}. The included price covers up to ${costConstants.maxEligiblePages} pages. Beyond that is a refer-out or a priced add-on.`,
    );
  }
  if (membershipSignals.length > 0) {
    blockers.push("Member login or a gated area showed up. That needs a custom build, not this service.");
  }
  if (formCount > costConstants.maxEligibleForms) {
    blockers.push(
      `There are ${formCount} forms. The included price covers ${costConstants.maxEligibleForms}. Extra forms are a priced add-on or a refer-out.`,
    );
  }
  if (scriptBytes > costConstants.maxScriptBytes) {
    blockers.push("JavaScript weight is too high for a simple-site migration.");
  }

  const eligibility: Eligibility = blockers.length ? "NOT_ELIGIBLE" : "ELIGIBLE";
  const heavyCms = cmsCollections > costConstants.maxEligibleCmsCollections || cmsItems > costConstants.maxEligibleCmsItems;
  const overCap = pageCount > costConstants.maxEligiblePages || formCount > costConstants.maxEligibleForms || scriptBytes > costConstants.maxScriptBytes;
  const referral: Referral =
    eligibility === "ELIGIBLE"
      ? "none"
      : commerceHeavy || membershipSignals.length > 0 || heavyCms
        ? "refer_out"
        : overCap
          ? "add_on"
          : "refund";
  const assetsPullable = assetCount === 0 || (dataAssets.length * 2 <= assetCount && assetCount <= costConstants.maxAssetCountForEasyPull);
  const rebuildEase: RebuildEase =
    eligibility === "NOT_ELIGIBLE"
      ? "manual"
      : !assetsPullable || animationSignals.length >= 3 || scriptBytes > costConstants.maxScriptBytes / 2
        ? "review"
        : "easy";

  const humanMinutes =
    opts.tier === "done_for_you"
      ? costConstants.doneForYouPolishMinutes + costConstants.handoffMinutes
      : costConstants.automatedReviewMinutes;
  const automatedMinutes = costConstants.minutesBase + pageCount * costConstants.minutesPerPage + formCount * costConstants.minutesPerForm;
  const reviewMinutes = costConstants.reviewMinutesFlat;
  const totalMinutes = automatedMinutes + reviewMinutes + humanMinutes;
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  const computeUsd = roundUsd(pageCount * costConstants.computeUsdPerPage + assetCount * costConstants.computeUsdPerAsset);
  const tokensUsd = roundUsd(pageCount * costConstants.tokensUsdPerPage);
  const hostingUsd = roundUsd(costConstants.hostingUsdFlat);
  const humanUsd = roundUsd((humanMinutes / 60) * costConstants.humanUsdPerHour);
  const stripeFeeUsd = roundUsd(opts.amountUsd * costConstants.stripePercent + costConstants.stripeFixedUsd);
  const totalUsd = roundUsd(computeUsd + tokensUsd + hostingUsd + humanUsd + stripeFeeUsd);

  const reasons =
    eligibility === "ELIGIBLE"
      ? ["Simple marketing, portfolio, or landing page. Within the page, CMS, form, and commerce limits."]
      : blockers;

  return {
    eligibility,
    referral,
    reasons,
    platform,
    platformLabel: PLATFORM_LABELS[platform],
    pageCount,
    crawledPageCount: snapshot.pages.length,
    assetCount,
    assetBytes,
    scriptCount: scriptSet.size,
    scriptBytes,
    scriptBytesEstimated,
    animationSignals,
    cmsCollections,
    cmsItems,
    formCount,
    ecommerceSignals,
    membershipSignals,
    assetsPullable,
    rebuildEase,
    migration: {
      automatedMinutes,
      reviewMinutes,
      humanMinutes,
      totalHours,
      label:
        eligibility === "ELIGIBLE"
          ? `About ${totalHours} hours, including human review. This is an estimate, not a delivery clock.`
          : "No migration scheduled. This site is outside the simple-site scope.",
    },
    costToServe: {
      computeUsd,
      tokensUsd,
      hostingUsd,
      humanUsd,
      stripeFeeUsd,
      totalUsd,
      currency: "USD",
    },
  };
}
