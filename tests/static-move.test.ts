import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { test } from "node:test";
import { buildStaticSite } from "../lib/static-move";
import {
  buildPageHtml,
  relativePageHref,
  rewriteStylesheet,
  stripRuntimeScripts,
  type AssetMap,
  type LinkContext,
} from "../lib/static-html";

const execFileAsync = promisify(execFile);

const assets: AssetMap = new Map([
  ["https://cdn.example.com/site.css", "site.css"],
  ["https://cdn.example.com/hero.png", "hero.png"],
  ["https://example.com/daycare-websites/pic.png", "pic.png"],
  ["https://example.com/daycare-websites/pricing/pic.png", "pic.png"],
]);

function ctx(over: Partial<LinkContext> = {}): LinkContext {
  return {
    pageUrl: "https://example.com/daycare-websites/",
    pageRoute: "/",
    origin: "https://example.com",
    rootPrefix: "/daycare-websites",
    routes: new Set(["/", "/pricing", "/about"]),
    ...over,
  };
}

const PAGE = `<html><head>
<link rel="stylesheet" href="https://cdn.example.com/site.css" integrity="sha256-abc">
<script src="https://www.wix.com/runtime.js"></script>
<script>window.platform = "keep-me-out"</script>
<script type="application/ld+json">{"@type":"Thing"}</script>
</head><body>
<a href="https://example.com/daycare-websites/pricing">Pricing</a>
<a href="/daycare-websites/about">About</a>
<a href="mailto:hi@example.com">Mail</a>
<a href="https://other.test/away">Away</a>
<a href="#top">Top</a>
<a href="javascript:void(0)">JS</a>
<a href="https://example.com/not-captured">Old</a>
<img src="https://cdn.example.com/hero.png" srcset="https://cdn.example.com/hero.png 2x, pic.png 1x">
<form action="https://example.com/daycare-websites/submit"><input name="email"></form>
<iframe src="https://www.youtube.com/embed/abc"></iframe>
</body></html>`;

test("runtime scripts are removed and JSON-LD stays", () => {
  const { html, removed } = stripRuntimeScripts(PAGE);
  assert.equal(removed, 2);
  assert.equal(html.includes("wix.com/runtime.js"), false);
  assert.equal(html.includes("keep-me-out"), false);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /"@type":"Thing"/);
  assert.match(html, /rel="stylesheet"/);
});

test("internal links rewrite to local pages, external and mail stay, scripts stay gone", () => {
  const home = buildPageHtml({ html: PAGE, ctx: ctx(), assets });
  assert.equal(home.scriptsRemoved, 2);
  assert.match(home.html, /href="pricing\/"/);
  assert.match(home.html, /href="about\/"/);
  assert.match(home.html, /href="mailto:hi@example.com"/);
  assert.match(home.html, /href="https:\/\/other\.test\/away"/);
  assert.match(home.html, /href="#top"/);
  assert.match(home.html, /href="#"/);
  assert.match(home.html, /href="https:\/\/example\.com\/not-captured"/);
  assert.equal(home.html.includes("<script src="), false);
  assert.equal(home.html.includes("keep-me-out"), false);
  assert.match(home.html, /application\/ld\+json/);
  assert.match(home.html, /href="assets\/site\.css"/);
  assert.equal(home.html.includes("integrity="), false);
  assert.match(home.html, /src="assets\/hero\.png"/);
  assert.match(home.html, /srcset="assets\/hero\.png 2x, assets\/pic\.png 1x"/);
  assert.match(home.html, /data-eject-form="needs-endpoint"/);
  assert.equal(home.forms.length, 1);
  assert.equal(home.forms[0]?.action, "https://example.com/daycare-websites/submit");
  assert.equal(home.iframes, 1);
  assert.deepEqual(home.embeds, ["www.youtube.com"]);
  assert.match(home.html, /<!DOCTYPE html>/i);
  assert.equal(/name="robots"/i.test(home.html), false);
  assert.match(home.html, /<head><script data-eject="directory-base">/);
  assert.ok(home.html.indexOf('data-eject="directory-base"') < home.html.indexOf('rel="stylesheet"'));

  const nested = buildPageHtml({
    html: `<html><head></head><body>
      <a href="https://example.com/daycare-websites/">Home</a>
      <a href="https://example.com/daycare-websites/pricing#cost">Cost</a>
      <img src="pic.png">
    </body></html>`,
    ctx: ctx({ pageRoute: "/pricing", pageUrl: "https://example.com/daycare-websites/pricing/" }),
    assets,
  });
  assert.match(nested.html, /href="\.\.\/"/);
  assert.match(nested.html, /href="#cost"/);
  assert.match(nested.html, /src="\.\.\/assets\/pic\.png"/);
});

test("relative page hrefs", () => {
  assert.equal(relativePageHref("/", "/pricing"), "pricing/");
  assert.equal(relativePageHref("/pricing", "/"), "../");
  assert.equal(relativePageHref("/pricing", "/pricing", "#cost"), "#cost");
  assert.equal(relativePageHref("/a/b", "/pricing"), "../../pricing/");
});

test("an inline Flowbase font face points at the local file", () => {
  const html = `<html><head><style>@font-face{font-family:"Flowbase Inter";font-weight:400;src:url("https://assets.flowbase.co/fonts/Inter-Regular.woff2") format("woff2");}</style></head><body>Hi</body></html>`;
  const built = buildPageHtml({
    html,
    ctx: ctx({
      pageUrl: "https://safia-light.webflow.io/",
      pageRoute: "/",
      origin: "https://safia-light.webflow.io",
      rootPrefix: "",
      routes: new Set(["/"]),
    }),
    assets: new Map([["https://assets.flowbase.co/fonts/Inter-Regular.woff2", "inter-regular.woff2"]]),
  });
  assert.match(built.html, /url\("assets\/inter-regular\.woff2"\)/);
  assert.equal(built.html.includes("assets.flowbase.co"), false);
});

test("stylesheet urls are rewritten next to the css file", () => {
  const css = rewriteStylesheet(
    `@import "extra.css"; @font-face{src:url("https://cdn.example.com/font.woff2")} .a{background:url('../img/hero.png')}`,
    "https://cdn.example.com/site.css",
    new Map([
      ["https://cdn.example.com/extra.css", "extra.css"],
      ["https://cdn.example.com/font.woff2", "font.woff2"],
      ["https://cdn.example.com/img/hero.png", "hero.png"],
    ]),
  );
  assert.match(css, /@import "extra\.css"/);
  assert.match(css, /url\("font\.woff2"\)/);
  assert.match(css, /url\("hero\.png"\)/);
  assert.equal(css.includes("https://cdn.example.com"), false);
});

test("static move writes a hostable site and the editing guide", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "eject-static-"));
  const snap = path.join(root, "snap");
  const out = path.join(root, "out");
  await mkdir(path.join(snap, "pages"), { recursive: true });
  await mkdir(path.join(snap, "assets"), { recursive: true });
  await mkdir(path.join(snap, "styles"), { recursive: true });
  await writeFile(path.join(snap, "assets", "hero.png"), "png", "utf8");
  await writeFile(path.join(snap, "styles", "site.css"), "body{background:url('https://cdn.example.com/hero.png')}", "utf8");
  await writeFile(
    path.join(snap, "manifest.json"),
    JSON.stringify({
      sourceUrl: "https://example.com/daycare-websites",
      platform: "wix",
      capturedAt: "2026-10-12T00:00:00.000Z",
      pageCount: 2,
      pages: [
        { url: "https://example.com/daycare-websites", path: "/daycare-websites", title: "Home" },
        { url: "https://example.com/daycare-websites/pricing", path: "/daycare-websites/pricing", title: "Pricing" },
      ],
    }),
  );
  await writeFile(
    path.join(snap, "assets.json"),
    JSON.stringify({ items: [{ url: "https://cdn.example.com/hero.png", file: "hero.png" }] }),
  );
  await writeFile(
    path.join(snap, "stylesheets.json"),
    JSON.stringify([{ url: "https://cdn.example.com/site.css", file: "site.css" }]),
  );
  const html = `<html><head><link rel="stylesheet" href="https://cdn.example.com/site.css"><script src="https://wix.com/a.js"></script></head><body><a href="https://example.com/daycare-websites/pricing">Pricing</a><img src="https://cdn.example.com/hero.png"><form action="/send"></form></body></html>`;
  await writeFile(
    path.join(snap, "pages", "daycare-websites.json"),
    JSON.stringify({ url: "https://example.com/daycare-websites", baseUrl: "https://example.com/daycare-websites/", path: "/daycare-websites", html }),
  );
  await writeFile(
    path.join(snap, "pages", "daycare-websites__pricing.json"),
    JSON.stringify({
      url: "https://example.com/daycare-websites/pricing",
      baseUrl: "https://example.com/daycare-websites/pricing/",
      path: "/daycare-websites/pricing",
      html: `<html><head></head><body><a href="https://example.com/daycare-websites/">Home</a></body></html>`,
    }),
  );
  try {
    const report = await buildStaticSite(snap, out);
    assert.deepEqual(report.routes, ["/", "/pricing"]);
    assert.equal(report.forms.length, 1);
    assert.equal(report.scriptsRemoved, 1);
    const home = await readFile(path.join(out, "index.html"), "utf8");
    assert.match(home, /href="pricing\/"/);
    assert.match(home, /src="assets\/hero\.png"/);
    assert.match(home, /href="assets\/site\.css"/);
    assert.equal(home.includes("wix.com/a.js"), false);
    const pricing = await readFile(path.join(out, "pricing", "index.html"), "utf8");
    assert.match(pricing, /href="\.\.\/"/);
    const css = await readFile(path.join(out, "assets", "site.css"), "utf8");
    assert.match(css, /url\("hero\.png"\)/);
    const agents = await readFile(path.join(out, "AGENTS.md"), "utf8");
    assert.match(agents, /plain HTML and CSS/);
    assert.match(agents, /data-eject-form/);
    const readme = await readFile(path.join(out, "README.md"), "utf8");
    assert.match(readme, /python3 -m http\.server/);
    assert.match(readme, /Cloudflare Pages/);
    const { stdout } = await execFileAsync(process.execPath, ["scripts/chat-edit.mjs", "Change the hero headline to Spring workshops."], { cwd: out });
    assert.match(stdout, /edits\/inbox\.md/);
    const inbox = await readFile(path.join(out, "edits", "inbox.md"), "utf8");
    assert.match(inbox, /Spring workshops/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
