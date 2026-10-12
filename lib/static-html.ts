/**
 * Pure HTML transforms for the no-model static move.
 * The crawler snapshot already has the rendered DOM, CSS, and asset bytes.
 * These functions turn one captured page into a file the customer can host
 * and edit, without calling a model.
 */

export type AssetMap = Map<string, string>;

export type LinkContext = {
  pageUrl: string;
  pageRoute: string;
  origin: string;
  rootPrefix: string;
  routes: Set<string>;
};

export type FormNote = { pageRoute: string; action: string };

const JSON_SCRIPT = /type\s*=\s*["']application\/(?:ld\+json|json)["']/i;

/** Drop platform runtime scripts. Keep JSON-LD and application/json data blocks. */
export function stripRuntimeScripts(html: string): { html: string; removed: number } {
  let removed = 0;
  let out = "";
  let i = 0;
  const lower = html.toLowerCase();
  while (i < html.length) {
    const start = lower.indexOf("<script", i);
    if (start < 0) {
      out += html.slice(i);
      break;
    }
    out += html.slice(i, start);
    const openEnd = html.indexOf(">", start);
    if (openEnd < 0) {
      out += html.slice(start);
      break;
    }
    const open = html.slice(start, openEnd + 1);
    const close = lower.indexOf("</script>", openEnd);
    const end = close < 0 ? html.length : close + "</script>".length;
    if (JSON_SCRIPT.test(open)) out += html.slice(start, end);
    else removed += 1;
    i = end;
  }
  return { html: out, removed };
}

/** <noscript> becomes visible once every runtime script is gone, which duplicates the page. */
export function stripNoscript(html: string): string {
  return html.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, "");
}

export function stripDocumentHazards(html: string): string {
  return html
    .replace(/<base\b[^>]*>/gi, "")
    .replace(/<meta\b[^>]*http-equiv\s*=\s*["'](?:content-security-policy|refresh)["'][^>]*>/gi, "")
    .replace(/<link\b[^>]*rel\s*=\s*["'](?:modulepreload|preload)["'][^>]*>/gi, (tag) => {
      const rel = getAttr(tag, "rel")?.toLowerCase() ?? "";
      const as = getAttr(tag, "as")?.toLowerCase() ?? "";
      if (rel === "modulepreload") return "";
      if (rel === "preload" && (as === "script" || as === "worker")) return "";
      return tag;
    });
}

/**
 * Base URL for relative links. Extension-less paths captured without a trailing
 * slash still act as folders (Wix sites, HTML5 UP demos). A real document.baseURI
 * from the crawler should be preferred over this fallback.
 */
export function resolutionBase(pageUrl: string): string {
  try {
    const url = new URL(pageUrl);
    if (url.pathname.endsWith("/") || /\.[a-z0-9]+$/i.test(url.pathname.split("/").pop() ?? "")) return url.href;
    url.pathname = `${url.pathname}/`;
    return url.href;
  } catch {
    return pageUrl;
  }
}

export function normalizeLocalRoute(pathname: string, rootPrefix: string): string {
  let path = pathname.split("?")[0]?.split("#")[0] ?? "/";
  try {
    path = decodeURIComponent(path);
  } catch {
    /* keep the raw path */
  }
  if (!path.startsWith("/")) path = `/${path}`;
  const prefix = rootPrefix.replace(/\/$/, "");
  if (prefix && (path === prefix || path.startsWith(`${prefix}/`))) {
    path = path.slice(prefix.length) || "/";
  }
  path = path.replace(/\/index\.html?$/i, "/").replace(/\.html?$/i, "");
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  if (path === "") path = "/";
  return path;
}

/** Folder depth of a local route. "/" is 0, "/about" is 1, "/a/b" is 2. */
export function routeDepth(route: string): number {
  if (!route || route === "/") return 0;
  return route.replace(/^\//, "").split("/").filter(Boolean).length;
}

export function assetHref(file: string, pageRoute: string): string {
  const prefix = "../".repeat(routeDepth(pageRoute));
  return `${prefix}assets/${file}`;
}

export function relativePageHref(fromRoute: string, toRoute: string, hash = ""): string {
  if (toRoute === fromRoute) return hash || "./";
  const prefix = "../".repeat(routeDepth(fromRoute));
  if (toRoute === "/") return `${prefix || "./"}${hash}`;
  return `${prefix}${toRoute.replace(/^\//, "")}/${hash}`;
}

export function lookupAsset(assets: AssetMap, raw: string, base: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.startsWith("data:") || trimmed.startsWith("blob:") || trimmed.startsWith("#")) return null;
  let abs: URL;
  try {
    abs = new URL(trimmed, base);
  } catch {
    return null;
  }
  if (abs.protocol !== "http:" && abs.protocol !== "https:") return null;
  const noHash = abs.href.split("#")[0] ?? abs.href;
  return assets.get(abs.href) ?? assets.get(noHash) ?? null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Replace an absolute URL only when it is a whole token (attribute, srcset, or css url). */
export function replaceBoundedUrl(html: string, url: string, replacement: string): string {
  const variants = url.includes("&") ? [url, url.replace(/&/g, "&amp;")] : [url];
  let out = html;
  for (const variant of variants) {
    const re = new RegExp(`(?<=["'(])${escapeRegExp(variant)}(?=["')\\s,])`, "g");
    out = out.replace(re, () => replacement);
  }
  return out;
}

/** Rewrite url() and @import inside a stylesheet so files sitting in assets/ stay siblings. */
export function rewriteStylesheet(css: string, sheetUrl: string, assets: AssetMap): string {
  const fileFor = (raw: string) => lookupAsset(assets, raw, sheetUrl);
  const next = rewriteCssUrls(css, fileFor);
  return next.replace(/@import\s+(?:url\(\s*['"]?([^'")]+)['"]?\s*\)|['"]([^'"]+)['"])/gi, (whole, urlRaw: string | undefined, quoted: string | undefined) => {
    const file = fileFor((urlRaw || quoted || "").trim());
    if (!file) return whole;
    return `@import "${file}"`;
  });
}

export function rewriteCssUrls(css: string, resolve: (raw: string) => string | null): string {
  return css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (whole, _q, raw: string) => {
    const next = resolve(raw.trim());
    if (!next) return whole;
    return `url("${next}")`;
  });
}

export function getAttr(tag: string, name: string): string | null {
  const re = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s"'>]+))`, "i");
  const match = tag.match(re);
  if (!match) return null;
  const value = match[2] ?? match[3] ?? match[4] ?? "";
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

export function setAttr(tag: string, name: string, value: string): string {
  const encoded = value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  const re = new RegExp(`\\b${name}\\s*=\\s*("[^"]*"|'[^']*'|[^\\s"'>]+)`, "i");
  if (re.test(tag)) return tag.replace(re, `${name}="${encoded}"`);
  return tag.replace(/\/?>$/, (end) => ` ${name}="${encoded}"${end}`);
}

export function removeAttr(tag: string, name: string): string {
  return tag.replace(new RegExp(`\\s+${name}(?:\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s"'>]+))?`, "gi"), "");
}

function tagNameOf(tag: string): string {
  return tag.match(/^<([A-Za-z][\w:-]*)/)?.[1]?.toLowerCase() ?? "";
}

function rewriteSrcset(value: string, mapFile: (raw: string) => string | null): string {
  return value
    .split(",")
    .map((part) => {
      const trimmed = part.trim();
      if (!trimmed) return part;
      const match = trimmed.match(/^(\S+)(.*)$/);
      if (!match) return part;
      const next = mapFile(match[1] ?? "");
      if (!next) return part;
      return `${next}${match[2] ?? ""}`;
    })
    .join(", ");
}

function walkStartTags(html: string, fn: (tag: string) => string): string {
  return html.replace(/<([A-Za-z][\w:-]*)\b[^>]*>/g, (tag) => fn(tag));
}

/**
 * Point images, fonts, and stylesheets at local files.
 * `stylesheetBase` is the URL CSS `url()` values in <style> blocks resolve against
 * (the page URL). External stylesheet files are rewritten separately.
 */
export function rewriteAssetReferences(html: string, assets: AssetMap, ctx: LinkContext): string {
  const pageFile = (raw: string) => {
    const file = lookupAsset(assets, raw, ctx.pageUrl);
    return file ? assetHref(file, ctx.pageRoute) : null;
  };
  let next = rewriteCssUrls(html, pageFile);
  const urls = [...assets.keys()].sort((a, b) => b.length - a.length);
  for (const url of urls) {
    const file = assets.get(url);
    if (!file) continue;
    next = replaceBoundedUrl(next, url, assetHref(file, ctx.pageRoute));
  }
  return walkStartTags(next, (tag) => {
    const name = tagNameOf(tag);
    let out = tag;
    for (const attr of ["src", "poster"]) {
      const value = getAttr(out, attr);
      if (!value) continue;
      const file = pageFile(value);
      if (file) out = setAttr(out, attr, file);
    }
    for (const attr of ["srcset", "imagesrcset"]) {
      const value = getAttr(out, attr);
      if (!value) continue;
      out = setAttr(out, attr, rewriteSrcset(value, pageFile));
    }
    if (name === "link" || name === "image" || name === "use") {
      for (const attr of ["href", "xlink:href"]) {
        const value = getAttr(out, attr);
        if (!value) continue;
        const file = pageFile(value);
        if (file) out = setAttr(out, attr, file);
      }
    }
    if (getAttr(out, "integrity")) out = removeAttr(out, "integrity");
    return out;
  });
}

export function rewriteInternalLinks(html: string, ctx: LinkContext, assets: AssetMap): string {
  return walkStartTags(html, (tag) => {
    const name = tagNameOf(tag);
    if (name !== "a" && name !== "area") return tag;
    const href = getAttr(tag, "href");
    if (href == null) return tag;
    const trimmed = href.trim();
    if (!trimmed || trimmed.startsWith("mailto:") || trimmed.startsWith("tel:") || trimmed.startsWith("sms:")) return tag;
    if (trimmed.startsWith("javascript:")) return setAttr(tag, "href", "#");
    if (trimmed.startsWith("#")) return tag;
    const asset = lookupAsset(assets, trimmed, ctx.pageUrl);
    if (asset) return setAttr(tag, "href", assetHref(asset, ctx.pageRoute));
    let url: URL;
    try {
      url = new URL(trimmed, ctx.pageUrl);
    } catch {
      return tag;
    }
    if (url.origin !== ctx.origin) return tag;
    const route = normalizeLocalRoute(url.pathname, ctx.rootPrefix);
    if (!ctx.routes.has(route)) return tag;
    return setAttr(tag, "href", relativePageHref(ctx.pageRoute, route, url.hash || ""));
  });
}

export function flagForms(html: string, pageRoute: string): { html: string; forms: FormNote[] } {
  const forms: FormNote[] = [];
  const next = walkStartTags(html, (tag) => {
    if (tagNameOf(tag) !== "form") return tag;
    const action = getAttr(tag, "action") ?? "";
    forms.push({ pageRoute, action });
    let out = tag;
    if (!getAttr(out, "data-eject-form")) out = setAttr(out, "data-eject-form", "needs-endpoint");
    return out;
  });
  return { html: next, forms };
}

export function stripEventHandlers(html: string): string {
  return walkStartTags(html, (tag) => tag.replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s"'>]+)/gi, ""));
}

/** Keeps relative links and assets working when a host serves index.html without a trailing slash. */
export const DIRECTORY_BASE_SCRIPT = `<script data-eject="directory-base">(function(){var p=location.pathname;if(location.protocol==="file:"||p.endsWith("/")||/\\.[a-z0-9]+$/i.test(p))return;var b=document.createElement("base");b.href=p+"/";document.head.insertBefore(b,document.head.firstChild);})();</script>`;

export const ENTRANCE_CSS = `/* Platform runtime scripts are gone. These rules undo "hidden until that runtime finishes an entrance animation" without replacing the site's layout CSS. */
html.w-mod-js:not(.w-mod-ix):not(.w-mod-ix2):not(.w-mod-ix3) [data-w-id] {
  visibility: visible !important;
}
[data-framer-appear-id] {
  opacity: 1 !important;
  transform: none !important;
}
`;

export type PageBuildInput = {
  html: string;
  ctx: LinkContext;
  assets: AssetMap;
  /** CSS from adopted stylesheets, already rewritten to page-relative asset paths. */
  adoptedCss?: string;
  /** Extra tags inserted before </head>, such as a fonts stylesheet link. */
  extraHead?: string;
  noindex?: boolean;
};

export type PageBuildResult = {
  html: string;
  scriptsRemoved: number;
  forms: FormNote[];
  videos: number;
  audios: number;
  iframes: number;
  embeds: string[];
};

function countTags(html: string, tag: string): number {
  return html.match(new RegExp(`<${tag}\\b`, "gi"))?.length ?? 0;
}

function embedHosts(html: string): string[] {
  const hosts = new Set<string>();
  const re = /<(?:iframe|embed|object)\b[^>]*>/gi;
  for (const tag of html.match(re) ?? []) {
    const src = getAttr(tag, "src") || getAttr(tag, "data") || "";
    try {
      const host = new URL(src, "https://example.com").hostname;
      if (host && host !== "example.com") hosts.add(host);
    } catch {
      /* ignore */
    }
  }
  return [...hosts];
}

export function buildPageHtml(input: PageBuildInput): PageBuildResult {
  const videos = countTags(input.html, "video");
  const audios = countTags(input.html, "audio");
  const iframes = countTags(input.html, "iframe");
  const embeds = embedHosts(input.html);
  const stripped = stripRuntimeScripts(input.html);
  let html = stripEventHandlers(stripDocumentHazards(stripNoscript(stripped.html)));
  html = rewriteAssetReferences(html, input.assets, input.ctx);
  html = rewriteInternalLinks(html, input.ctx, input.assets);
  const flagged = flagForms(html, input.ctx.pageRoute);
  html = flagged.html;
  if (!/<!doctype/i.test(html)) html = `<!DOCTYPE html>\n${html}`;
  if (!/<meta\b[^>]*charset\s*=/i.test(html)) {
    if (/<head\b[^>]*>/i.test(html)) html = html.replace(/<head\b[^>]*>/i, (head) => `${head}<meta charset="utf-8">`);
    else html = html.replace(/<html\b[^>]*>/i, (open) => `${open}<head><meta charset="utf-8"></head>`);
  }
  const extras: string[] = [];
  extras.push(`<link rel="stylesheet" href="${assetHref("eject-static.css", input.ctx.pageRoute)}">`);
  if (input.adoptedCss?.trim()) {
    const escaped = input.adoptedCss.replace(/<\/style/gi, "<\\/style");
    extras.push(`<style data-eject="adopted">${escaped}</style>`);
  }
  if (input.noindex) extras.push(`<meta name="robots" content="noindex, nofollow">`);
  if (input.extraHead) extras.push(input.extraHead);
  const block = extras.join("");
  if (/<\/head>/i.test(html)) html = html.replace(/<\/head>/i, `${block}</head>`);
  else html = html.replace(/<html\b[^>]*>/i, (open) => `${open}<head>${block}</head>`);
  if (/<head\b[^>]*>/i.test(html)) html = html.replace(/<head\b[^>]*>/i, (head) => `${head}${DIRECTORY_BASE_SCRIPT}`);
  else html = html.replace(/<html\b[^>]*>/i, (open) => `${open}<head>${DIRECTORY_BASE_SCRIPT}</head>`);
  html = `<!-- Moved by Eject into files you own. Platform runtime scripts were removed. Edit the HTML. See AGENTS.md. -->\n${html}`;
  return {
    html,
    scriptsRemoved: stripped.removed,
    forms: flagged.forms,
    videos,
    audios,
    iframes,
    embeds,
  };
}

export function rootPrefixFor(paths: string[]): string {
  const first = (paths[0] ?? "/").replace(/\/$/, "");
  if (!first) return "";
  const owns = paths.slice(1).every((p) => p === first || p.startsWith(`${first}/`) || p.replace(/\/$/, "") === first);
  return owns ? first : "";
}

export function outputFileForRoute(route: string): string {
  if (!route || route === "/") return "index.html";
  return `${route.replace(/^\//, "")}/index.html`;
}
