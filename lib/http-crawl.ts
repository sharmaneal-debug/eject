import { costConstants } from "./cost-constants";
import { assertPublicHttpUrl, safeFetch, type LookupFn } from "./ssrf";
import type { CrawlSnapshot } from "./complexity";

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

function sameOrigin(a: string, b: string): boolean {
  try {
    return new URL(a).origin === new URL(b).origin;
  } catch {
    return false;
  }
}

function linksFrom(html: string, pageUrl: string): string[] {
  const found = new Set<string>();
  for (const match of html.matchAll(/href=["']([^"'#]+)["']/gi)) {
    const next = resolveHttp(pageUrl, match[1] ?? "");
    if (next && sameOrigin(pageUrl, next)) found.add(next.split("?")[0]!.replace(/\/$/, "") || next);
  }
  return Array.from(found);
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
      const count = text.match(/<loc>/gi)?.length ?? 0;
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
  const now = deps.now ?? Date.now;
  const deadline = now() + costConstants.crawlTotalBudgetMs;
  const queue = [start.toString()];
  const seen = new Set<string>();
  const pages: CrawlSnapshot["pages"] = [];

  while (queue.length && pages.length < costConstants.crawlMaxPages && now() < deadline) {
    const next = queue.shift()!;
    const key = next.replace(/\/$/, "");
    if (seen.has(key)) continue;
    seen.add(key);
    try {
      const response = await safeFetch(next, {
        timeoutMs: costConstants.crawlPerPageTimeoutMs,
        lookupFn: deps.lookupFn,
        fetchImpl: deps.fetchImpl,
      });
      if (!response.ok) continue;
      const finalUrl = response.url || next;
      const html = await readCapped(response, costConstants.htmlByteCap);
      if (!html) continue;
      pages.push({ url: finalUrl, html, bytes: html.length });
      for (const link of linksFrom(html, finalUrl)) {
        if (!seen.has(link.replace(/\/$/, ""))) queue.push(link);
      }
    } catch {
      /* skip pages that fail the public-URL check or the network */
    }
  }

  if (!pages.length) {
    throw new Error("We couldn't read that website. Check the URL and try again.");
  }

  const origin = new URL(pages[0]!.url).origin;
  const sitemapPageCount = await countSitemap(origin, deps);
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
