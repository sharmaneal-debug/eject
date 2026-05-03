import { NextResponse } from "next/server";
import { logLead } from "@/lib/leads";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "edge";

const SCAN_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const SCAN_MAX_PER_IP = 12; // ~12 scans per hour per IP

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
 // Reject obvious garbage: must have a dot in the hostname
 const hostMatch = s.match(/^https?:\/\/([^/]+)/i);
 const host = hostMatch?.[1] ?? "";
 if (!host.includes(".") || host.length < 4) {
   throw new Error("That doesn't look like a website URL. Try something like example.com.");
 }
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
 "User-Agent": "Mozilla/5.0 (compatible; EjectScan/0.1; +https://ejectfrom.com/scan)",
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

 // Rate limit per IP — prevents anyone from running up our Anthropic budget
 // by scripting the scanner.
 const ip = clientIp(req);
 const rl = rateLimit({ key: `scan:${ip}`, windowMs: SCAN_WINDOW_MS, max: SCAN_MAX_PER_IP });
 if (!rl.ok) {
 const retryAfter = Math.max(1, Math.ceil((rl.resetAt - Date.now()) / 1000));
 return NextResponse.json(
 { ok: false, error: "you've hit the scan limit for this hour. try again in a bit." },
 { status: 429, headers: { "Retry-After": String(retryAfter) } },
 );
 }

 try {
 const body = (await req.json()) as { url?: string };
 if (!body?.url) {
 return NextResponse.json({ ok: false, error: "missing url" }, { status: 400 });
 }
 const url = normalizeUrl(body.url);
 const origin = new URL(url).origin;

 // Fetch homepage; budget ~6s.
 let homeRes;
 try {
 homeRes = await fetchWithTimeout(url, 6500);
 } catch {
 return NextResponse.json(
 { ok: false, error: "We couldn't find that website. Check the URL and try again." },
 { status: 422 },
 );
 }
 if (!homeRes.ok) {
 return NextResponse.json(
 { ok: false, error: `That URL returned ${homeRes.status}. Maybe the site is down, or the URL is wrong?` },
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

 // Log every scan to Google Sheets for funnel tracking. Fire-and-forget.
 logLead({
 event: "scan_completed",
 data: {
 url,
 hostname: new URL(url).hostname,
 platform,
 pageCount,
 monthlyCostEstimate: monthly,
 annualCostEstimate: annual,
 durationMs: Date.now() - t0,
 userAgent: req.headers.get("user-agent") ?? "",
 referer: req.headers.get("referer") ?? "",
 },
 });

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
 const msg = (err as Error).message || "";
 // If our normalizer threw a friendly message, pass it through with 422
 if (msg.includes("doesn't look like a website URL") || msg.includes("missing url")) {
 return NextResponse.json({ ok: false, error: msg }, { status: 422 });
 }
 // Anything else: avoid leaking internals
 return NextResponse.json(
 { ok: false, error: "We couldn't find that website. Check the URL and try again." },
 { status: 500 },
 );
 }
}
