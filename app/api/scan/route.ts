import { NextResponse } from "next/server";

export const runtime = "edge";

type Platform = "webflow" | "framer" | "wix" | "squarespace" | "shopify" | "wordpress" | "other";

const PLATFORM_HINTS: { platform: Platform; patterns: RegExp[] }[] = [
  {
    platform: "webflow",
    patterns: [/<meta[^>]+content="Webflow"/i, /webflow\.io/, /wf-form-/, /data-wf-page/, /\.webflow\./],
  },
  {
    platform: "framer",
    patterns: [/framerusercontent\.com/, /framer\.app/, /<meta[^>]+content="Framer"/i, /\.framer\./],
  },
  {
    platform: "wix",
    patterns: [/static\.parastorage\.com/, /Wix\.com Website Builder/i, /_wixCIDX/, /wixsite\.com/],
  },
  {
    platform: "squarespace",
    patterns: [/squarespace\.com/i, /sqsp\.net/, /static1\.squarespace\.com/],
  },
  {
    platform: "shopify",
    patterns: [/cdn\.shopify\.com/, /Shopify\.theme/, /\.myshopify\.com/],
  },
  {
    platform: "wordpress",
    patterns: [/wp-content/, /wp-includes/, /<meta[^>]+content="WordPress/i],
  },
];

const PLATFORM_LABELS: Record<Platform, string> = {
  webflow: "Webflow",
  framer: "Framer",
  wix: "Wix",
  squarespace: "Squarespace",
  shopify: "Shopify",
  wordpress: "WordPress",
  other: "Custom or unknown",
};

// Conservative, generous-to-the-customer cost estimates by platform (USD/mo).
const PLATFORM_MONTHLY_COST: Record<Platform, number> = {
  webflow: 29,
  framer: 30,
  wix: 29,
  squarespace: 23,
  shopify: 39,
  wordpress: 25, // hosting + plugins
  other: 20,
};

function normalizeUrl(input: string): string {
  let s = input.trim();
  if (!s) throw new Error("missing url");
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  const u = new URL(s);
  return u.toString();
}

async function fetchWithTimeout(url: string, ms: number, init?: RequestInit) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, {
      ...init,
      signal: ctrl.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; EjectScan/0.1; +https://eject.co/scan)",
        Accept: "text/html,application/xhtml+xml,application/xml,*/*",
        ...(init?.headers ?? {}),
      },
    });
    return r;
  } finally {
    clearTimeout(t);
  }
}

function detectPlatform(html: string): Platform {
  for (const { platform, patterns } of PLATFORM_HINTS) {
    if (patterns.some((re) => re.test(html))) return platform;
  }
  return "other";
}

function pickTitle(html: string): string {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return (m?.[1] ?? "").trim().slice(0, 200);
}

function pickDescription(html: string): string {
  const m =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i);
  return (m?.[1] ?? "").trim().slice(0, 300);
}

async function countPages(origin: string): Promise<number> {
  // Try sitemap.xml then sitemap_index.xml.
  const candidates = [`${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`, `${origin}/sitemap-0.xml`];
  for (const c of candidates) {
    try {
      const r = await fetchWithTimeout(c, 6000);
      if (!r.ok) continue;
      const text = await r.text();
      // Count <loc>…</loc> entries; if it's a sitemap index, fetch first child.
      const isIndex = /<sitemapindex/i.test(text);
      if (isIndex) {
        const firstChild = text.match(/<loc>([^<]+)<\/loc>/i)?.[1];
        if (firstChild) {
          const cr = await fetchWithTimeout(firstChild, 6000);
          if (cr.ok) {
            const ct = await cr.text();
            const matches = ct.match(/<loc>/gi);
            if (matches) return Math.min(matches.length, 999);
          }
        }
        continue;
      }
      const matches = text.match(/<loc>/gi);
      if (matches) return Math.min(matches.length, 999);
    } catch {
      /* try next */
    }
  }
  return 0;
}

export async function POST(req: Request) {
  const t0 = Date.now();
  try {
    const body = (await req.json()) as { url?: string };
    if (!body?.url) {
      return NextResponse.json({ ok: false, error: "missing url" }, { status: 400 });
    }
    const url = normalizeUrl(body.url);
    const origin = new URL(url).origin;

    // Fetch homepage; budget ~6s.
    const homeRes = await fetchWithTimeout(url, 6500);
    if (!homeRes.ok) {
      return NextResponse.json(
        { ok: false, error: `couldn't reach the site (status ${homeRes.status}). check the URL.` },
        { status: 422 },
      );
    }
    const html = await homeRes.text();

    const platform = detectPlatform(html);
    const title = pickTitle(html);
    const description = pickDescription(html);

    // Pages: try sitemap; if zero, return 0 (we'll display "we'll discover this during migration").
    const pageCount = await countPages(origin);

    // Cost estimate: monthly + annual + 36-month TCO.
    const monthly = PLATFORM_MONTHLY_COST[platform];
    const annual = monthly * 12;
    const threeYear = annual * 3;

    // Eject cost over 3 years: $499 once + ~$15/yr domain.
    const ejectThreeYear = 499 + 15 * 3;
    const savings = Math.max(0, threeYear - ejectThreeYear);

    return NextResponse.json({
      ok: true,
      url,
      platform,
      platformLabel: PLATFORM_LABELS[platform],
      title,
      description,
      pageCount,
      monthlyCostEstimate: monthly,
      annualCostEstimate: annual,
      threeYearCostEstimate: threeYear,
      ejectThreeYearCost: ejectThreeYear,
      threeYearSavings: savings,
      durationMs: Date.now() - t0,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message || "scan failed" },
      { status: 500 },
    );
  }
}
