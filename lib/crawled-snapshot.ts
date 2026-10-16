import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { analyzeSnapshot, type ComplexityReport, type CrawlSnapshot } from "./complexity";
import type { Order } from "./orders";

/**
 * Score pages written by scripts/crawl.ts (`pages/*.json` with `url` and `html`)
 * before a worker packages or emails anything.
 */
export async function scoreCrawledSnapshot(
  dir: string,
  order: Pick<Order, "siteUrl" | "tier" | "amountCents">,
): Promise<ComplexityReport | null> {
  let names: string[];
  try {
    names = (await readdir(path.join(dir, "pages"))).filter((name) => name.endsWith(".json"));
  } catch {
    return null;
  }
  const pages: CrawlSnapshot["pages"] = [];
  for (const name of names) {
    let parsed: { url?: unknown; html?: unknown };
    try {
      parsed = JSON.parse(await readFile(path.join(dir, "pages", name), "utf8")) as { url?: unknown; html?: unknown };
    } catch {
      continue;
    }
    if (typeof parsed.url !== "string" || typeof parsed.html !== "string" || !parsed.url || !parsed.html) continue;
    pages.push({ url: parsed.url, html: parsed.html, bytes: Buffer.byteLength(parsed.html) });
  }
  if (!pages.length) return null;
  const requested = order.siteUrl || pages[0].url;
  return analyzeSnapshot(
    {
      requestedUrl: requested,
      finalUrl: pages[0].url,
      pages,
      sitemapPageCount: pages.length,
      scriptSamples: [],
      assetSamples: [],
    },
    { tier: order.tier, amountUsd: order.amountCents / 100 },
  );
}
