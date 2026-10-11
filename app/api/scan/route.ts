import { NextResponse } from "next/server";
import { logLead } from "@/lib/leads";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { safeFetch, SsrfError } from "@/lib/ssrf";
import { detectPlatform, PLATFORM_LABELS, type Platform } from "@/lib/platform";
import { buildScanEstimate } from "@/lib/scan-estimate";
import { costConstants } from "@/lib/cost-constants";

export const runtime = "nodejs";

const SCAN_WINDOW_MS = 60 * 60 * 1000;
const SCAN_MAX_PER_IP = 8;
const SCAN_MAX_GLOBAL = 60;

function friendlyUrl(input: string): string {
  let value = input.trim();
  if (!value) throw new Error("missing url");
  if (value.length > 300) throw new Error("That URL can't be scanned.");
  if (!/^https?:\/\//i.test(value)) value = `https://${value}`;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("That URL can't be scanned.");
  }
  const host = url.hostname.replace(/\.$/, "");
  if (!host.includes(".") || host.length < 4) throw new Error("That URL can't be scanned.");
  return url.toString();
}

async function countPages(origin: string): Promise<number> {
  const candidates = [`${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`, `${origin}/sitemap-0.xml`];
  for (const candidate of candidates) {
    try {
      const response = await safeFetch(candidate, { timeoutMs: 6000 });
      if (!response.ok) continue;
      const text = (await response.text()).slice(0, costConstants.htmlByteCap);
      if (/<sitemapindex/i.test(text)) {
        const firstChild = text.match(/<loc>([^<]+)<\/loc>/i)?.[1];
        if (!firstChild) continue;
        const child = await safeFetch(firstChild.trim(), { timeoutMs: 6000 });
        if (!child.ok) continue;
        const childText = (await child.text()).slice(0, costConstants.htmlByteCap);
        return Math.min(childText.match(/<loc>/gi)?.length ?? 0, 999);
      }
      const matches = text.match(/<loc>/gi);
      if (matches) return Math.min(matches.length, 999);
    } catch {
      /* try the next sitemap */
    }
  }
  return 0;
}

function pickTitle(html: string): string {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return (match?.[1] ?? "").replace(/\s+/g, " ").trim().slice(0, 200);
}

function pickDescription(html: string): string {
  const match =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i);
  return (match?.[1] ?? "").trim().slice(0, 300);
}

export async function POST(req: Request) {
  const started = Date.now();
  const ip = clientIp(req);
  const limit = rateLimit({ key: `scan:${ip}`, windowMs: SCAN_WINDOW_MS, max: SCAN_MAX_PER_IP });
  const globalLimit = rateLimit({ key: "scan:global", windowMs: SCAN_WINDOW_MS, max: SCAN_MAX_GLOBAL });
  if (!limit.ok || !globalLimit.ok) {
    const retryAfter = Math.max(1, Math.ceil((limit.resetAt - Date.now()) / 1000));
    return NextResponse.json(
      { ok: false, error: "you've hit the scan limit for this hour. try again in a bit." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  try {
    const body = (await req.json()) as { url?: string };
    if (!body?.url) return NextResponse.json({ ok: false, error: "missing url" }, { status: 400 });

    let requested: string;
    try {
      requested = friendlyUrl(body.url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "missing url";
      return NextResponse.json({ ok: false, error: message }, { status: 422 });
    }

    let home: Response;
    try {
      home = await safeFetch(requested, { timeoutMs: 6500 });
    } catch (err) {
      if (err instanceof SsrfError) {
        return NextResponse.json({ ok: false, error: "That URL can't be scanned." }, { status: 422 });
      }
      return NextResponse.json(
        { ok: false, error: "We couldn't find that website. Check the URL and try again." },
        { status: 422 },
      );
    }
    if (!home.ok) {
      return NextResponse.json(
        { ok: false, error: `That URL returned ${home.status}. Maybe the site is down, or the URL is wrong?` },
        { status: 422 },
      );
    }

    const html = (await home.text()).slice(0, costConstants.htmlByteCap);
    const finalUrl = home.url || requested;
    const platform: Platform = detectPlatform(html);
    const pageCount = await countPages(new URL(finalUrl).origin);
    const estimate = buildScanEstimate(platform);

    logLead({
      event: "scan_completed",
      data: {
        url: finalUrl,
        hostname: new URL(finalUrl).hostname,
        platform,
        pageCount,
        monthlyCostEstimate: estimate.monthlyCostEstimate,
        annualCostEstimate: estimate.annualCostEstimate,
        durationMs: Date.now() - started,
      },
    });

    return NextResponse.json({
      ok: true,
      url: finalUrl,
      platform,
      platformLabel: PLATFORM_LABELS[platform],
      title: pickTitle(html),
      description: pickDescription(html),
      pageCount,
      ...estimate,
      durationMs: Date.now() - started,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "We couldn't find that website. Check the URL and try again." },
      { status: 500 },
    );
  }
}
