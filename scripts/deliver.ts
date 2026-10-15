#!/usr/bin/env tsx
/**
 * Write the customer folder for a paid order.
 *
 *   pnpm deliver <orderId>
 *   pnpm deliver <orderId> --llm
 *   pnpm deliver <orderId> --rebuild
 *
 * The default crawls when the order has a site URL and no snapshot yet,
 * then runs static-move into out/orders/<orderId> (HTML, CSS, assets,
 * AGENTS.md, EDITING.md, hosting README). It does not call a model.
 *
 * `--llm` and `--rebuild` also run `pnpm rebuild` into a sibling folder
 * when ANTHROPIC_API_KEY is set. Without that key the model step is skipped
 * and the static site is still written.
 */

import { spawn } from "node:child_process";
import { rm } from "node:fs/promises";
import path from "node:path";
import { deliveryDirFor, materializeDelivery } from "../lib/delivery";
import { isSnapshotReady, llmOutDirFor, parseDeliverArgs, planDeliver, snapshotDirForSite, type DeliverAction } from "../lib/deliver-run";
import { getOrderStore } from "../lib/orders";

function run(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited ${code ?? "unknown"}`));
    });
  });
}

function assertDeliveryDir(dir: string) {
  const resolved = path.resolve(dir);
  const root = path.resolve(process.cwd(), "out", "orders");
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    throw new Error("refusing to replace a delivery folder outside out/orders");
  }
}

async function runAction(action: DeliverAction, packetDir: string, materialize: () => Promise<void>): Promise<void> {
  if (action.type === "text") {
    await materialize();
    console.log(`Wrote ${packetDir} (text extract; no site URL or crawl snapshot on this order)`);
    return;
  }
  if (action.type === "crawl") {
    await run("pnpm", ["crawl", action.siteUrl, `--max-pages=${action.maxPages}`, `--out=${action.snapshotDir}`]);
    return;
  }
  if (action.type === "static-move") {
    assertDeliveryDir(action.outDir);
    await rm(action.outDir, { recursive: true, force: true });
    await run("pnpm", ["static-move", action.snapshotDir, `--out=${action.outDir}`]);
    console.log(`Wrote ${action.outDir} (static HTML/CSS)`);
    return;
  }
  if (action.type === "skip-llm") {
    const wrote = action.wrote === "static" ? "The static site was written" : "The text extract was written";
    console.log(`ANTHROPIC_API_KEY is not set. ${wrote} and the model was not called.`);
    return;
  }
  await run("pnpm", ["rebuild", action.snapshotDir, `--out=${action.outDir}`]);
  console.log(`Wrote ${action.outDir} (model rebuild)`);
}

async function main() {
  const parsed = parseDeliverArgs(process.argv.slice(2));
  if ("error" in parsed) {
    console.error(parsed.error);
    process.exit(2);
  }

  const order = await getOrderStore().get(parsed.orderId);
  if (!order) {
    console.error("Order not found.");
    process.exit(1);
  }

  const outDir = deliveryDirFor(order.id);
  const snapshotDir = order.siteUrl ? snapshotDirForSite(order.siteUrl) : "";
  const snapshotReady = snapshotDir ? await isSnapshotReady(snapshotDir) : false;
  const plan = planDeliver({
    siteUrl: order.siteUrl,
    hasDeliveryPacket: Boolean(order.delivery),
    snapshotReady,
    llm: parsed.llm,
    hasApiKey: Boolean(process.env.ANTHROPIC_API_KEY),
    outDir,
    snapshotDir,
    llmOutDir: llmOutDirFor(order.id),
  });

  if (plan.actions.length === 0 && plan.error) {
    console.error(plan.error);
    process.exit(1);
  }

  for (const action of plan.actions) {
    await runAction(action, outDir, async () => {
      if (!order.delivery) throw new Error("That order has no delivery packet.");
      await materializeDelivery(order.delivery, outDir);
    });
  }

  if (order.delivery?.note) console.log(order.delivery.note);
  if (plan.error) {
    console.error(plan.error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
