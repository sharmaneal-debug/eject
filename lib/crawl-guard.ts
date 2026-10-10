import { RobotsError, type RobotsRules } from "./robots";
import { assertPublicHttpUrl, type LookupFn } from "./ssrf";

/**
 * Check one document navigation (the start URL, a queued page, or the URL after redirects).
 * Asset and font responses are not passed through here.
 */
export async function assertCrawlDocument(
  raw: string,
  robots: RobotsRules,
  lookupFn?: LookupFn,
): Promise<URL> {
  const url = await assertPublicHttpUrl(raw, lookupFn);
  if (!robots.allows(url.pathname || "/")) throw new RobotsError();
  return url;
}
