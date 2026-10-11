import { timingSafeEqual } from "node:crypto";
import { siteConfig } from "./site";

export function indexNowKey(): string {
  return process.env.INDEXNOW_KEY?.trim() ?? "";
}

export function indexNowKeyMatches(presented: string): boolean {
  const expected = indexNowKey();
  if (!expected || presented.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(presented), Buffer.from(expected));
}

export function indexNowBody(key: string, urls: string[]) {
  const host = new URL(siteConfig.url).host;
  return {
    host,
    key,
    keyLocation: `${siteConfig.url}/${key}.txt`,
    urlList: urls,
  };
}

export async function submitIndexNow(
  key: string,
  urls: string[],
  fetchImpl: typeof fetch = fetch,
): Promise<number> {
  const response = await fetchImpl("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(indexNowBody(key, urls)),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`indexnow status ${response.status}: ${text.split(key).join("[redacted]")}`);
  }
  return response.status;
}
