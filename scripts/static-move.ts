#!/usr/bin/env tsx
/**
 * Eject — static move (no model)
 * ------------------------------
 * Reads a crawler snapshot and writes a self-contained HTML/CSS site.
 * No API key, no build step. The customer's agent edits the HTML.
 *
 * Usage:
 *   pnpm static-move data/snapshots/<slug>
 *   pnpm static-move data/snapshots/<slug> --out=out/<slug> [--noindex]
 */

import path from "node:path";
import { buildStaticSite } from "../lib/static-move";

function parseArgs(argv: string[]) {
  const positional = argv.filter((arg) => !arg.startsWith("--"));
  const flags = Object.fromEntries(
    argv
      .filter((arg) => arg.startsWith("--"))
      .map((arg) => {
        const [key, value = "true"] = arg.replace(/^--/, "").split("=");
        return [key, value];
      }),
  );
  const snapshot = positional[0];
  if (!snapshot) {
    console.error("usage: pnpm static-move <snapshot-dir> [--out=path] [--noindex]");
    process.exit(2);
  }
  return {
    snapshot: path.resolve(snapshot),
    out: path.resolve(String(flags.out ?? snapshot.replace("data/snapshots/", "out/"))),
    noindex: flags.noindex === "true",
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  console.log(`→ static move ${args.snapshot}`);
  console.log(`  output: ${args.out}`);
  const report = await buildStaticSite(args.snapshot, args.out, { noindex: args.noindex });
  console.log(`\n✓ ${report.pages} page${report.pages === 1 ? "" : "s"} → ${args.out}`);
  console.log(`  assets: ${report.assetsCopied}, scripts removed: ${report.scriptsRemoved}, forms: ${report.forms.length}`);
  for (const note of report.notes) console.log(`  · ${note}`);
  console.log(`\nNext: python3 -m http.server 8080 --directory ${args.out}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
