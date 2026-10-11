import { costConstants } from "./cost-constants";
import { assertCrawlDocument } from "./crawl-guard";
import type { CrawlSnapshot } from "./complexity";
import { extractInternalLinks, isHtmlDocument } from "./page-extract";
import { loadRobots, RobotsError, type RobotsRules } from "./robots";
import { assertPublicHttpUrl, safeFetch, type LookupFn } from "./ssrf";

export type CrawlDeps = {
  lookupFn?: LookupFn;
  fetchImpl?: typeof fetch;
  now?: () => number;
};

function resolveHttp(base: string, href: string): string | null {
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) {
    return null;
  }
  try {
    const url = new URL(href, base);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function looksLikePage(url: string): boolean {
  try {
    const pathName = new URL(url).pathname;
    return !/\.(xml|pdf|zip|png|jpe?g|gif|webp|svg|css|js|mp4|mp3|woff2?|ico)$/i.test(pathName);
  } catch {
    return false;
  }
}

/** Directory prefix of the start URL ("/uploads/demos/x/" -> "/uploads/demos/x"); "" means the whole host. */
export function crawlScope(startUrl: string): string {
  const pathName = new URL(startUrl).pathname;
  const dir = pathName.endsWith("/") ? pathName : pathName.replace(/\/[^/]*$/, "");
  return dir.replace(/\/$/, "");
}

function inScope(url: string, scope: string): boolean {
  if (!scope) return true;
  const pathName = new URL(url).pathname;
  return pathName === scope || pathName.startsWith(scope + "/");
}

function assetUrls(html: string, pageUrl: string): string[] {
  const found = new Set<string>();
  const patterns = [
    /<(?:img|script|source|video)[^>]+src=["']([^"']+)["']/gi,
    /href=["']([^"']+\.(?:css|js|woff2?|ttf))["']/gi,
  ];
  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      const next = resolveHttp(pageUrl, match[1] ?? "");
      if (next) found.add(next);
    }
  }
  return Array.from(found);
}

async function readCapped(response: Response, max: number): Promise<string> {
  const length = Number(response.headers.get("content-length") ?? "0");
  if (length > max) return "";
  const text = await response.text();
  return text.slice(0, max);
}

async function countSitemap(
  origin: string,
  deps: CrawlDeps,
  robots: RobotsRules,
  scope: string,
): Promise<number> {
  for (const candidate of [`${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`]) {
    try {
      const response = await safeFetch(candidate, {
        timeoutMs: 6_000,
        lookupFn: deps.lookupFn,
        fetchImpl: deps.fetchImpl,
      });
      if (!response.ok) continue;
      const text = await readCapped(response, costConstants.htmlByteCap);
      if (/<sitemapindex/i.test(text)) {
        const child = text.match(/<loc>([^<]+)<\/loc>/i)?.[1];
        if (!child) continue;
        const childResponse = await safeFetch(child.trim(), {
          timeoutMs: 6_000,
          lookupFn: deps.lookupFn,
          fetchImpl: deps.fetchImpl,
        });
        if (!childResponse.ok) continue;
        const childText = await readCapped(childResponse, costConstants.htmlByteCap);
        return Math.min(childText.match(/<loc>/gi)?.length ?? 0, 999);
      }
      const locs = [...text.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => match[1] ?? "");
      const count = locs.filter((loc) => {
        if (!looksLikePage(loc) || !inScope(loc, scope)) return false;
        try {
          return robots.allows(new URL(loc).pathname || "/");
        } catch {
          return false;
        }
      }).length;
      if (count) return Math.min(count, 999);
    } catch {
      /* try the next sitemap candidate */
    }
  }
  return 0;
}

async function sampleBytes(urls: string[], limit: number, deps: CrawlDeps): Promise<Array<{ url: string; bytes: number }>> {
  const samples: Array<{ url: string; bytes: number }> = [];
  for (const url of urls.slice(0, limit)) {
    try {
      const response = await safeFetch(url, {
        timeoutMs: 5_000,
        lookupFn: deps.lookupFn,
        fetchImpl: deps.fetchImpl,
        headers: { Accept: "*/*" },
      });
      const header = Number(response.headers.get("content-length") ?? "0");
      if (header > 0) {
        samples.push({ url, bytes: header });
        await response.body?.cancel();
        continue;
      }
      const text = await readCapped(response, 200_000);
      samples.push({ url, bytes: text.length });
    } catch {
      /* a blocked or missing asset is recorded as unknown by omission */
    }
  }
  return samples;
}

export async function crawlSite(rawUrl: string, deps: CrawlDeps = {}): Promise<CrawlSnapshot> {
  const normalized = /^https?:\/\//i.test(rawUrl.trim()) ? rawUrl.trim() : `https://${rawUrl.trim()}`;
  const start = await assertPublicHttpUrl(normalized, deps.lookupFn);
  const robots = await loadRobots(start.origin, deps);
  if (!robots.allows(start.pathname || "/")) throw new RobotsError();
  const now = deps.now ?? Date.now;
  const deadline = now() + costConstants.crawlTotalBudgetMs;
  const scope = crawlScope(start.toString());
  const queue = [start.toString()];
  const seen = new Set<string>();
  const pages: CrawlSnapshot["pages"] = [];

  while (queue.length && pages.length < costConstants.crawlMaxPages && now() < deadline) {
    const next = queue.shift()!;
    const key = next.replace(/\/$/, "");
    if (seen.has(key)) continue;
    seen.add(key);
    try {
      const allowed = await assertCrawlDocument(next, robots, deps.lookupFn);
      if (allowed.origin !== start.origin) continue;
      const response = await safeFetch(next, {
        timeoutMs: costConstants.crawlPerPageTimeoutMs,
        lookupFn: deps.lookupFn,
        fetchImpl: deps.fetchImpl,
      });
      if (!response.ok) continue;
      const type = response.headers.get("content-type") ?? "";
      const finalUrl = response.url || next;
      let final: URL;
      try {
        final = await assertCrawlDocument(finalUrl, robots, deps.lookupFn);
      } catch (err) {
        if (err instanceof RobotsError) continue;
        throw err;
      }
      if (final.origin !== start.origin) continue;
      const html = await readCapped(response, costConstants.htmlByteCap);
      if (!isHtmlDocument(html, type)) continue;
      pages.push({ url: final.toString(), html, bytes: html.length });
      for (const link of extractInternalLinks(html, final.toString(), scope)) {
        if (!seen.has(link.replace(/\/$/, ""))) queue.push(link);
      }
    } catch (err) {
      if (err instanceof RobotsError) continue;
      /* skip pages that fail the public-URL check or the network */
    }
  }

  if (!pages.length) {
    throw new Error("We couldn't read that website. Check the URL and try again.");
  }

  const origin = new URL(pages[0]!.url).origin;
  const sitemapPageCount = await countSitemap(origin, deps, robots, scope);
  const assets = Array.from(new Set(pages.flatMap((page) => assetUrls(page.html, page.url))));
  const scripts = assets.filter((url) => /\.js(\?|$)/i.test(url) || /\/scripts?\//i.test(url));
  const [scriptSamples, assetSamples] = await Promise.all([
    sampleBytes(scripts, costConstants.scriptSampleCount, deps),
    sampleBytes(
      assets.filter((url) => !scripts.includes(url)),
      costConstants.assetSampleCount,
      deps,
    ),
  ]);

  return {
    requestedUrl: normalized,
    finalUrl: pages[0]!.url,
    pages,
    sitemapPageCount,
    scriptSamples,
    assetSamples,
  };
}
