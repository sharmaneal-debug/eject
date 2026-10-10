import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const out = "/opt/cursor/artifacts/screenshots/simple";
await mkdir(out, { recursive: true });
const browser = await chromium.launch();

async function open(width, height) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.addInitScript(() => localStorage.setItem("eject-cookie-choice", "essential"));
  return page;
}

const home1440 = await open(1440, 900);
await home1440.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
await home1440.screenshot({ path: `${out}/home-1440.png` });
await home1440.getByRole("heading", { name: "Pricing" }).scrollIntoViewIfNeeded();
await home1440.waitForTimeout(200);
await home1440.screenshot({ path: `${out}/pricing-1440.png` });
await home1440.close();

const home390 = await open(390, 844);
await home390.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
await home390.screenshot({ path: `${out}/home-390.png` });
await home390.getByRole("heading", { name: "Pricing" }).scrollIntoViewIfNeeded();
await home390.waitForTimeout(200);
await home390.screenshot({ path: `${out}/pricing-390.png` });
await home390.close();

for (const [width, name] of [
  [1440, "book-1440"],
  [390, "book-390"],
]) {
  const page = await open(width, width === 390 ? 844 : 900);
  await page.goto("http://127.0.0.1:3000/book", { waitUntil: "networkidle" });
  await page.screenshot({ path: `${out}/${name}.png` });
  await page.close();
}

for (const [width, name] of [
  [1440, "order-1440"],
  [390, "order-390"],
]) {
  const page = await open(width, width === 390 ? 844 : 900);
  await page.goto("http://127.0.0.1:3000/checkout?tier=express", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Mark paid/ }).click();
  await page.waitForURL(/checkout\/success/);
  await page.getByRole("heading", { name: "Payment received." }).waitFor();
  await page.screenshot({ path: `${out}/${name}.png` });
  await page.close();
}

await browser.close();
console.log("ok");
