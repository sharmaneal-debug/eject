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
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";
import { assertCrawlDocument } from "../lib/crawl-guard";
import { loadRobots, type RobotsRules } from "../lib/robots";
import { SsrfError } from "../lib/ssrf";

type CrawlOptions = {
  url: string;
  maxPages: number;
  out: string;
  timeoutMs: number;
  /** Pause between page loads so a customer's host (or a demo site) is never hammered. */
  delayMs: number;
  /** Explicit page list (paths). When set, only these pages are captured and links are not followed. */
  pages: string[];
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
  /** Compact, style-annotated body DOM (no scripts/styles/svg paths). See cleanDomScript. */
  clean?: string;
  /** Slice screenshots saved under <out>/shots (relative names). */
  shots?: { desktop: string[]; mobile: string[] };
  docHeight?: number;
  /** Filename under <out>/css for adopted stylesheets (no <link> in the DOM). */
  adoptedCss?: string;
  /** document.baseURI after load. Relative URLs in the HTML resolve against this. */
  baseUrl?: string;
};

type AssetRecord = { url: string; file: string; bytes: number; type: string; kind: "image" | "font" | "media" | "stylesheet" };

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
    delayMs: Number(flags["delay-ms"] ?? 1000),
    pages: flags.pages ? String(flags.pages).split(",").map((p) => p.trim()).filter(Boolean) : [],
  };
}

function normalizeHref(base: string, href: string): string | null {
  try {
    const u = new URL(href, base);
    if (u.origin !== new URL(base).origin) return null;
    // When the start URL lives under a sub-path (e.g. /uploads/demos/x/), stay inside it
    // instead of walking the rest of the host.
    const basePath = new URL(base).pathname;
    const scope = (basePath.endsWith("/") ? basePath : basePath.replace(/\/[^/]*$/, "")).replace(/\/$/, "");
    if (scope && !(u.pathname === scope || u.pathname.startsWith(scope + "/"))) return null;
    u.hash = "";
    u.search = "";
    return u.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

// Runs in the page. Produces a compact DOM where every visible element carries the computed
// styles that matter for layout, so the model can reproduce the design without the platform's CSS.
const CLEAN_DOM_SCRIPT = `(() => {
  const SKIP = new Set(["SCRIPT","STYLE","NOSCRIPT","LINK","META","TEMPLATE","IFRAME","CANVAS","OBJECT","EMBED"]);
  const px = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? Math.round(n) : 0; };
  const rgb = (c) => (!c || c === "rgba(0, 0, 0, 0)" || c === "transparent") ? "" : c.replace(/\\s+/g, "").replace("rgba(","rgba(").replace(/^rgb\\(0,0,0\\)$/, "#000");
  const abs = (u) => { try { return new URL(u, location.href).toString(); } catch { return ""; } };
  let budget = 120000;
  const INHERIT = ["color","fontFamily","fontSize","fontWeight","lineHeight","letterSpacing","textAlign","textTransform"];
  function styleOf(el, cs, pcs) {
    const o = [];
    for (const k of INHERIT) {
      const v = cs[k];
      if (!pcs || pcs[k] !== v) {
        let out = v;
        if (k === "fontFamily") out = v.split(",")[0].replace(/["']/g, "").trim();
        if (k === "color") out = rgb(v);
        if (k === "letterSpacing" && v === "normal") continue;
        if (k === "lineHeight" && v === "normal") continue;
        if (k === "textTransform" && v === "none") continue;
        if (k === "textAlign" && (v === "start" || v === "left")) continue;
        if (out) o.push(k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()) + ":" + out);
      }
    }
    const bg = rgb(cs.backgroundColor); if (bg) o.push("bg:" + bg);
    if (cs.backgroundImage && cs.backgroundImage !== "none") {
      const m = cs.backgroundImage.match(/url\\(["']?([^"')]+)["']?\\)/);
      if (m) o.push("bg-img:" + abs(m[1])); else o.push("bg-img:" + cs.backgroundImage.slice(0, 80));
    }
    if (cs.display !== "block" && cs.display !== "inline") o.push("display:" + cs.display);
    if (cs.display.includes("flex")) {
      o.push("dir:" + cs.flexDirection);
      if (cs.justifyContent !== "normal" && cs.justifyContent !== "flex-start") o.push("justify:" + cs.justifyContent);
      if (cs.alignItems !== "normal" && cs.alignItems !== "stretch") o.push("align:" + cs.alignItems);
      if (cs.flexWrap !== "nowrap") o.push("wrap");
    }
    if (cs.display.includes("grid")) o.push("cols:" + cs.gridTemplateColumns.split(" ").length);
    if (cs.gap && cs.gap !== "normal" && cs.gap !== "0px") o.push("gap:" + cs.gap.replace(/ /g, "/"));
    const pad = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].map(px);
    if (pad.some(Boolean)) o.push("pad:" + pad.join("/"));
    const r = el.getBoundingClientRect();
    if (el.tagName === "IMG" || (cs.display !== "inline" && r.width > 0)) o.push("w:" + Math.round(r.width) + (el.tagName === "IMG" || r.height < 800 ? ",h:" + Math.round(r.height) : ""));
    if (cs.position === "absolute" || cs.position === "fixed" || cs.position === "sticky") o.push("pos:" + cs.position);
    if (cs.borderTopWidth !== "0px" && cs.borderTopStyle !== "none") o.push("border:" + cs.borderTopWidth + " " + rgb(cs.borderTopColor));
    if (cs.borderRadius && cs.borderRadius !== "0px") o.push("radius:" + cs.borderRadius.split(" ")[0]);
    if (cs.boxShadow && cs.boxShadow !== "none") o.push("shadow");
    if (cs.opacity !== "1") o.push("opacity:" + cs.opacity);
    if (el.tagName === "IMG" || el.tagName === "VIDEO") if (cs.objectFit && cs.objectFit !== "fill") o.push("fit:" + cs.objectFit);
    return o.join(";");
  }
  function walk(el, pcs) {
    if (budget <= 0) return "";
    if (el.nodeType === 3) { const t = el.textContent.replace(/\\s+/g, " "); return t.trim() ? t.replace(/</g, "&lt;") : (t === " " ? " " : ""); }
    if (el.nodeType !== 1) return "";
    const tag = el.tagName;
    if (SKIP.has(tag)) return "";
    if (tag === "svg" || tag === "SVG") {
      const r = el.getBoundingClientRect(); if (r.width < 1) return "";
      return "<svg w=" + Math.round(r.width) + " h=" + Math.round(r.height) + " color=" + rgb(getComputedStyle(el).color) + (el.getAttribute("aria-label") ? " label=" + JSON.stringify(el.getAttribute("aria-label")) : "") + "/>";
    }
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") return "";
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0 && tag !== "A" && !el.children.length) return "";
    let kids = "";
    for (const c of el.childNodes) kids += walk(c, cs);
    const st = styleOf(el, cs, pcs);
    const t = tag.toLowerCase();
    let attrs = "";
    if (tag === "A") attrs += " href=" + JSON.stringify(el.getAttribute("href") || "");
    if (tag === "IMG") { attrs += " src=" + JSON.stringify(abs(el.currentSrc || el.src)) + " alt=" + JSON.stringify(el.alt || ""); }
    if (tag === "VIDEO") attrs += " src=" + JSON.stringify(abs(el.currentSrc || el.src || "")) + (el.poster ? " poster=" + JSON.stringify(abs(el.poster)) : "");
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || tag === "BUTTON" || tag === "FORM" || tag === "LABEL") {
      for (const a of ["type","name","placeholder","for","action","method","required"]) if (el.hasAttribute(a)) attrs += " " + a + "=" + JSON.stringify(el.getAttribute(a));
    }
    if (el.id && /^[a-z][\\w-]{0,30}$/i.test(el.id) && !/^(framer|__|w-)/.test(el.id)) attrs += " id=" + JSON.stringify(el.id);
    if (!kids && !["IMG","VIDEO","INPUT","HR","BR","TEXTAREA","SELECT"].includes(tag) && !st.includes("bg")) return "";
    // collapse pure wrapper divs with no style contribution of their own
    const bare = (t === "div" || t === "span") && !attrs && !/bg|border|radius|shadow|pad|dir:|display|cols|gap/.test(st);
    if (bare && /^[^<]*$/.test(kids) === false && !st.includes("pos:")) return kids;
    const out = "<" + t + attrs + (st ? " s=" + JSON.stringify(st) : "") + ">" + kids + "</" + t + ">";
    budget -= out.length - kids.length;
    return out;
  }
  return walk(document.body, null);
})()`;

async function settle(page: Page, timeoutMs: number, url: string) {
  // "networkidle" never fires on Wix and some Framer pages (live pings, analytics), so it is
  // only a bounded bonus after "load".
  await page.goto(url, { waitUntil: "load", timeout: timeoutMs });
  await page.waitForLoadState("networkidle", { timeout: 6_000 }).catch(() => undefined);
  await page.waitForTimeout(800);
  // Scroll to trigger lazy-loaded images and scroll-reveal sections, then return to top.
  await page.evaluate(async () => {
    let y = 0;
    const step = Math.max(300, innerHeight * 0.7);
    while (y < Math.min(document.documentElement.scrollHeight, 25_000)) {
      scrollTo(0, y);
      y += step;
      await new Promise((r) => setTimeout(r, 160));
    }
    scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 400));
  });
  await page.waitForLoadState("networkidle", { timeout: 3_000 }).catch(() => undefined);
}

async function capturePage(page: Page, url: string, timeoutMs: number, outDir: string): Promise<CapturedPage> {
  await settle(page, timeoutMs, url);

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
      docHeight: document.documentElement.scrollHeight,
    };
  });
  const clean = (await page.evaluate(CLEAN_DOM_SCRIPT).catch(() => "")) as string;

  // Slice screenshots (desktop first, then a mobile reflow) for the model's eyes.
  const u = new URL(url);
  const stem = (u.pathname === "/" ? "_root" : u.pathname.replace(/^\//, "").replace(/[^a-z0-9.-]+/gi, "__")) || "_root";
  await mkdir(path.join(outDir, "shots"), { recursive: true });
  const shots = { desktop: [] as string[], mobile: [] as string[] };
  const sliceH = 1400;
  for (let i = 0; i < Math.min(3, Math.ceil(result.docHeight / sliceH)); i++) {
    const name = `${stem}-d${i}.jpg`;
    await page
      .screenshot({ path: path.join(outDir, "shots", name), type: "jpeg", quality: 72, fullPage: true, clip: { x: 0, y: i * sliceH, width: 1440, height: Math.min(sliceH, result.docHeight - i * sliceH) } })
      .then(() => shots.desktop.push(name))
      .catch(() => undefined);
  }
  const vp = page.viewportSize();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  const mh = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let i = 0; i < Math.min(2, Math.ceil(mh / sliceH)); i++) {
    const name = `${stem}-m${i}.jpg`;
    await page
      .screenshot({ path: path.join(outDir, "shots", name), type: "jpeg", quality: 72, fullPage: true, clip: { x: 0, y: i * sliceH, width: 390, height: Math.min(sliceH, mh - i * sliceH) } })
      .then(() => shots.mobile.push(name))
      .catch(() => undefined);
  }
  if (vp) await page.setViewportSize(vp);

  // Styles the platform attached with adoptedStyleSheets never show up as <link> or <style>.
  let adoptedCss: string | undefined;
  const adopted = await page
    .evaluate(() => {
      const sheets = (document as unknown as { adoptedStyleSheets?: CSSStyleSheet[] }).adoptedStyleSheets ?? [];
      const parts: string[] = [];
      for (const sheet of sheets) {
        try {
          parts.push(Array.from(sheet.cssRules).map((rule) => rule.cssText).join("\n"));
        } catch {
          /* unreadable sheet */
        }
      }
      return parts.join("\n\n");
    })
    .catch(() => "");
  if (adopted.trim()) {
    await mkdir(path.join(outDir, "css"), { recursive: true });
    const file = `${stem}-adopted.css`;
    await writeFile(path.join(outDir, "css", file), adopted, "utf8");
    adoptedCss = file;
  }

  const baseUrl = await page.evaluate(() => document.baseURI).catch(() => url);

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
    clean,
    shots,
    docHeight: result.docHeight,
    adoptedCss,
    baseUrl,
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

  let start: URL;
  let robots: RobotsRules;
  try {
    start = await assertCrawlDocument(opts.url, { allows: () => true });
    robots = await loadRobots(start.origin, {}, "EjectCrawler");
    await assertCrawlDocument(start.toString(), robots);
  } catch (err) {
    if (err instanceof SsrfError) {
      console.error("error: that URL can't be scanned.");
    } else {
      console.error(`error: ${err instanceof Error ? err.message : "crawl refused"}`);
    }
    process.exit(1);
  }

  await mkdir(path.join(opts.out, "pages"), { recursive: true });

  const browser: Browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 EjectCrawler/0.1",
  });
  // esbuild keepNames injects __name into page.evaluate callbacks. A string
  // (not a function) so this init script is not itself rewritten.
  await context.addInitScript("globalThis.__name = (target) => target;");
  const page = await context.newPage();

  // Pull every image / font / stylesheet the browser actually loads, so the rebuilt site can
  // serve its own copies after the customer cancels the old platform.
  const assets = new Map<string, AssetRecord>();
  const stylesheets = new Map<string, string>();
  const styleFiles = new Map<string, string>();
  const pendingAssets: Promise<void>[] = [];
  await mkdir(path.join(opts.out, "assets"), { recursive: true });
  await mkdir(path.join(opts.out, "styles"), { recursive: true });
  // Subresources (images, fonts, stylesheets) are not re-checked here. The document URL
  // was already limited to a public host, and DNS-checking every CDN response would drop
  // the assets Wix, Squarespace, and Framer pages actually render.
  page.on("response", (res) => {
    const task = (async () => {
      try {
        const req = res.request();
        const type = req.resourceType();
        const ct = (res.headers()["content-type"] ?? "").split(";")[0]!.trim();
        const url = res.url();
        const requestUrl = req.url();
        if (!res.ok() || url.startsWith("data:")) return;
        const kind =
          type === "image" ? "image" : type === "font" ? "font" : type === "stylesheet" || ct === "text/css" ? "stylesheet" : type === "media" ? "media" : null;
        if (!kind || assets.has(url) || styleFiles.has(url)) return;
        if (kind === "media") return; // video/audio are not pulled automatically (size); reported as skipped by the scorer
        const body = await res.body();
        if (body.length > 6_000_000) return;
        if (kind === "stylesheet") {
          const css = body.toString("utf8");
          const file = createHash("sha1").update(url).digest("hex").slice(0, 14) + ".css";
          await writeFile(path.join(opts.out, "styles", file), body);
          stylesheets.set(url, css);
          styleFiles.set(url, file);
          if (requestUrl !== url) {
            stylesheets.set(requestUrl, css);
            styleFiles.set(requestUrl, file);
          }
          return;
        }
        const byType: Record<string, string> = { "image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp", "image/avif": ".avif", "image/gif": ".gif", "image/svg+xml": ".svg", "image/x-icon": ".ico", "font/woff2": ".woff2", "font/woff": ".woff", "font/ttf": ".ttf", "font/otf": ".otf", "application/font-woff2": ".woff2", "application/font-woff": ".woff", "application/vnd.ms-fontobject": ".eot" };
        // Prefer the real content type: Framer/Webflow serve AVIF/WebP bytes from ".png"/".jpg" URLs.
        const ext = byType[ct] ?? ((path.extname(new URL(url).pathname) || "").slice(0, 6) || ".bin");
        const file = createHash("sha1").update(url).digest("hex").slice(0, 14) + ext;
        await writeFile(path.join(opts.out, "assets", file), body);
        const record: AssetRecord = { url, file, bytes: body.length, type: ct, kind };
        assets.set(url, record);
        if (requestUrl !== url) assets.set(requestUrl, record);
      } catch {
        /* response body unavailable (redirect, aborted) */
      }
    })();
    pendingAssets.push(task);
  });

  const visited = new Set<string>();
  const queue: string[] = opts.pages.length
    ? opts.pages.map((p) => new URL(p, opts.url).toString())
    : [opts.url];
  const captured: CapturedPage[] = [];
  let designTokens: DesignTokens | null = null;
  let platform = "unknown";

  while (queue.length > 0 && captured.length < opts.maxPages) {
    const current = queue.shift()!;
    const norm = normalizeHref(opts.url, current);
    if (!norm || visited.has(norm)) continue;
    visited.add(norm);
    if (captured.length > 0 || visited.size > 1) await new Promise((r) => setTimeout(r, opts.delayMs));

    try {
      await assertCrawlDocument(norm, robots);
      console.log(`  · ${captured.length + 1}/${opts.maxPages}  ${norm}`);
      const cap = await capturePage(page, norm, opts.timeoutMs, opts.out);
      const landed = page.url();
      const landedUrl = new URL(landed);
      if (landedUrl.origin !== start.origin) {
        console.warn(`    ! skipped ${norm}: redirect left the site`);
        continue;
      }
      await assertCrawlDocument(landed, robots);
      captured.push(cap);

      if (!designTokens) designTokens = await extractDesignTokens(page);
      if (platform === "unknown") platform = await detectPlatform(cap.html);

      // enqueue next links (skipped when an explicit --pages list was given)
      for (const link of opts.pages.length ? [] : cap.links) {
        const n = normalizeHref(opts.url, link);
        if (n && !visited.has(n)) queue.push(n);
      }

      const filename = (cap.path === "/" ? "_root" : cap.path.replace(/^\//, "").replace(/\//g, "__")) + ".json";
      await writeFile(path.join(opts.out, "pages", filename), JSON.stringify(cap, null, 2), "utf8");
    } catch (err) {
      console.warn(`    ! failed ${norm}: ${(err as Error).message}`);
    }
  }

  await Promise.allSettled(pendingAssets);
  if (captured.length === 0) {
    await browser.close();
    console.error("error: crawled 0 pages (every page failed to load). Not writing a snapshot.");
    process.exit(3);
  }

  // Build fonts.css from @font-face rules found in inline <style> and fetched stylesheets,
  // pointing at the local copies of the font files.
  const fontFaces: string[] = [];
  const faceRe = /@font-face\s*\{[^}]*\}/gi;
  const sources: Array<{ base: string; css: string }> = [...stylesheets.entries()].map(([u, css]) => ({ base: u, css }));
  for (const c of captured) {
    for (const m of c.html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) sources.push({ base: c.url, css: m[1] ?? "" });
  }
  const seenFace = new Set<string>();
  for (const { base, css } of sources) {
    for (const m of css.matchAll(faceRe)) {
      let block = m[0];
      let usable = true;
      block = block.replace(/url\(\s*["']?([^"')]+)["']?\s*\)/gi, (whole, raw: string) => {
        if (raw.startsWith("data:")) return whole;
        let abs: string;
        try { abs = new URL(raw, base).toString(); } catch { return whole; }
        const rec = assets.get(abs);
        if (!rec) { usable = false; return whole; }
        return `url(/assets/${rec.file})`;
      });
      if (usable && !seenFace.has(block)) { seenFace.add(block); fontFaces.push(block); }
    }
  }
  await writeFile(path.join(opts.out, "fonts.css"), fontFaces.join("\n") + "\n", "utf8");
  const uniqueAssets = new Map<string, AssetRecord>();
  for (const rec of assets.values()) if (!uniqueAssets.has(rec.file)) uniqueAssets.set(rec.file, rec);
  const assetItems = [...assets.entries()].map(([url, rec]) => ({ url, file: rec.file, bytes: rec.bytes, type: rec.type, kind: rec.kind }));
  await writeFile(path.join(opts.out, "assets.json"), JSON.stringify({ count: uniqueAssets.size, bytes: [...uniqueAssets.values()].reduce((n, a) => n + a.bytes, 0), byKind: Object.fromEntries(["image", "font"].map((k) => [k, [...uniqueAssets.values()].filter((a) => a.kind === k).length])), fontFaceRules: fontFaces.length, items: assetItems }, null, 2), "utf8");
  const styleSeen = new Set<string>();
  const styleItems = [...styleFiles.entries()].filter(([, file]) => (styleSeen.has(file) ? false : (styleSeen.add(file), true))).map(([url, file]) => ({ url, file }));
  // Keep every URL key, including aliases, so the static move can match the href the page used.
  await writeFile(path.join(opts.out, "stylesheets.json"), JSON.stringify([...styleFiles.entries()].map(([url, file]) => ({ url, file })), null, 2), "utf8");
  console.log(`  stylesheets: ${styleItems.length}`);

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
  console.log(`  or:  pnpm static-move ${opts.out}`);
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!existsSync(path.dirname(opts.out))) {
    await mkdir(path.dirname(opts.out), { recursive: true });
  }
  await crawl(opts);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
