export type Platform = "webflow" | "framer" | "wix" | "squarespace" | "shopify" | "wordpress" | "other";

const PLATFORM_HINTS: { platform: Platform; patterns: RegExp[] }[] = [
  { platform: "webflow", patterns: [/<meta[^>]+content="Webflow"/i, /webflow\.io/, /wf-form-/, /data-wf-page/, /\.webflow\./] },
  { platform: "framer", patterns: [/framerusercontent\.com/, /framer\.app/, /<meta[^>]+content="Framer"/i, /\.framer\./] },
  { platform: "wix", patterns: [/static\.parastorage\.com/, /Wix\.com Website Builder/i, /_wixCIDX/, /wixsite\.com/] },
  { platform: "squarespace", patterns: [/squarespace\.com/i, /sqsp\.net/, /static1\.squarespace\.com/] },
  { platform: "shopify", patterns: [/cdn\.shopify\.com/, /Shopify\.theme/, /\.myshopify\.com/] },
  { platform: "wordpress", patterns: [/wp-content/, /wp-includes/, /<meta[^>]+content="WordPress/i] },
];

export const PLATFORM_LABELS: Record<Platform, string> = {
  webflow: "Webflow",
  framer: "Framer",
  wix: "Wix",
  squarespace: "Squarespace",
  shopify: "Shopify",
  wordpress: "WordPress",
  other: "Custom or unknown",
};

// Typical published plan prices, used only by the free scan comparison.
export const PLATFORM_MONTHLY_COST: Record<Platform, number> = {
  webflow: 29,
  framer: 30,
  wix: 29,
  squarespace: 23,
  shopify: 39,
  wordpress: 25,
  other: 20,
};

export function detectPlatform(html: string): Platform {
  for (const { platform, patterns } of PLATFORM_HINTS) {
    if (patterns.some((re) => re.test(html))) return platform;
  }
  return "other";
}

export function detectPlatformFromPages(htmlPages: string[]): Platform {
  const found = htmlPages.map((html) => detectPlatform(html));
  if (found.includes("shopify")) return "shopify";
  return found.find((platform) => platform !== "other") ?? "other";
}
