#!/usr/bin/env tsx
/**
 * Write the delivery repo for a paid order.
 *
 *   pnpm deliver <orderId>
 *   pnpm deliver <orderId> --rebuild
 *
 * The default writes the snapshot repo (AGENTS.md, editing playbook, content
 * extracts) and does not call a model. `--rebuild` crawls the site and runs
 * `pnpm rebuild` only when ANTHROPIC_API_KEY is set.
 */

import { spawn } from "node:child_process";
import path from "node:path";
import { deliveryDirFor, materializeDelivery } from "../lib/delivery";
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

function snapshotDir(siteUrl: string): string {
  let host = "site";
  try {
    host = new URL(siteUrl).hostname.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "site";
  } catch {
    host = "site";
  }
  return path.join("data", "snapshots", host);
}

async function main() {
  const args = process.argv.slice(2);
  const rebuild = args.includes("--rebuild");
  const orderId = args.find((arg) => !arg.startsWith("--"));
  if (!orderId) {
    console.error("usage: pnpm deliver <orderId> [--rebuild]");
    process.exit(2);
  }

  const order = await getOrderStore().get(orderId);
  if (!order) {
    console.error("Order not found.");
    process.exit(1);
  }
  if (!order.delivery) {
    console.error("That order has no delivery packet. Submit the site URL on the intake link first.");
    process.exit(1);
  }

  const dir = deliveryDirFor(order.id);
  await materializeDelivery(order.delivery, dir);
  console.log(`Wrote ${dir}`);
  console.log(order.delivery.note);

  if (!rebuild) return;

  if (!process.env.ANTHROPIC_API_KEY) {
    console.log("ANTHROPIC_API_KEY is not set. Wrote the snapshot repo and did not call the model.");
    return;
  }
  if (!order.siteUrl) {
    console.error("Order has no site URL, so crawl/rebuild was skipped.");
    process.exit(1);
  }

  const snap = snapshotDir(order.siteUrl);
  await run("pnpm", ["crawl", order.siteUrl, "--max-pages=10", `--out=${snap}`]);
  await run("pnpm", ["rebuild", snap, `--out=${dir}`]);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
