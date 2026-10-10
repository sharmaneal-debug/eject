import assert from "node:assert/strict";
import { test } from "node:test";
import { analyzeSnapshot } from "../lib/complexity";
import { crawlSite } from "../lib/http-crawl";
import { resolveAnthropicModel } from "../lib/model";
import { parseRobots } from "../lib/robots";
import { SsrfError } from "../lib/ssrf";

const lookupFn = async () => ["8.8.8.8"];

function htmlResponse(html: string, status = 200) {
  return new Response(html, {
    status,
    headers: { "content-type": status === 200 ? "text/html; charset=utf-8" : "text/plain" },
  });
}

/** A long script sits in front of the doctype, which the old 800-character gate treated as "not a page". */
function recordedShell(json: string, head: string) {
  return `<script>${"x".repeat(2000)}${json}</script><!doctype html><html><head>${head}</head><body><h1>Home</h1></body></html>`;
}

function siteFetch(home: string, pages: { [path: string]: string | undefined }) {
  return async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.endsWith("/robots.txt")) {
      return new Response("User-agent: *\nDisallow:\n", {
        status: 200,
        headers: { "content-type": "text/plain" },
      });
    }
    if (url.includes("sitemap")) return htmlResponse("missing", 404);
    const path = new URL(url).pathname.replace(/\/$/, "") || "/";
    const body = pages[path];
    if (body) return htmlResponse(body);
    return htmlResponse(home);
  };
}

test("recorded Wix, Squarespace, and Framer HTML yields pages instead of a zero-page score", async () => {
  const cases = [
    {
      url: "https://wix.example/",
      home: recordedShell(
        '{"pageUriSEO":"about"}',
        '<meta name="generator" content="Wix.com Website Builder">',
      ),
      pages: { "/about": "<!doctype html><html><body><h1>About</h1></body></html>" },
      platform: "wix",
    },
    {
      url: "https://sqsp.example/",
      home: recordedShell(
        '{"item":"squarespace-blog-collection-list","fullUrl":"/contact"}',
        '<link rel="preconnect" href="https://static1.squarespace.com">',
      ),
      pages: { "/contact": "<!doctype html><html><body><h1>Contact</h1></body></html>" },
      platform: "squarespace",
    },
    {
      url: "https://framer.example/",
      home: recordedShell(
        '{"routePath":"/work"}',
        '<meta name="generator" content="Framer">',
      ),
      pages: { "/work": "<!doctype html><html><body><h1>Work</h1></body></html>" },
      platform: "framer",
    },
  ];

  for (const item of cases) {
    assert.equal(/<html|<!doctype html/i.test(item.home.slice(0, 800)), false);
    const snapshot = await crawlSite(item.url, {
      lookupFn,
      fetchImpl: siteFetch(item.home, item.pages),
      now: () => 1_000,
    });
    assert.ok(snapshot.pages.length > 0, item.platform);
    const report = analyzeSnapshot(snapshot, { tier: "automated", amountUsd: 99 });
    assert.ok(report.pageCount > 0, item.platform);
    assert.equal(report.platform, item.platform);
    assert.equal(report.crawledPageCount, 2);
    if (item.platform === "squarespace") assert.equal(report.cmsCollections, 0);
  }
});

test("robots.txt Disallow blocks the paid crawl and a private URL never fetches", async () => {
  let fetchedPage = false;
  await assert.rejects(
    () =>
      crawlSite("https://blocked.example/", {
        lookupFn,
        fetchImpl: async (input) => {
          const url = String(input);
          if (url.endsWith("/robots.txt")) {
            return new Response("User-agent: *\nDisallow: /\n", {
              status: 200,
              headers: { "content-type": "text/plain" },
            });
          }
          fetchedPage = true;
          return htmlResponse("<!doctype html><html></html>");
        },
        now: () => 1_000,
      }),
    /robots\.txt/,
  );
  assert.equal(fetchedPage, false);

  let called = false;
  await assert.rejects(
    () =>
      crawlSite("http://127.0.0.1/", {
        fetchImpl: async () => {
          called = true;
          return htmlResponse("<!doctype html><html></html>");
        },
      }),
    (err: unknown) => err instanceof SsrfError,
  );
  assert.equal(called, false);
});

test("an EjectScan robots group is preferred over a blanket disallow", () => {
  const rules = parseRobots("User-agent: *\nDisallow: /\n\nUser-agent: EjectScan\nDisallow:\n");
  assert.equal(rules.allows("/"), true);
  assert.equal(rules.allows("/about"), true);
  const blocked = parseRobots("User-agent: *\nDisallow:\n\nUser-agent: EjectScan\nDisallow: /private\nAllow: /private/ok\n");
  assert.equal(blocked.allows("/"), true);
  assert.equal(blocked.allows("/private"), false);
  assert.equal(blocked.allows("/private/ok"), true);
});

test("the model id comes from the flag or ANTHROPIC_MODEL, and the key is not part of it", () => {
  const previous = process.env.ANTHROPIC_MODEL;
  delete process.env.ANTHROPIC_MODEL;
  try {
    assert.equal(resolveAnthropicModel("from-flag"), "from-flag");
    process.env.ANTHROPIC_MODEL = "from-env";
    assert.equal(resolveAnthropicModel(), "from-env");
    assert.equal(resolveAnthropicModel("true"), "from-env");
    delete process.env.ANTHROPIC_MODEL;
    assert.equal(resolveAnthropicModel().includes("sk-"), false);
  } finally {
    if (previous === undefined) delete process.env.ANTHROPIC_MODEL;
    else process.env.ANTHROPIC_MODEL = previous;
  }
});
