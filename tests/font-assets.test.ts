import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { collectFontFileUrls, saveMissingFontFiles } from "../lib/font-assets";

test("font urls in CSS are collected and data and image urls are not", () => {
  const css = `
    @font-face{font-family:"Flowbase Inter";src:url("https://assets.flowbase.co/fonts/Inter-Regular.woff2") format("woff2");}
    @font-face{font-family:"Flowbase Inter";src:url("https://assets.flowbase.co/fonts/Inter-Bold.woff2") format("woff2");}
    @font-face{src:url("data:font/woff2;base64,abc")}
    .hero{background:url("https://cdn.example.com/hero.png")}
  `;
  const urls = collectFontFileUrls([{ base: "https://safia-light.webflow.io/", css }]);
  assert.deepEqual(urls, [
    "https://assets.flowbase.co/fonts/Inter-Regular.woff2",
    "https://assets.flowbase.co/fonts/Inter-Bold.woff2",
  ]);
});

test("missing font files are saved and a private host is not fetched", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "eject-fonts-"));
  const calls: string[] = [];
  const body = Buffer.from("wOF2-fake-font");
  try {
    const saved = await saveMissingFontFiles({
      urls: ["https://assets.flowbase.co/fonts/Inter-Regular.woff2", "https://fonts.example/secret.woff2"],
      destDir: dir,
      lookupFn: async (host) => (host === "assets.flowbase.co" ? ["1.1.1.1"] : ["127.0.0.1"]),
      fetchImpl: (async (input: string | URL | Request) => {
        const url = String(input);
        calls.push(url);
        return new Response(body, { status: 200, headers: { "content-type": "font/woff2" } });
      }) as typeof fetch,
    });
    assert.deepEqual(calls, ["https://assets.flowbase.co/fonts/Inter-Regular.woff2"]);
    assert.equal(saved.length, 1);
    assert.equal(saved[0]?.url, "https://assets.flowbase.co/fonts/Inter-Regular.woff2");
    assert.match(saved[0]?.file ?? "", /\.woff2$/);
    const disk = await readFile(path.join(dir, saved[0]!.file));
    assert.equal(disk.toString(), body.toString());
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
