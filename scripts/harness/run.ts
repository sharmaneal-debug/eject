#!/usr/bin/env tsx
/**
 * Parity harness for the no-model static move.
 *
 *   pnpm parity
 *   pnpm parity --only=minimum-01
 *   pnpm parity --sites=scripts/harness/sites.tsv --out=out/parity
 *
 * For each fixture: polite crawl (robots.txt, about 1 document/second, path scope),
 * static move, screenshots at 1440 and 390, then scripts/harness/compare.py.
 * Crawl dumps stay under the output directory (gitignored). Summaries are small JSON.
 *
 * Python: pip install -r scripts/harness/requirements.txt
 *   PARITY_PYTHON=/path/to/python pnpm parity
 */

import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import path from "node:path";
import { buildStaticSite } from "../../lib/static-move";

type Site = { slug: string; url: string; platform: string; pages: string };

type Summary = {
  slug: string;
  url: string;
  platform: string;
  pages: number | null;
  routes: string[];
  rating: string | null;
  edgeSsimDesktop: number | null;
  edgeSsimDesktopFold: number | null;
  edgeSsimMobile: number | null;
  textRecall: number | null;
  heightRatioDesktop: number | null;
  heightRatioMobile: number | null;
  wallMs: number;
  outputBytes: number | null;
  notes: string[];
  error?: string;
};

function flag(name: string, fallback = ""): string {
  const hit = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
}

function parseSites(file: string): Site[] {
  const lines = readFileSync(file, "utf8").trim().split(/\n/).slice(1);
  return lines.filter(Boolean).map((line) => {
    const [slug, url, platform, extra = ""] = line.split("\t");
    const pages = extra.match(/--pages=(\S+)/)?.[1] ?? "";
    return { slug: slug ?? "", url: url ?? "", platform: platform ?? "", pages };
  });
}

function pythonBin(): string {
  if (process.env.PARITY_PYTHON && existsSync(process.env.PARITY_PYTHON)) return process.env.PARITY_PYTHON;
  return "python3";
}

function run(cmd: string, args: string[], opts: { cwd?: string; timeoutMs?: number } = {}): Promise<{ code: number | null; ms: number; out: string }> {
  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(cmd, args, { cwd: opts.cwd ?? process.cwd(), env: process.env });
    let out = "";
    child.stdout.on("data", (chunk) => {
      out += chunk;
    });
    child.stderr.on("data", (chunk) => {
      out += chunk;
    });
    const timer = opts.timeoutMs ? setTimeout(() => child.kill("SIGKILL"), opts.timeoutMs) : null;
    child.on("close", (code) => {
      if (timer) clearTimeout(timer);
      resolve({ code, ms: Date.now() - started, out });
    });
  });
}

async function waitForServer(url: string) {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(url);
      if (res.status < 500) {
        await res.arrayBuffer().catch(() => undefined);
        return;
      }
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`server did not start at ${url}`);
}

async function oneSite(site: Site, root: string, port: number): Promise<Summary> {
  const started = Date.now();
  const dir = path.join(root, site.slug);
  const shots = path.join(dir, "shots");
  const snap = path.join(dir, "snapshot");
  const siteOut = path.join(dir, "site");
  mkdirSync(shots, { recursive: true });
  const notes: string[] = [];
  const summary: Summary = {
    slug: site.slug,
    url: site.url,
    platform: site.platform,
    pages: null,
    routes: [],
    rating: null,
    edgeSsimDesktop: null,
    edgeSsimDesktopFold: null,
    edgeSsimMobile: null,
    textRecall: null,
    heightRatioDesktop: null,
    heightRatioMobile: null,
    wallMs: 0,
    outputBytes: null,
    notes,
  };

  const finish = (error?: string) => {
    summary.wallMs = Date.now() - started;
    if (error) summary.error = error;
    writeFileSync(path.join(dir, "summary.json"), JSON.stringify(summary, null, 2));
    return summary;
  };

  if (!existsSync(path.join(shots, "original-desktop.png")) || !existsSync(path.join(shots, "original-mobile.png"))) {
    const shot = await run("npx", ["tsx", "scripts/harness/shoot.ts", site.url, path.join(shots, "original")], { timeoutMs: 180_000 });
    writeFileSync(path.join(dir, "shoot-original.log"), shot.out);
    if (shot.code !== 0 || !existsSync(path.join(shots, "original-desktop.png"))) {
      return finish(`original screenshot failed (${shot.code})`);
    }
  }

  if (!existsSync(path.join(snap, "manifest.json"))) {
    const maxPages = site.pages ? String(Math.max(10, site.pages.split(",").length)) : "10";
    const args = ["tsx", "scripts/crawl.ts", site.url, `--max-pages=${maxPages}`, `--out=${snap}`, "--delay-ms=1000"];
    if (site.pages) args.push(`--pages=${site.pages}`);
    const crawled = await run("npx", args, { timeoutMs: 600_000 });
    writeFileSync(path.join(dir, "crawl.log"), crawled.out);
    if (crawled.code !== 0 || !existsSync(path.join(snap, "manifest.json"))) {
      return finish(`crawl failed (${crawled.code})`);
    }
  }

  rmSync(siteOut, { recursive: true, force: true });
  let report;
  try {
    report = await buildStaticSite(snap, siteOut);
  } catch (err) {
    return finish(err instanceof Error ? err.message : "static move failed");
  }
  summary.pages = report.pages;
  summary.routes = report.routes;
  summary.outputBytes = report.outputBytes;
  summary.notes.push(...report.notes);

  const server = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], {
    cwd: siteOut,
    stdio: "ignore",
    detached: true,
  });
  const local = `http://127.0.0.1:${port}/`;
  let shotError = "";
  try {
    await waitForServer(local);
    const shot = await run("npx", ["tsx", "scripts/harness/shoot.ts", local, path.join(shots, "static-rebuilt"), "--local"], { timeoutMs: 180_000 });
    writeFileSync(path.join(dir, "shoot-moved.log"), shot.out);
    if (!existsSync(path.join(shots, "static-rebuilt-desktop.png"))) shotError = "moved screenshot failed";
  } catch (err) {
    shotError = err instanceof Error ? err.message : "moved screenshot failed";
  } finally {
    try {
      process.kill(-server.pid!, "SIGKILL");
    } catch {
      try {
        server.kill("SIGKILL");
      } catch {
        /* already gone */
      }
    }
  }
  if (shotError) return finish(shotError);

  const compared = await run(pythonBin(), [path.join(process.cwd(), "scripts/harness/compare.py"), dir, "static"], { timeoutMs: 180_000 });
  writeFileSync(path.join(dir, "compare.log"), compared.out);
  const parityPath = path.join(dir, "static", "parity.json");
  if (!existsSync(parityPath)) return finish(`compare failed (${compared.code})`);
  const parity = JSON.parse(readFileSync(parityPath, "utf8")) as {
    auto_rating?: string;
    text_recall?: number | null;
    desktop?: { edge_ssim_full?: number; edge_ssim_fold?: number; height_ratio?: number };
    mobile?: { edge_ssim_full?: number; height_ratio?: number };
  };
  summary.rating = parity.auto_rating ?? null;
  summary.textRecall = parity.text_recall ?? null;
  summary.edgeSsimDesktop = parity.desktop?.edge_ssim_full ?? null;
  summary.edgeSsimDesktopFold = parity.desktop?.edge_ssim_fold ?? null;
  summary.edgeSsimMobile = parity.mobile?.edge_ssim_full ?? null;
  summary.heightRatioDesktop = parity.desktop?.height_ratio ?? null;
  summary.heightRatioMobile = parity.mobile?.height_ratio ?? null;
  return finish();
}

async function main() {
  const sitesFile = path.resolve(flag("sites", "scripts/harness/sites.tsv"));
  const out = path.resolve(flag("out", "out/parity"));
  const only = flag("only");
  const port = Number(flag("port", "4173"));
  mkdirSync(out, { recursive: true });
  let sites = parseSites(sitesFile);
  if (only) sites = sites.filter((site) => site.slug === only);
  if (!sites.length) {
    console.error("no sites");
    process.exit(2);
  }
  const summaries: Summary[] = [];
  for (const site of sites) {
    console.log(`\n=== ${site.slug} ${site.url}`);
    const summary = await oneSite(site, out, port);
    summaries.push(summary);
    console.log(JSON.stringify({ slug: summary.slug, rating: summary.rating, error: summary.error ?? null, wallMs: summary.wallMs, pages: summary.pages }));
    await new Promise((r) => setTimeout(r, 1000));
  }
  writeFileSync(path.join(out, "results.json"), JSON.stringify({ generatedAt: new Date().toISOString(), sites: summaries }, null, 2));
  const bad = summaries.filter((s) => s.error);
  if (bad.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
