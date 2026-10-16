// usage: shoot.ts <url> <outPrefix>
// Saves <outPrefix>-desktop.png (1440) and <outPrefix>-mobile.png (390), full page, after scrolling to trigger lazy content.
import { chromium } from "playwright";

async function main() {
  const args = process.argv.slice(2);
  const localOnly = args.includes("--local");
  const [url, prefix] = args.filter((arg) => !arg.startsWith("--"));
  if (!url || !prefix) {
    console.error("usage: tsx scripts/harness/shoot.ts <url> <outPrefix> [--local]");
    process.exit(2);
  }
  const browser = await chromium.launch({ headless: true });
  const out: Record<string, unknown> = {};
  for (const [name, width, height] of [
    ["desktop", 1440, 900],
    ["mobile", 390, 844],
  ] as const) {
    const ctx = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
      userAgent:
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36 EjectPipelineTest/0.1",
    });
    await ctx.addInitScript("globalThis.__name = (t) => t;");
    const page = await ctx.newPage();
    if (localOnly) {
      // The moved site has to stand on its own files. A live CDN must not fill in missing images or fonts.
      await page.route("**/*", (route) => {
        const target = route.request().url();
        if (target.startsWith("http://127.0.0.1") || target.startsWith("http://localhost") || target.startsWith("data:") || target.startsWith("blob:")) {
          route.continue();
        } else route.abort();
      });
    }
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));
    const failed: string[] = [];
    page.on("response", (r) => {
      if (r.status() >= 400) failed.push(`${r.status()} ${r.url().slice(0, 120)}`);
    });
    try {
      await page.goto(url, { waitUntil: "load", timeout: 45000 });
      await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => undefined);
      await page.evaluate(() => document.fonts?.ready).catch(() => undefined);
      await page.waitForTimeout(1200);
      const h = await page.evaluate(async () => {
        let y = 0;
        const step = Math.max(300, innerHeight * 0.7);
        while (y < Math.min(document.documentElement.scrollHeight, 20000)) {
          scrollTo(0, y);
          y += step;
          await new Promise((r) => setTimeout(r, 180));
        }
        scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 500));
        return document.documentElement.scrollHeight;
      });
      await page.evaluate(() => document.fonts?.ready).catch(() => undefined);
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${prefix}-${name}.png`, fullPage: true });
      const text = await page.evaluate(() => document.body.innerText);
      out[name] = {
        height: h,
        words: text.split(/\s+/).filter(Boolean).length,
        errors: errors.slice(0, 5),
        failed: failed.slice(0, 8),
        failedCount: failed.length,
      };
      if (name === "desktop") {
        const fs = await import("node:fs");
        fs.writeFileSync(`${prefix}-text.txt`, text);
      }
    } catch (e) {
      out[name] = { error: String(e).slice(0, 200) };
    }
    await ctx.close();
  }
  await browser.close();
  console.log(JSON.stringify(out));
}

main();
