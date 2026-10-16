#!/usr/bin/env tsx
/**
 * GitHub Actions delivery worker.
 *
 * Vercel cannot run Playwright crawl + static-move inside a function
 * (browser binary size, and the job routinely exceeds the function limit).
 * The paid webhook and /api/cron/deliver-orders dispatch
 * .github/workflows/deliver-order.yml, which runs this script.
 *
 * ORDER_ID is read from the environment, never from a shell string.
 */

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { finishDeliveredOrder, gateCrawledDelivery, llmRebuildDecision, noteExternalFailure, WAITING_FOR_SITE_URL } from "../lib/auto-deliver";
import { deliveryDirFor } from "../lib/delivery";
import { llmOutDirFor, snapshotDirForSite } from "../lib/deliver-run";
import { getOrderStore } from "../lib/orders";
import { simpleSiteScope } from "../lib/pricing";
import { zipStore } from "../lib/zip-store";

const TEXT = /\.(html?|css|md|json|txt|mjs|js|tsx|ts|svg)$/i;

const tsxCli = createRequire(import.meta.url).resolve("tsx/dist/cli.mjs");

function run(script: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [tsxCli, script, ...args], { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${path.basename(script)} exited ${code ?? "unknown"}`));
    });
  });
}

async function readTree(root: string, base = root): Promise<Array<{ path: string; contents: Buffer }>> {
  const out: Array<{ path: string; contents: Buffer }> = [];
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) out.push(...(await readTree(full, base)));
    else if (entry.isFile()) {
      const rel = path.relative(base, full).split(path.sep).join("/");
      const contents = await readFile(full);
      if (contents.length > 2_000_000) continue;
      out.push({ path: rel, contents });
    }
  }
  return out;
}

async function main() {
  const orderId = process.env.ORDER_ID?.trim() ?? "";
  if (!/^ord_[A-Za-z0-9]+$/.test(orderId)) {
    console.error("ORDER_ID must be an order id.");
    process.exit(2);
  }
  const store = getOrderStore();
  const order = await store.get(orderId);
  if (!order) {
    console.error("Order not found. On GitHub Actions, set the same KV_REST_API_URL and KV_REST_API_TOKEN used on Vercel.");
    process.exit(1);
  }
  if (!order.deliveryJob || order.deliveryJob.state === "delivered" || order.deliveryJob.state === "failed" || order.deliveryJob.state === "skipped") {
    console.log("Nothing to deliver.");
    return;
  }
  let site: URL | null = null;
  try {
    if (order.siteUrl) site = new URL(order.siteUrl);
  } catch {
    site = null;
  }
  if (!site || (site.protocol !== "http:" && site.protocol !== "https:")) {
    await store.update(order.id, {
      deliveryJob: {
        ...order.deliveryJob,
        state: "queued",
        lastError: WAITING_FOR_SITE_URL,
        updatedAt: new Date().toISOString(),
      },
    });
    console.log("Waiting for a site URL.");
    return;
  }

  const updatedAt = new Date().toISOString();
  const attempts = order.deliveryJob.state === "dispatched" ? order.deliveryJob.attempts : order.deliveryJob.attempts + 1;
  const claimed = await store.compareAndUpdate(
    order.id,
    { deliveryState: order.deliveryJob.state, attempts: order.deliveryJob.attempts },
    { deliveryJob: { ...order.deliveryJob, state: "running", attempts, runner: "github", updatedAt, lastError: undefined } },
  );
  if (!claimed?.deliveryJob) {
    console.log("Another worker owns this order.");
    return;
  }

  const snapshotDir = snapshotDirForSite(site.toString());
  const outDir = deliveryDirFor(order.id);
  const llmDir = path.resolve(llmOutDirFor(order.id));

  try {
    await run(path.join("scripts", "crawl.ts"), [site.toString(), `--max-pages=${simpleSiteScope.maxPages}`, `--out=${snapshotDir}`]);
    const gate = await gateCrawledDelivery(claimed, snapshotDir, site.toString());
    if (!gate.ok) {
      if (gate.reason === "not eligible") {
        console.log("Site is not eligible. No package was sent.");
        return;
      }
      throw new Error("crawl produced no pages");
    }
    const decision = llmRebuildDecision(gate.report.pageCount);
    await run(path.join("scripts", "static-move.ts"), [snapshotDir, `--out=${outDir}`]);
    if (decision.action === "run") {
      await run(path.join("scripts", "rebuild.ts"), [snapshotDir, `--out=${llmDir}`]);
    }
    const siteFiles = await readTree(outDir);
    const llmFiles =
      decision.action === "run" ? (await readTree(llmDir)).map((file) => ({ ...file, path: `rebuild/${file.path}` })) : [];
    const packed = [...siteFiles, ...llmFiles];
    const repoFiles = packed
      .filter((file) => TEXT.test(file.path) && file.contents.length <= 100_000)
      .slice(0, 40)
      .map((file) => ({ path: file.path, contents: file.contents.toString("utf8") }));
    const llm =
      decision.action === "run" ? "ran" : decision.action === "skip_cap" ? "over_cap" : decision.action === "skip_unpriced" ? "unpriced" : "unset";
    await finishDeliveredOrder(order.id, {
      repoFiles: repoFiles.length ? repoFiles : [{ path: "README.md", contents: `Static site for ${site.toString()}\n` }],
      note: "Packaged by the GitHub Actions delivery worker (Playwright crawl and static-move).",
      score: gate.report,
      siteUrl: site.toString(),
      llm,
      zipBytes: zipStore(packed),
    });
    console.log(`Delivered ${order.id}`);
  } catch (err) {
    const reason = err instanceof Error ? err.message : "delivery failed";
    if (reason === "delivery email is already in progress") {
      console.log(reason);
      return;
    }
    console.error(reason);
    await noteExternalFailure(orderId, reason);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : "delivery failed");
  process.exit(1);
});
