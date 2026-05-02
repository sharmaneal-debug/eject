#!/usr/bin/env tsx
/**
 * Eject — site crawler
 * --------------------
 * Walks every internal link of a live URL with Playwright, captures rendered
 * DOM, CSS, fonts, images, meta tags, and design tokens. Output is a snapshot
 * directory consumed by `scripts/rebuild.ts`.
 *
 * Usage:
 *   pnpm crawl https://example.com
 *   pnpm crawl https://example.com --max-pages=20 --out=data/snapshots/example
 */

import { chromium, type Browser, type Page } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

type CrawlOptions = {
  url: string;
  maxPages: number;
  out: string;
  timeoutMs: number;
};

type CapturedPage = {
  url: string;
  path: string;
  title: string;
  description: string;
  ogImage?: string;
  html: string;
  capturedAt: string;
  links: string[];
  images: string[];
  fonts: string[];
};

type DesignTokens = {
  colors: string[];
  fontFamilies: string[];
  fontSizes: string[];
  fontWeights: string[];
  spacings: string[];
  radii: string[];
};

function parseArgs(argv: string[]): CrawlOptions {
  const positional = argv.filter((a) => !a.startsWith("--"));
  const flags = Object.fromEntries(
    argv
      .filter((a) => a.startsWith("--"))
      .map((a) => {
        const [k, v = "true"] = a.replace(/^--/, "").split("=");
        return [k, v];
      }),
  );
  const url = positional[0];
  if (!url) {
    console.error("usage: pnpm crawl <url> [--max-pages=20] [--out=path]");
    process.exit(2);
  }
  const slug = new URL(url).hostname.replace(/[^a-z0-9]+/gi, "-");
  return {
    url,
    maxPages: Number(flags["max-pages"] ?? 20),
    out: String(flags.out ?? `data/snapshots/${slug}`),
    timeoutMs: Number(flags.timeout ?? 30_000),
  };
}

function normalizeHref(base: string, href: string): string | null {
  try {
    const u = new URL(href, base);
    if (u.origin !== new URL(base).origin) return null;
    u.hash = "";
    u.search = "";
    return u.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

async function capturePage(page: Page, url: string, timeoutMs: number): Promise<CapturedPage> {
  await page.goto(url, { waitUntil: "networkidle", timeout: timeoutMs });
  // Allow lazy content to settle.
  await page.waitForTimeout(800);

  const result = await page.evaluate(() => {
    const meta = (name: string) =>
      (document.querySelector(`meta[name="${name}"], meta[property="${name}"]`) as HTMLMetaElement)?.content ?? "";

    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]"))
      .map((a) => a.href)
      .filter(Boolean);

    const images = Array.from(document.querySelectorAll<HTMLImageElement>("img[src]"))
      .map((img) => img.src)
      .filter(Boolean);

    // Font families discovered in computed styles on visible elements.
    const fontSet = new Set<string>();
    document.querySelectorAll<HTMLElement>("h1, h2, h3, p, body, button, a, span").forEach((el) => {
      const ff = getComputedStyle(el).fontFamily;
      if (ff) fontSet.add(ff);
    });

    return {
      title: document.title || "",
      description: meta("description") || meta("og:description") || "",
      ogImage: meta("og:image") || undefined,
      html: document.documentElement.outerHTML,
      links,
      images,
      fonts: Array.from(fontSet),
    };
  });

  const u = new URL(url);
  return {
    url,
    path: u.pathname || "/",
    title: result.title,
    description: result.description,
    ogImage: result.ogImage,
    html: result.html,
    capturedAt: new Date().toISOString(),
    links: Array.from(new Set(result.links)),
    images: Array.from(new Set(result.images)),
    fonts: Array.from(new Set(result.fonts)),
  };
}

async function extractDesignTokens(page: Page): Promise<DesignTokens> {
  return page.evaluate(() => {
    const colors = new Set<string>();
    const fonts = new Set<string>();
    const sizes = new Set<string>();
    const weights = new Set<string>();
    const spacings = new Set<string>();
    const radii = new Set<string>();

    const sample = document.querySelectorAll<HTMLElement>(
      "h1, h2, h3, h4, p, a, button, span, div, section, header, footer, li",
    );

    sample.forEach((el) => {
      const cs = getComputedStyle(el);
      [cs.color, cs.backgroundColor, cs.borderColor].forEach((c) => {
        if (c && c !== "rgba(0, 0, 0, 0)" && c !== "transparent") colors.add(c);
      });
      if (cs.fontFamily) fonts.add(cs.fontFamily);
      if (cs.fontSize) sizes.add(cs.fontSize);
      if (cs.fontWeight) weights.add(cs.fontWeight);
      [cs.padding, cs.margin, cs.gap].forEach((s) => {
        if (s && s !== "0px") spacings.add(s);
      });
      if (cs.borderRadius && cs.borderRadius !== "0px") radii.add(cs.borderRadius);
    });

    const top = (set: Set<string>, n: number) => Array.from(set).slice(0, n);
    return {
      colors: top(colors, 24),
      fontFamilies: top(fonts, 6),
      fontSizes: top(sizes, 16),
      fontWeights: top(weights, 8),
      spacings: top(spacings, 16),
      radii: top(radii, 8),
    };
  });
}

async function detectPlatform(html: string): Promise<string> {
  if (/<meta[^>]+content="Webflow"/i.test(html) || /webflow\.io/.test(html)) return "webflow";
  if (/framerusercontent\.com|framer\.app|<meta[^>]+content="Framer"/i.test(html)) return "framer";
  if (/static\.parastorage\.com|wix\.com Website Builder/i.test(html)) return "wix";
  if (/squarespace\.com|sqsp\.net/i.test(html)) return "squarespace";
  return "unknown";
}

async function crawl(opts: CrawlOptions) {
  console.log(`→ crawling ${opts.url}`);
  console.log(`  max pages: ${opts.maxPages}`);
  console.log(`  output:    ${opts.out}`);

  await mkdir(path.join(opts.out, "pages"), { recursive: true });

  const browser: Browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 EjectCrawler/0.1",
  });
  const page = await context.newPage();

  const visited = new Set<string>();
  const queue: string[] = [opts.url];
  const captured: CapturedPage[] = [];
  let designTokens: DesignTokens | null = null;
  let platform = "unknown";

  while (queue.length > 0 && captured.length < opts.maxPages) {
    const current = queue.shift()!;
    const norm = normalizeHref(opts.url, current);
    if (!norm || visited.has(norm)) continue;
    visited.add(norm);

    try {
      console.log(`  · ${captured.length + 1}/${opts.maxPages}  ${norm}`);
      const cap = await capturePage(page, norm, opts.timeoutMs);
      captured.push(cap);

      if (!designTokens) designTokens = await extractDesignTokens(page);
      if (platform === "unknown") platform = await detectPlatform(cap.html);

      // enqueue next links
      for (const link of cap.links) {
        const n = normalizeHref(opts.url, link);
        if (n && !visited.has(n)) queue.push(n);
      }

      const filename = (cap.path === "/" ? "_root" : cap.path.replace(/^\//, "").replace(/\//g, "__")) + ".json";
      await writeFile(path.join(opts.out, "pages", filename), JSON.stringify(cap, null, 2), "utf8");
    } catch (err) {
      console.warn(`    ! failed ${norm}: ${(err as Error).message}`);
    }
  }

  await writeFile(
    path.join(opts.out, "manifest.json"),
    JSON.stringify(
      {
        sourceUrl: opts.url,
        platform,
        capturedAt: new Date().toISOString(),
        pageCount: captured.length,
        pages: captured.map((p) => ({
          url: p.url,
          path: p.path,
          title: p.title,
          description: p.description,
          ogImage: p.ogImage,
          imageCount: p.images.length,
        })),
      },
      null,
      2,
    ),
    "utf8",
  );

  if (designTokens) {
    await writeFile(path.join(opts.out, "design-tokens.json"), JSON.stringify(designTokens, null, 2), "utf8");
  }

  await browser.close();

  console.log(`\n✓ crawled ${captured.length} pages`);
  console.log(`  platform: ${platform}`);
  console.log(`  snapshot: ${opts.out}`);
  console.log(`\nNext: pnpm rebuild ${opts.out}`);
}

const opts = parseArgs(process.argv.slice(2));
if (!existsSync(path.dirname(opts.out))) {
  await mkdir(path.dirname(opts.out), { recursive: true });
}
await crawl(opts);
