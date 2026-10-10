#!/usr/bin/env tsx
/**
 * Submit public sitemap URLs to IndexNow.
 * Required env: INDEXNOW_KEY (the same value served at /<key>.txt). The key is not printed.
 */
import { indexNowKey, submitIndexNow } from "../lib/indexnow";
import { sitemapEntries } from "../lib/sitemap-data";

function redact(message: string, key: string): string {
  return key ? message.split(key).join("[redacted]") : message;
}

async function main() {
  const key = indexNowKey();
  if (!key) {
    console.error("error: INDEXNOW_KEY is required");
    process.exit(1);
  }
  const urls = sitemapEntries().map((entry) => entry.url);
  const status = await submitIndexNow(key, urls);
  console.log(`indexnow: submitted ${urls.length} urls, status ${status}`);
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : "indexnow failed";
  console.error(redact(message, indexNowKey()));
  process.exit(1);
});
