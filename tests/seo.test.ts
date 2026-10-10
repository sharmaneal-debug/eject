import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { test } from "node:test";
import { faqItems } from "../components/faq";
import { GET as health } from "../app/api/health/route";
import { GET as indexNowKeyFile } from "../app/api/indexnow/[key]/route";
import robots from "../app/robots";
import sitemap from "../app/sitemap";
import { indexNowBody, submitIndexNow } from "../lib/indexnow";
import { listPosts } from "../lib/posts";
import { faqSchema, organizationSchema, productSchema, websiteSchema } from "../lib/schema";
import { pageMetadata, siteVerification } from "../lib/seo";
import { siteConfig } from "../lib/site";

const NEW_POSTS = [
  "how-to-leave-webflow",
  "how-to-leave-framer",
  "squarespace-renewal-cost",
  "wix-vs-self-hosted-cost",
];

function run(command: string, args: string[], env: NodeJS.ProcessEnv): Promise<{ code: number | null; output: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { env, cwd: process.cwd() });
    let output = "";
    child.stdout.on("data", (chunk) => {
      output += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      output += String(chunk);
    });
    child.on("error", reject);
    child.on("exit", (code) => resolve({ code, output }));
  });
}

test("sitemap lists public pages and the new posts with their dates", () => {
  const entries = sitemap();
  const urls = entries.map((entry) => entry.url);
  assert.ok(urls.includes(`${siteConfig.url}/pricing`));
  assert.ok(urls.includes(`${siteConfig.url}/migrate/wix`));
  assert.equal(urls.some((url) => url.includes("/kit")), false);
  assert.equal(urls.some((url) => url.includes("unsubscribe")), false);
  const posts = listPosts();
  assert.equal(urls.filter((url) => url.includes("/blog/")).length, posts.length);
  for (const slug of NEW_POSTS) {
    const entry = entries.find((item) => item.url === `${siteConfig.url}/blog/${slug}`);
    assert.ok(entry, slug);
    assert.equal(String(entry.lastModified).slice(0, 10), "2026-10-10");
  }
  const rules = robots();
  assert.equal(rules.sitemap, `${siteConfig.url}/sitemap.xml`);
});

test("page metadata sets a canonical and the shared og image", () => {
  const meta = pageMetadata({ title: "Pricing", description: "Automated move.", path: "/pricing" });
  assert.equal(meta.alternates?.canonical, "/pricing");
  const images = meta.openGraph && "images" in meta.openGraph ? meta.openGraph.images : undefined;
  assert.ok(Array.isArray(images));
  const image = images[0];
  assert.ok(image && typeof image === "object" && "url" in image);
  assert.match(String(image.url), /^\/og\?/);
  const twitter = meta.twitter;
  assert.ok(twitter && "card" in twitter);
  assert.equal(twitter.card, "summary_large_image");
});

test("verification meta comes from env and is omitted when unset", () => {
  const previousGoogle = process.env.GOOGLE_SITE_VERIFICATION;
  const previousBing = process.env.BING_SITE_VERIFICATION;
  delete process.env.GOOGLE_SITE_VERIFICATION;
  delete process.env.BING_SITE_VERIFICATION;
  try {
    assert.equal(siteVerification(), undefined);
    process.env.GOOGLE_SITE_VERIFICATION = "google-token";
    process.env.BING_SITE_VERIFICATION = "bing-token";
    const tags = siteVerification();
    assert.equal(tags?.google, "google-token");
    assert.equal(tags?.other?.["msvalidate.01"], "bing-token");
  } finally {
    if (previousGoogle === undefined) delete process.env.GOOGLE_SITE_VERIFICATION;
    else process.env.GOOGLE_SITE_VERIFICATION = previousGoogle;
    if (previousBing === undefined) delete process.env.BING_SITE_VERIFICATION;
    else process.env.BING_SITE_VERIFICATION = previousBing;
  }
});

test("structured data names the company, the $99 offer, and the FAQ", () => {
  const org = organizationSchema();
  assert.equal(org.name, "Laniakea LLC");
  assert.equal(org.email, "hi@ejectfrom.com");
  const site = websiteSchema();
  assert.equal(site["@type"], "WebSite");
  const product = productSchema();
  assert.equal(product.offers.price, 99);
  assert.equal(Array.isArray(product.offers), false);
  const faq = faqSchema(faqItems);
  assert.equal(faq["@type"], "FAQPage");
  assert.equal(faq.mainEntity.length, faqItems.length);
  const packed = JSON.stringify({ org, site, product, faq });
  assert.equal(packed.includes("199"), false);
  assert.equal(packed.includes("Neal"), false);
  assert.equal(packed.includes("Sharma"), false);
});

test("health returns ok and a version with no secrets", async () => {
  const response = health();
  assert.equal(response.status, 200);
  const body = (await response.json()) as { ok: boolean; version: string };
  assert.equal(body.ok, true);
  assert.equal(body.version, "0.1.0");
  assert.equal(Object.keys(body).sort().join(","), "ok,version");
});

test("indexnow key file matches env and does not reveal it on a miss", async () => {
  const previous = process.env.INDEXNOW_KEY;
  process.env.INDEXNOW_KEY = "indexnowkeyvalue";
  try {
    const ok = await indexNowKeyFile(new Request("http://localhost/indexnowkeyvalue.txt"), {
      params: Promise.resolve({ key: "indexnowkeyvalue" }),
    });
    assert.equal(ok.status, 200);
    assert.equal(await ok.text(), "indexnowkeyvalue");
    const miss = await indexNowKeyFile(new Request("http://localhost/other.txt"), {
      params: Promise.resolve({ key: "other" }),
    });
    assert.equal(miss.status, 404);
    assert.equal((await miss.text()).includes("indexnowkeyvalue"), false);
  } finally {
    if (previous === undefined) delete process.env.INDEXNOW_KEY;
    else process.env.INDEXNOW_KEY = previous;
  }
});

test("indexnow submit posts sitemap urls and redacts the key from errors", async () => {
  const key = "indexnowkeyvalue";
  const urls = [`${siteConfig.url}/`, `${siteConfig.url}/pricing`];
  let posted = "";
  const status = await submitIndexNow(key, urls, async (_input, init) => {
    posted = String(init?.body);
    return new Response("ok", { status: 200 });
  });
  assert.equal(status, 200);
  const body = JSON.parse(posted) as { key: string; keyLocation: string; urlList: string[] };
  assert.equal(body.key, key);
  assert.equal(body.keyLocation, `${siteConfig.url}/${key}.txt`);
  assert.deepEqual(body.urlList, urls);
  assert.deepEqual(indexNowBody(key, urls).host, "ejectfrom.com");

  await assert.rejects(
    () =>
      submitIndexNow(key, urls, async () => new Response(`bad ${key}`, { status: 422 })),
    (err: unknown) => err instanceof Error && err.message.includes("[redacted]") && !err.message.includes(key),
  );
});

test("pnpm indexnow exits when the key is missing and does not print a stand-in", { timeout: 60_000 }, async () => {
  const standIn = "indexnow-should-not-print";
  const result = await run("pnpm", ["indexnow"], { ...process.env, INDEXNOW_KEY: "" });
  assert.equal(result.code, 1);
  assert.match(result.output, /INDEXNOW_KEY is required/);
  assert.equal(result.output.includes(standIn), false);
});
