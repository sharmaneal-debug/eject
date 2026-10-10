/**
 * Score a public site, write a static handoff from the crawled HTML, and
 * screenshot the original and the handoff. No model key.
 *
 *   pnpm exec tsx scripts/pipeline-rebuild.ts <url> <slug>
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { crawlSite } from "../lib/http-crawl";
import { analyzeSnapshot } from "../lib/complexity";

const url = process.argv[2];
const slug = process.argv[3];
if (!url || !slug) {
  console.error("usage: tsx scripts/pipeline-rebuild.ts <url> <slug>");
  process.exit(2);
}

function textOf(html: string): { title: string; bits: string[] } {
  const title = decodeEntities((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? slug).replace(/\s+/g, " ").trim());
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, "\n");
  const bits = stripped
    .split("\n")
    .map((line) => decodeEntities(line.replace(/\s+/g, " ").trim()))
    .filter((line) => line.length > 2 && line.length < 240);
  const unique: string[] = [];
  for (const bit of bits) {
    if (unique.includes(bit)) continue;
    unique.push(bit);
    if (unique.length >= 40) break;
  }
  return { title, bits: unique };
}

function imagesOf(html: string): string[] {
  const found = new Set<string>();
  for (const match of html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) {
    const src = match[1];
    if (src && /^https?:\/\//i.test(src)) found.add(src);
    if (found.size >= 6) break;
  }
  return [...found];
}

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

async function main() {
  const root = path.join(process.cwd(), "out", "pipeline", slug);
  const shots = path.join(process.cwd(), "docs", "pipeline-shots", slug);
  await mkdir(root, { recursive: true });
  await mkdir(shots, { recursive: true });

  const t0 = Date.now();
  const snapshot = await crawlSite(url);
  const crawlMs = Date.now() - t0;
  const t1 = Date.now();
  const report = analyzeSnapshot(snapshot, { tier: "automated", amountUsd: 99 });
  const scoreMs = Date.now() - t1;

  const t2 = Date.now();
  const pages = snapshot.pages.map((page) => ({ ...textOf(page.html), images: imagesOf(page.html), url: page.url }));
  const blocks = pages
    .map((page) => {
      const imgs = page.images.map((src) => `<img src="${escapeHtml(src)}" alt="" />`).join("");
      const copy = page.bits.map((bit) => `<p>${escapeHtml(bit)}</p>`).join("");
      return `<section><h2>${escapeHtml(page.title)}</h2><p class="src">${escapeHtml(page.url)}</p>${imgs}${copy}</section>`;
    })
    .join("\n");
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(pages[0]?.title || slug)}</title>
<style>
  body { margin: 0; font: 16px/1.5 Georgia, serif; color: #111; background: #fafafa; }
  main { max-width: 720px; margin: 0 auto; padding: 32px 20px 64px; }
  h1 { font-size: 2rem; line-height: 1.2; }
  img { max-width: 100%; height: auto; display: block; margin: 12px 0; }
  .src { color: #666; font-size: 0.8rem; }
  section { border-top: 1px solid #ddd; margin-top: 24px; padding-top: 16px; }
</style>
</head>
<body>
<main>
  <p>Handoff from a public crawl. This is the text and image addresses we could read. It is not a pixel copy.</p>
  <h1>${escapeHtml(pages[0]?.title || slug)}</h1>
  ${blocks}
</main>
</body>
</html>`;
  await writeFile(path.join(root, "index.html"), html);
  await writeFile(
    path.join(root, "app-page.tsx"),
    `export default function Page() {\n  return (\n    <main>\n      <h1>${JSON.stringify(pages[0]?.title || slug)}</h1>\n      <p>Static handoff. See index.html for the readable text.</p>\n    </main>\n  );\n}\n`,
  );
  const rebuildMs = Date.now() - t2;

  const t3 = Date.now();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addInitScript("globalThis.__name = (target) => target;");
  const page = await context.newPage();
  for (const [name, width] of [["desktop", 1280], ["mobile", 390]] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 }).catch(() => undefined);
    await page.screenshot({ path: path.join(shots, `original-${name}.png`), fullPage: false });
    await page.goto(`file://${path.join(root, "index.html")}`, { waitUntil: "domcontentloaded", timeout: 10000 }).catch(() => undefined);
    await page.screenshot({ path: path.join(shots, `rebuild-${name}.png`), fullPage: false });
  }
  await browser.close();
  const shotMs = Date.now() - t3;

  const summary = {
    slug,
    url,
    crawlMs,
    scoreMs,
    rebuildMs,
    shotMs,
    totalMs: crawlMs + scoreMs + rebuildMs + shotMs,
    eligibility: report.eligibility,
    referral: report.referral,
    reasons: report.reasons,
    platform: report.platformLabel,
    pageCount: report.pageCount,
    crawledPageCount: report.crawledPageCount,
    assetCount: report.assetCount,
    assetBytes: report.assetBytes,
    assetsPullable: report.assetsPullable,
    formCount: report.formCount,
    rebuildEase: report.rebuildEase,
    animationSignals: report.animationSignals,
    hours: report.migration.totalHours,
    textLines: pages.reduce((n, page) => n + page.bits.length, 0),
    imageUrls: pages.reduce((n, page) => n + page.images.length, 0),
  };
  await writeFile(path.join(shots, "summary.json"), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((err) => {
  console.error(err instanceof Error ? err.stack : err);
  process.exit(1);
});