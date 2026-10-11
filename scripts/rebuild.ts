#!/usr/bin/env tsx
/**
 * Eject — AI rebuilder
 * --------------------
 * Reads a crawler snapshot (`scripts/crawl.ts` output) and generates a Next.js
 * project: `app/` pages, `components/` reusable UI, design tokens in
 * `tailwind.config.ts`, and an opinionated default layout.
 *
 * Usage:
 *   pnpm rebuild data/snapshots/<slug>
 *   pnpm rebuild data/snapshots/<slug> --out=out/<slug>
 *
 * Required env: ANTHROPIC_API_KEY
 */

import Anthropic from "@anthropic-ai/sdk";
import { resolveAnthropicModel } from "../lib/model";
import { mkdir, readFile, writeFile, readdir, copyFile } from "node:fs/promises";
import ts from "typescript";
import path from "node:path";

type Manifest = {
  sourceUrl: string;
  platform: string;
  capturedAt: string;
  pageCount: number;
  pages: Array<{ url: string; path: string; title: string; description: string; ogImage?: string }>;
};

type CapturedPage = {
  url: string;
  path: string;
  title: string;
  description: string;
  ogImage?: string;
  html: string;
  clean?: string;
  shots?: { desktop: string[]; mobile: string[] };
};

type PromptContext = { snapshotDir: string; assetMap: Map<string, string>; fontFamilies: string[]; origin: string; rootPrefix: string };

type DesignTokens = {
  colors: string[];
  fontFamilies: string[];
  fontSizes: string[];
  fontWeights: string[];
  spacings: string[];
  radii: string[];
};

function parseArgs(argv: string[]) {
  const positional = argv.filter((a) => !a.startsWith("--"));
  const flags = Object.fromEntries(
    argv
      .filter((a) => a.startsWith("--"))
      .map((a) => {
        const [k, v = "true"] = a.replace(/^--/, "").split("=");
        return [k, v];
      }),
  );
  const snapshot = positional[0];
  if (!snapshot) {
    console.error("usage: pnpm rebuild <snapshot-dir> [--out=path]");
    process.exit(2);
  }
  return {
    snapshot,
    out: String(flags.out ?? snapshot.replace("data/snapshots/", "out/")),
    model: resolveAnthropicModel(typeof flags.model === "string" ? flags.model : undefined),
    maxPages: Number(flags["max-pages"] ?? 10),
    concurrency: Number(flags.concurrency ?? 3),
    dryRun: flags["dry-run"] === "true",
  };
}

/** Start URLs like https://x.wixsite.com/site or https://user.github.io/project/ are served from "/" once rebuilt. */
function stripRoot(p: string, rootPrefix: string): string {
  if (!rootPrefix) return p || "/";
  if (p === rootPrefix || p === rootPrefix + "/") return "/";
  return p.startsWith(rootPrefix + "/") ? p.slice(rootPrefix.length) : p;
}

/** Static sites link to /about.html and /index.html; in Next.js those become /about and / (a route folder named "index.html" breaks the build). */
function normalizeRoute(p: string): string {
  const r = p.replace(/(^|\/)index\.html?$/i, "$1").replace(/\.html?$/i, "");
  return r === "" ? "/" : r.length > 1 ? r.replace(/\/$/, "") : r;
}

function pageRouteFromPath(p: string, rootPrefix = ""): string {
  p = normalizeRoute(stripRoot(p, rootPrefix));
  if (!p || p === "/") return "app/page.tsx";
  const clean = decodeURIComponent(p).replace(/^\//, "").replace(/\/$/, "");
  return `app/${clean}/page.tsx`;
}

function stripHtmlForPrompt(html: string, maxChars = 45_000): string {
  // Fallback for snapshots without a style-annotated DOM (old crawler): drop scripts, styles, svg
  // bodies and comments first so the budget is spent on visible content, not Framer's <head>.
  const body = html.match(/<body[\s\S]*<\/body>/i)?.[0] ?? html;
  const cleaned = body
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "<svg/>")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s(?:data-[\w-]+|class|style|srcset|sizes|loading|decoding)=("[^"]*"|'[^']*')/gi, "")
    .replace(/\s{2,}/g, " ");
  return cleaned.length > maxChars ? cleaned.slice(0, maxChars) + "\n<!-- truncated -->" : cleaned;
}

const SYSTEM_PROMPT = `You are Eject's rebuild engine. You convert one captured page from a no-code platform (Framer, Webflow, Wix, Squarespace, or plain HTML) into a clean Next.js 15 App Router page using TypeScript and Tailwind CSS, matching the original design as closely as possible.

You are given: (1) screenshots of the original (desktop slices, then a mobile view), (2) a compact DOM of the rendered page where each element's "s" attribute lists the computed styles that matter (color, font-family/size/weight/line-height/letter-spacing, bg, display/dir/justify/align/gap/pad, w/h in px at a 1440px desktop viewport, border/radius, pos). Use the DOM for exact values and the screenshots to judge the look and the mobile layout.

Output only one TSX file. No prose, no markdown fences. The file must:
- Start with: export const metadata = { title: "...", description: "..." };  then a default-exported component (async not required).
- Use only Tailwind classes, including arbitrary values (text-[18px], bg-[#151515], gap-[24px], leading-[1.32], tracking-[-0.01em], w-[400px], font-['Syne']). No inline style objects, no styled-jsx.
- Reproduce the layout: same section order, same alignment, spacing, colors, type sizes and weights, border radii, image sizes. Where the DOM says w:400 on a centered column, build a centered max-w-[400px] column.
- Be responsive: match the desktop layout at md and up; use the mobile screenshot for the base (mobile-first) layout. Convert fixed pixel widths to max-w-[..] w-full where they would overflow a 390px screen.
- Use a plain <img> (not next/image) with the given src, alt and explicit size classes. Image src values that start with /assets/ are local copies: keep them exactly. Use object-cover where the DOM says fit:cover. Background images (bg-img:) become bg-[url('/assets/...')] bg-cover bg-center.
- Fonts: the page already loads these @font-face families: FONTS. Use them via font-['Family'] exactly as in the DOM. Do not import fonts.
- Preserve the visible copy verbatim: do not invent, summarize, reorder or translate. Include every text block, link label and button label that appears in the DOM.
- Preserve link destinations. Links to the original site's own pages are already relative paths: keep them. Keep external links and mailto:/tel: as they are.
- Semantic HTML: header, nav, main, section, footer, h1-h3, p, ul. Keep one h1.
- Forms: keep the fields, labels and button text; use <form> without a server action (add a data-eject-form attribute).
- Drop platform badges ("Made in Framer", "Created with Wix") and animation-only wrappers. No scripts, analytics, TODOs or lorem ipsum.
- If the page has repeating cards or items, define a typed array constant at the top and map over it.
- Under 900 lines.`;

// USD per million tokens, from https://docs.anthropic.com/en/docs/about-claude/pricing (checked 2026-10-10).
const PRICING_USD_PER_MTOK: Record<string, { in: number; out: number }> = {
  "claude-sonnet-5-5": { in: 2, out: 10 },
  "claude-sonnet-5": { in: 2, out: 10 },
  "claude-sonnet-4-5-20250929": { in: 3, out: 15 },
  "claude-sonnet-4-6": { in: 3, out: 15 },
  "claude-haiku-4-5-20251001": { in: 1, out: 5 },
  "claude-haiku-5-5": { in: 0.1, out: 0.5 },
  "claude-opus-4-8": { in: 5, out: 25 },
};

type UsageRow = {
  path: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  ms: number;
  stopReason: string | null;
};

function costOf(model: string, inTok: number, outTok: number): number {
  const p = PRICING_USD_PER_MTOK[model];
  if (!p) return 0;
  return (inTok * p.in + outTok * p.out) / 1_000_000;
}

function rewriteAssets(text: string, ctx: PromptContext): string {
  let out = text;
  for (const [url, file] of ctx.assetMap) {
    if (out.includes(url)) out = out.split(url).join(`/assets/${file}`);
  }
  // same-origin page links -> relative routes (and drop a site-root prefix such as /grove-oasis)
  const esc = ctx.origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  out = out.replace(new RegExp(`href="(?:${esc})?(/[^"#]*)?(#[^"]*)?"`, "g"), (whole, p1: string | undefined, p2?: string) => {
    if (!whole.includes(ctx.origin) && !(p1 ?? "").startsWith("/")) return whole;
    const rel = normalizeRoute(stripRoot((p1 ?? "/").replace(/(.)\/$/, "$1"), ctx.rootPrefix));
    return `href="${rel}${p2 ?? ""}"`;
  });
  return out;
}

async function imageBlocks(ctx: PromptContext, page: CapturedPage): Promise<Anthropic.ImageBlockParam[]> {
  const names = [...(page.shots?.desktop ?? []).slice(0, 3), ...(page.shots?.mobile ?? []).slice(0, 1)];
  const blocks: Anthropic.ImageBlockParam[] = [];
  for (const n of names) {
    try {
      const data = await readFile(path.join(ctx.snapshotDir, "shots", n));
      blocks.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: data.toString("base64") } });
    } catch {
      /* screenshot missing */
    }
  }
  return blocks;
}

function syntaxErrors(code: string): string[] {
  const out = ts.transpileModule(code, { reportDiagnostics: true, compilerOptions: { jsx: ts.JsxEmit.Preserve, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } });
  return (out.diagnostics ?? []).slice(0, 5).map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n"));
}

function stripFences(text: string): string {
  return text.replace(/^```(?:tsx|ts|jsx)?\s*/i, "").replace(/```\s*$/, "").trim();
}

async function rebuildPage(
  client: Anthropic,
  model: string,
  ctx: PromptContext,
  page: CapturedPage,
  tokens: DesignTokens | null,
  usageRows: UsageRow[],
): Promise<string> {
  const tokenSummary = tokens
    ? `Design tokens seen on the site: colors ${tokens.colors.slice(0, 8).join(", ")}; fonts ${tokens.fontFamilies.slice(0, 3).join(" | ")}.`
    : "";
  const dom = rewriteAssets(page.clean && page.clean.length > 200 ? page.clean.slice(0, 80_000) : stripHtmlForPrompt(page.html), ctx);
  const images = await imageBlocks(ctx, page);
  const system = SYSTEM_PROMPT.replace("FONTS", ctx.fontFamilies.length ? ctx.fontFamilies.join(", ") : "(none captured; use Tailwind font-sans/font-serif)");
  const userText = `Rebuild this page.

Route: ${page.path === "/" ? "/" : page.path}
Title: ${page.title}
Description: ${page.description}
${tokenSummary}
${images.length ? `Screenshots attached: ${page.shots?.desktop.slice(0, 3).length ?? 0} desktop slice(s) (1440px wide, top to bottom, 1400px each), then ${page.shots?.mobile.slice(0, 1).length ?? 0} mobile view (390px).` : "No screenshots available."}

Compact DOM of the rendered page (desktop 1440px):

${dom}

Return only the .tsx file contents.`;

  const messages: Anthropic.MessageParam[] = [{ role: "user", content: [...images, { type: "text", text: userText }] }];
  let code = "";
  let lastErr = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const started = Date.now();
    const resp = await client.messages.create({
      model,
      max_tokens: attempt === 0 ? 12_000 : 16_000,
      system,
      messages,
    });
    usageRows.push({
      path: page.path + (attempt ? " (retry)" : ""),
      inputTokens: resp.usage.input_tokens,
      outputTokens: resp.usage.output_tokens,
      costUsd: costOf(model, resp.usage.input_tokens, resp.usage.output_tokens),
      ms: Date.now() - started,
      stopReason: resp.stop_reason,
    });
    const text = resp.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    code = stripFences(text);
    const errs = resp.stop_reason === "max_tokens" ? ["output was cut off at max_tokens"] : syntaxErrors(code);
    if (!errs.length && /export\s+default/.test(code)) return code;
    lastErr = errs.join("; ") || "no default export";
    messages.push({ role: "assistant", content: text }, { role: "user", content: `That file has a problem: ${lastErr}. Return the complete corrected .tsx file only, shorter if needed (merge repeated markup into a mapped array).` });
  }
  throw new Error(`page ${page.path} failed validation after retry: ${lastErr}`);
}

async function rebuild() {
  const args = parseArgs(process.argv.slice(2));
  const apiKey = process.env.ANTHROPIC_API_KEY ?? (args.dryRun ? "dry-run" : undefined);
  if (!apiKey) {
    console.error("error: ANTHROPIC_API_KEY is required");
    process.exit(1);
  }

  const manifestRaw = await readFile(path.join(args.snapshot, "manifest.json"), "utf8");
  const manifest: Manifest = JSON.parse(manifestRaw);

  let tokens: DesignTokens | null = null;
  try {
    tokens = JSON.parse(await readFile(path.join(args.snapshot, "design-tokens.json"), "utf8"));
  } catch {
    /* optional */
  }

  console.log(`→ rebuilding ${manifest.sourceUrl}`);
  console.log(`  platform:  ${manifest.platform}`);
  console.log(`  pages:     ${Math.min(manifest.pages.length, args.maxPages)} of ${manifest.pages.length}`);
  console.log(`  output:    ${args.out}`);

  const client = new Anthropic({ apiKey });

  await mkdir(path.join(args.out, "app"), { recursive: true });
  await mkdir(path.join(args.out, "components"), { recursive: true });

  const pageFiles = await readdir(path.join(args.snapshot, "pages"));
  const usageRows: UsageRow[] = [];
  const failures: Array<{ path: string; error: string }> = [];
  const capUsd = Number(process.env.EJECT_REBUILD_SPEND_CAP_USD ?? 5);

  // Local asset + font context from the crawler (absent on snapshots from the old crawler).
  const assetMap = new Map<string, string>();
  try {
    const idx = JSON.parse(await readFile(path.join(args.snapshot, "assets.json"), "utf8")) as { items: Array<{ url: string; file: string }> };
    for (const it of idx.items) assetMap.set(it.url, it.file);
  } catch {
    /* no assets.json */
  }
  let fontsCss = "";
  try {
    fontsCss = await readFile(path.join(args.snapshot, "fonts.css"), "utf8");
  } catch {
    /* no fonts.css */
  }
  const fontFamilies = Array.from(new Set([...fontsCss.matchAll(/font-family:\s*["']?([^;"']+)["']?/gi)].map((m) => m[1]!.trim()))).filter((f) => !/placeholder|fallback/i.test(f));
  // If the start URL is a sub-path that owns every other crawled page (Wix sites, GitHub Pages project
  // sites) or the only page, it becomes "/" in the rebuilt site.
  const firstPath = (manifest.pages[0]?.path ?? "/").replace(/\/$/, "");
  const owns = firstPath !== "" && manifest.pages.slice(1).every((p) => p.path.startsWith(firstPath + "/"));
  const ctx: PromptContext = { snapshotDir: args.snapshot, assetMap, fontFamilies, origin: new URL(manifest.sourceUrl).origin, rootPrefix: owns ? firstPath : "" };

  // pages that normalise to the same route (/ and /index.html) are rebuilt once
  const seenRoutes = new Set<string>();
  const todo = manifest.pages.filter((pg) => { const r = pageRouteFromPath(pg.path, ctx.rootPrefix); if (seenRoutes.has(r)) return false; seenRoutes.add(r); return true; }).slice(0, args.maxPages);
  let next = 0;
  async function worker() {
    while (next < todo.length) {
      const i = next++;
      const pageMeta = todo[i]!;
      const filename = (pageMeta.path === "/" ? "_root" : pageMeta.path.replace(/^\//, "").replace(/\//g, "__")) + ".json";
      const match = pageFiles.find((f) => f === filename);
      if (!match) {
        console.warn(`  ! no page file for ${pageMeta.path}`);
        failures.push({ path: pageMeta.path, error: "no page file" });
        continue;
      }
      const captured: CapturedPage = JSON.parse(await readFile(path.join(args.snapshot, "pages", match), "utf8"));
      console.log(`  · ${i + 1}/${todo.length}  ${captured.path}`);
      try {
        if (usageRows.reduce((n, r) => n + r.costUsd, 0) > capUsd) throw new Error(`spend cap $${capUsd} reached`);
        // --dry-run: no model call. Writes a stub page so scaffolding (assets, fonts, config, build) can be tested for free.
        const tsx = args.dryRun
          ? `export const metadata = { title: ${JSON.stringify(captured.title)} };\nexport default function Page() {\n  return <main><h1>${captured.title.replace(/[<>{}]/g, "")}</h1><p>dry-run stub</p></main>;\n}\n`
          : await rebuildPage(client, args.model, ctx, captured, tokens, usageRows);
        const filePath = path.join(args.out, pageRouteFromPath(captured.path, ctx.rootPrefix));
        await mkdir(path.dirname(filePath), { recursive: true });
        await writeFile(filePath, tsx, "utf8");
      } catch (err) {
        console.warn(`    ! rebuild failed: ${(err as Error).message}`);
        failures.push({ path: captured.path, error: (err as Error).message.slice(0, 300) });
      }
    }
  }
  const t0 = Date.now();
  await Promise.all(Array.from({ length: Math.max(1, Math.min(args.concurrency, todo.length)) }, () => worker()));
  const rebuiltPages = todo.length - failures.length;
  console.log(`  model time: ${((Date.now() - t0) / 1000).toFixed(1)}s, ${rebuiltPages}/${todo.length} pages`);

  // Local copies of every pulled asset, plus the @font-face rules that point at them.
  await mkdir(path.join(args.out, "public", "assets"), { recursive: true });
  for (const file of new Set(assetMap.values())) {
    await copyFile(path.join(args.snapshot, "assets", file), path.join(args.out, "public", "assets", file)).catch(() => undefined);
  }
  await writeFile(path.join(args.out, "app", "fonts.css"), fontsCss, "utf8");

  await writeFile(
    path.join(args.out, "usage.json"),
    JSON.stringify(
      {
        model: args.model,
        inputTokens: usageRows.reduce((n, r) => n + r.inputTokens, 0),
        outputTokens: usageRows.reduce((n, r) => n + r.outputTokens, 0),
        costUsd: usageRows.reduce((n, r) => n + r.costUsd, 0),
        pagesRequested: todo.length,
        pagesRebuilt: rebuiltPages,
        failures,
        rows: usageRows,
      },
      null,
      2,
    ),
    "utf8",
  );

  // Emit a minimal package.json + tailwind config + layout so the output is runnable.
  await writeFile(
    path.join(args.out, "package.json"),
    JSON.stringify(
      {
        name: `eject-out-${new URL(manifest.sourceUrl).hostname.replace(/[^a-z0-9]+/gi, "-")}`,
        private: true,
        scripts: { dev: "next dev", build: "next build", start: "next start" },
        dependencies: {
          next: "15.1.3",
          react: "^19.0.0",
          "react-dom": "^19.0.0",
        },
        devDependencies: {
          "@types/node": "^22.10.5",
          "@types/react": "^19.0.2",
          "@types/react-dom": "^19.0.2",
          autoprefixer: "^10.4.20",
          postcss: "^8.4.49",
          tailwindcss: "^3.4.17",
          typescript: "^5.7.2",
        },
      },
      null,
      2,
    ),
    "utf8",
  );

  const tailwindColors =
    tokens?.colors.slice(0, 8).reduce<Record<string, string>>((acc, c, i) => {
      acc[`brand${i + 1}`] = c;
      return acc;
    }, {}) ?? {};

  await writeFile(
    path.join(args.out, "tailwind.config.ts"),
    `import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: { colors: ${JSON.stringify(tailwindColors, null, 2)} } },
  plugins: [],
};
export default config;
`,
    "utf8",
  );

  await writeFile(
    path.join(args.out, "app", "globals.css"),
    `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`,
    "utf8",
  );

  await writeFile(
    path.join(args.out, "app", "layout.tsx"),
    `import "./globals.css";
import "./fonts.css";
export const metadata = { title: ${JSON.stringify(manifest.pages[0]?.title ?? "Site")} };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body>{children}</body></html>
  );
}
`,
    "utf8",
  );

  await writeFile(path.join(args.out, "next.config.mjs"), `/** @type {import('next').NextConfig} */\nconst nextConfig = { reactStrictMode: true, images: { unoptimized: true } };\nexport default nextConfig;\n`, "utf8");
  await writeFile(path.join(args.out, "postcss.config.mjs"), `export default { plugins: { tailwindcss: {}, autoprefixer: {} } };\n`, "utf8");
  await writeFile(
    path.join(args.out, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: { target: "ES2017", lib: ["dom", "dom.iterable", "esnext"], allowJs: true, skipLibCheck: true, strict: false, noEmit: true, esModuleInterop: true, module: "esnext", moduleResolution: "bundler", resolveJsonModule: true, isolatedModules: true, jsx: "preserve", incremental: true, plugins: [{ name: "next" }] },
        include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
        exclude: ["node_modules"],
      },
      null,
      2,
    ),
    "utf8",
  );
  await writeFile(path.join(args.out, ".gitignore"), "node_modules\n.next\n", "utf8");

  await writeFile(
    path.join(args.out, "README.md"),
    `# ${manifest.sourceUrl}\n\nMigrated by Eject from \`${manifest.platform}\` on ${manifest.capturedAt}.\n\n## Run\n\n\`\`\`\npnpm install\npnpm dev\n\`\`\`\n\n## Deploy\n\nConnect this repo to Cloudflare Pages or Vercel. Both work zero-config.\n`,
    "utf8",
  );

  if (rebuiltPages === 0) {
    console.error(`error: 0 of ${todo.length} pages were rebuilt (${failures[0]?.error ?? "no pages in snapshot"})`);
    process.exit(4);
  }
  console.log(`\n✓ rebuilt ${rebuiltPages}/${todo.length} pages → ${args.out}`);
  console.log(`\nNext steps:\n  cd ${args.out}\n  pnpm install\n  pnpm dev\n`);
}

rebuild().catch((err) => {
  const message = err instanceof Error ? err.message : "rebuild failed";
  console.error(message.replace(/sk-[A-Za-z0-9_-]{8,}/g, "[redacted]"));
  process.exit(1);
});
