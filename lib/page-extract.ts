/** How far into a response we look for a document marker. Platform pages often lead with a long script. */
const HTML_PROBE = 16_000;

const PLATFORM_DOCUMENT =
  /wix\.com website builder|static\.parastorage\.com|_wixcidx|wixsite\.com|squarespace\.com|sqsp\.net|static1\.squarespace\.com|framerusercontent\.com|framer\.app|content="framer"/i;

export function isHtmlDocument(html: string, contentType = ""): boolean {
  if (!html) return false;
  if (contentType && /xml|json|pdf|image|javascript|css/i.test(contentType) && !/html/i.test(contentType)) {
    return false;
  }
  const head = html.slice(0, HTML_PROBE);
  if (/<html[\s>]|<!doctype html/i.test(head)) return true;
  return PLATFORM_DOCUMENT.test(head);
}

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

function looksLikePage(url: string): boolean {
  try {
    const pathName = new URL(url).pathname;
    return !/\.(xml|pdf|zip|png|jpe?g|gif|webp|svg|css|js|mp4|mp3|woff2?|ico)$/i.test(pathName);
  } catch {
    return false;
  }
}

function inScope(url: string, scope: string): boolean {
  if (!scope) return true;
  const pathName = new URL(url).pathname;
  return pathName === scope || pathName.startsWith(scope + "/");
}

function addLink(found: Set<string>, pageUrl: string, href: string, scope: string) {
  const next = resolveHttp(pageUrl, href);
  if (!next || !sameOrigin(pageUrl, next) || !looksLikePage(next) || !inScope(next, scope)) return;
  found.add(next.split("?")[0]!.replace(/\/$/, "") || next);
}

/**
 * Internal page URLs from anchors plus the route fields these builders embed in JSON
 * instead of (or before) rendering `<a href>`.
 */
export function extractInternalLinks(html: string, pageUrl: string, scope = ""): string[] {
  const found = new Set<string>();
  for (const match of html.matchAll(/href=["']([^"'#]+)["']/gi)) {
    addLink(found, pageUrl, match[1] ?? "", scope);
  }
  for (const match of html.matchAll(/"pageUriSEO"\s*:\s*"([^"]*)"/g)) {
    const value = (match[1] ?? "").trim();
    if (!value || value === "/") continue;
    addLink(found, pageUrl, value.startsWith("/") ? value : `/${value}`, scope);
  }
  for (const match of html.matchAll(/"fullUrl"\s*:\s*"([^"]+)"/g)) {
    addLink(found, pageUrl, match[1] ?? "", scope);
  }
  for (const match of html.matchAll(/"routePath"\s*:\s*"([^"]+)"/g)) {
    addLink(found, pageUrl, match[1] ?? "", scope);
  }
  return Array.from(found);
}
