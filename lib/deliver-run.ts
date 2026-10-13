/**
 * What `pnpm deliver` does.
 *
 * Default: crawl if the snapshot is missing, then static-move into the
 * customer folder (HTML, CSS, assets, AGENTS.md, hosting README). No model.
 * `--llm` and `--rebuild` opt into `pnpm rebuild`. That step is skipped
 * when ANTHROPIC_API_KEY is missing.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { simpleSiteScope } from "./pricing";

export type DeliverAction =
  | { type: "text"; outDir: string }
  | { type: "crawl"; siteUrl: string; snapshotDir: string; maxPages: number }
  | { type: "static-move"; snapshotDir: string; outDir: string }
  | { type: "skip-llm"; wrote: "static" | "text" }
  | { type: "rebuild"; snapshotDir: string; outDir: string };

export function snapshotDirForSite(siteUrl: string): string {
  let slug = "site";
  try {
    slug = new URL(siteUrl).hostname.replace(/[^a-z0-9]+/gi, "-") || "site";
  } catch {
    slug = "site";
  }
  return path.join("data", "snapshots", slug);
}

export function llmOutDirFor(orderId: string): string {
  return path.join("out", "orders", `${orderId}-llm`);
}

export function parseDeliverArgs(argv: string[]): { orderId: string; llm: boolean } | { error: string } {
  const llm = argv.includes("--rebuild") || argv.includes("--llm");
  const orderId = argv.find((arg) => !arg.startsWith("--"));
  if (!orderId) return { error: "usage: pnpm deliver <orderId> [--rebuild|--llm]" };
  return { orderId, llm };
}

export async function isSnapshotReady(dir: string): Promise<boolean> {
  try {
    const manifest = JSON.parse(await readFile(path.join(dir, "manifest.json"), "utf8")) as { pages?: unknown[] };
    return Array.isArray(manifest.pages) && manifest.pages.length > 0;
  } catch {
    return false;
  }
}

export function planDeliver(input: {
  siteUrl?: string;
  hasDeliveryPacket: boolean;
  snapshotReady: boolean;
  llm: boolean;
  hasApiKey: boolean;
  outDir: string;
  snapshotDir: string;
  llmOutDir: string;
}): { actions: DeliverAction[]; error?: string } {
  const siteUrl = input.siteUrl?.trim() || "";
  const canStatic = Boolean(siteUrl) || input.snapshotReady;
  const actions: DeliverAction[] = [];

  if (!canStatic && !input.hasDeliveryPacket) {
    return {
      actions,
      error: "That order has no site URL, crawl snapshot, or delivery packet. Submit the site URL on the intake link first.",
    };
  }

  if (canStatic && input.snapshotReady) {
    actions.push({ type: "static-move", snapshotDir: input.snapshotDir, outDir: input.outDir });
  } else if (canStatic && siteUrl) {
    actions.push({
      type: "crawl",
      siteUrl,
      snapshotDir: input.snapshotDir,
      maxPages: simpleSiteScope.maxPages,
    });
    actions.push({ type: "static-move", snapshotDir: input.snapshotDir, outDir: input.outDir });
  } else {
    actions.push({ type: "text", outDir: input.outDir });
  }

  if (!input.llm) return { actions };

  if (!input.hasApiKey) {
    actions.push({ type: "skip-llm", wrote: canStatic ? "static" : "text" });
    return { actions };
  }

  if (!canStatic) {
    return { actions, error: "Order has no site URL, so the model rebuild was skipped." };
  }

  actions.push({ type: "rebuild", snapshotDir: input.snapshotDir, outDir: input.llmOutDir });
  return { actions };
}
