/**
 * Font files named in CSS that the browser response never saved.
 * Webflow/Flowbase inject @font-face after load; Playwright sometimes
 * cannot read that response body, so the url() stays on the CDN.
 * The crawl calls this before it writes fonts.css and assets.json.
 */

import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { safeFetch, type LookupFn } from "./ssrf";

const FONT_FILE = /\.(?:woff2|woff|ttf|otf|eot)(?:$|[?#])/i;

const FONT_TYPES: Record<string, string> = {
  "font/woff2": ".woff2",
  "font/woff": ".woff",
  "font/ttf": ".ttf",
  "font/otf": ".otf",
  "application/font-woff2": ".woff2",
  "application/font-woff": ".woff",
  "application/x-font-woff": ".woff",
  "application/x-font-woff2": ".woff2",
  "application/x-font-ttf": ".ttf",
  "application/vnd.ms-fontobject": ".eot",
};

export const MAX_EXTRA_FONTS = 64;
const MAX_FONT_BYTES = 1_500_000;

export function collectFontFileUrls(sources: Array<{ base: string; css: string }>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const { base, css } of sources) {
    for (const match of css.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi)) {
      const raw = (match[2] ?? "").replace(/&amp;/g, "&").trim();
      if (!raw || raw.startsWith("data:") || raw.startsWith("blob:")) continue;
      const pathPart = raw.split("#")[0] ?? raw;
      if (!FONT_FILE.test(pathPart)) continue;
      let abs: string;
      try {
        abs = new URL(raw, base).href;
      } catch {
        continue;
      }
      if (!abs.startsWith("http://") && !abs.startsWith("https://")) continue;
      if (seen.has(abs)) continue;
      seen.add(abs);
      out.push(abs);
    }
  }
  return out;
}

export type SavedFont = {
  url: string;
  finalUrl: string;
  file: string;
  bytes: number;
  type: string;
};

function extensionFor(contentType: string, finalUrl: string): string | null {
  const ct = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
  if (ct.startsWith("text/") || ct.includes("html") || ct.includes("json") || ct.startsWith("image/")) return null;
  if (FONT_TYPES[ct]) return FONT_TYPES[ct];
  let pathExt = "";
  try {
    pathExt = path.extname(new URL(finalUrl).pathname).toLowerCase();
  } catch {
    pathExt = "";
  }
  if (![".woff2", ".woff", ".ttf", ".otf", ".eot"].includes(pathExt)) return null;
  if (!ct || ct === "application/octet-stream" || ct === "binary/octet-stream" || ct.startsWith("font/") || ct.includes("font")) {
    return pathExt;
  }
  return null;
}

export async function saveMissingFontFiles(opts: {
  urls: string[];
  destDir: string;
  fetchImpl?: typeof fetch;
  lookupFn?: LookupFn;
  maxFiles?: number;
}): Promise<SavedFont[]> {
  const saved: SavedFont[] = [];
  const cap = opts.maxFiles ?? MAX_EXTRA_FONTS;
  await mkdir(opts.destDir, { recursive: true });
  for (const url of opts.urls) {
    if (saved.length >= cap) break;
    try {
      const response = await safeFetch(url, {
        timeoutMs: 20_000,
        fetchImpl: opts.fetchImpl,
        lookupFn: opts.lookupFn,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 EjectCrawler/0.1",
          Accept: "font/woff2,font/woff,*/*;q=0.8",
        },
      });
      if (!response.ok) continue;
      const finalUrl = response.url || url;
      const type = response.headers.get("content-type") ?? "";
      const ext = extensionFor(type, finalUrl);
      if (!ext) continue;
      const declared = Number(response.headers.get("content-length") ?? 0);
      if (declared > MAX_FONT_BYTES) continue;
      const body = Buffer.from(await response.arrayBuffer());
      if (body.length === 0 || body.length > MAX_FONT_BYTES) continue;
      const file = createHash("sha1").update(url).digest("hex").slice(0, 14) + ext;
      await writeFile(path.join(opts.destDir, file), body);
      saved.push({ url, finalUrl, file, bytes: body.length, type: type.split(";")[0]?.trim() || "font/woff2" });
    } catch {
      /* private host, timeout, or a CDN that refused the file */
    }
  }
  return saved;
}
