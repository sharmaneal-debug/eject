import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { analyzeSnapshot, type ComplexityReport, type CrawlSnapshot } from "./complexity";
import type { Order } from "./orders";

/** Pages we tried, pages we saved, and links still waiting. Failed loads stay in the tried set. */
export function discoveredPageCount(groups: Array<Iterable<string>>): number {
  const found = new Set<string>();
  for (const group of groups) {
    for (const url of group) if (url) found.add(url);
  }
  return found.size;
}

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
  const discovery = await readJson(path.join(dir, "discovery.json"));
  const scripts = await readJson(path.join(dir, "scripts.json"));
  const assets = await readJson(path.join(dir, "assets.json"));
  const discovered = numberField(discovery, "discoveredPageCount");
  const requested = order.siteUrl || pages[0].url;
  return analyzeSnapshot(
    {
      requestedUrl: requested,
      finalUrl: pages[0].url,
      pages,
      sitemapPageCount: Math.max(pages.length, discovered ?? pages.length),
      scriptSamples: samples(scripts),
      assetSamples: samples(assets),
    },
    { tier: order.tier, amountUsd: order.amountCents / 100 },
  );
}

async function readJson(file: string): Promise<unknown> {
  try {
    return JSON.parse(await readFile(file, "utf8")) as unknown;
  } catch {
    return null;
  }
}

function numberField(value: unknown, key: string): number | null {
  if (!value || typeof value !== "object") return null;
  const raw = (value as Record<string, unknown>)[key];
  return typeof raw === "number" && Number.isFinite(raw) ? raw : null;
}

function samples(value: unknown): Array<{ url: string; bytes: number }> {
  if (!value || typeof value !== "object") return [];
  const items = (value as { items?: unknown }).items;
  if (!Array.isArray(items)) return [];
  const out: Array<{ url: string; bytes: number }> = [];
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const url = (item as { url?: unknown }).url;
    const bytes = (item as { bytes?: unknown }).bytes;
    if (typeof url !== "string" || !url || typeof bytes !== "number" || bytes < 0) continue;
    out.push({ url, bytes });
  }
  return out;
}
