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
import { mkdir, readFile, writeFile, readdir } from "node:fs/promises";
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
};

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
    model: String(flags.model ?? "claude-sonnet-4-5-20250929"),
    maxPages: Number(flags["max-pages"] ?? 10),
  };
}

function pageRouteFromPath(p: string): string {
  if (!p || p === "/") return "app/page.tsx";
  const clean = p.replace(/^\//, "").replace(/\/$/, "");
  return `app/${clean}/page.tsx`;
}

function trimHtmlForPrompt(html: string, maxChars = 40_000): string {
  if (html.length <= maxChars) return html;
  // Keep head + first half of body so the model still sees structure.
  const headEnd = html.indexOf("</head>") + "</head>".length;
  const head = html.slice(0, Math.max(headEnd, 0));
  const remaining = maxChars - head.length;
  return head + html.slice(headEnd, headEnd + Math.max(0, remaining)) + "\n<!-- truncated -->";
}

const SYSTEM_PROMPT = `You are Eject's rebuild engine. You convert a captured page from a no-code platform into a clean Next.js 15 App Router page using TypeScript and Tailwind CSS.

Output only one TSX file. No prose, no markdown fences, no explanations. The file must:

- Be a default-exported async function component named after the route
- Use only Tailwind classes (no inline styles, no styled-jsx)
- Use semantic HTML: header, nav, main, section, article, footer
- Replace platform-specific markup (Framer canvas divs, Webflow class names, Wix shells) with idiomatic React + Tailwind
- Preserve the visible copy verbatim — do not invent, summarize, or translate
- Preserve link destinations
- Include images as <Image> from "next/image" when src is absolute, otherwise as <img> with width/height
- Default to the project's design tokens passed in the prompt
- Be production-ready: no TODOs, no \`// ...\`, no placeholder lorem
- Be under 800 lines. If a page is huge, factor reusable sections into local components in the same file
- Never include API keys, analytics tags, or third-party scripts unless present in the source

If the source page has CMS-style repeating content (cards, posts, items), build it as a typed array constant at the top of the file and map over it in JSX.`;

async function rebuildPage(
  client: Anthropic,
  model: string,
  snapshotDir: string,
  page: CapturedPage,
  tokens: DesignTokens | null,
): Promise<string> {
  const tokenSummary = tokens
    ? `Design tokens (use these on the rebuild):
- Colors: ${tokens.colors.slice(0, 8).join(", ")}
- Fonts: ${tokens.fontFamilies.slice(0, 3).join(", ")}
- Font sizes: ${tokens.fontSizes.slice(0, 6).join(", ")}
- Radii: ${tokens.radii.slice(0, 4).join(", ")}`
    : "No design tokens captured — use sensible Tailwind defaults.";

  const userMessage = `Rebuild this page as a Next.js 15 + Tailwind component.

Route: ${page.path === "/" ? "/" : page.path}
Title: ${page.title}
Description: ${page.description}

${tokenSummary}

Original captured HTML (truncated if needed):

\`\`\`html
${trimHtmlForPrompt(page.html)}
\`\`\`

Return only the .tsx file contents.`;

  const resp = await client.messages.create({
    model,
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  // Strip any accidental code fences.
  return text.replace(/^```(?:tsx|ts)?\s*/i, "").replace(/```$/, "").trim();
}

async function rebuild() {
  const args = parseArgs(process.argv.slice(2));
  const apiKey = process.env.ANTHROPIC_API_KEY;
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

  for (const [i, pageMeta] of manifest.pages.slice(0, args.maxPages).entries()) {
    const filename = (pageMeta.path === "/" ? "_root" : pageMeta.path.replace(/^\//, "").replace(/\//g, "__")) + ".json";
    const match = pageFiles.find((f) => f === filename);
    if (!match) {
      console.warn(`  ! no page file for ${pageMeta.path}`);
      continue;
    }
    const captured: CapturedPage = JSON.parse(await readFile(path.join(args.snapshot, "pages", match), "utf8"));

    console.log(`  · ${i + 1}/${args.maxPages}  ${captured.path}`);
    let tsx: string;
    try {
      tsx = await rebuildPage(client, args.model, args.snapshot, captured, tokens);
    } catch (err) {
      console.warn(`    ! rebuild failed: ${(err as Error).message}`);
      continue;
    }
    const route = pageRouteFromPath(captured.path);
    const filePath = path.join(args.out, route);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, tsx, "utf8");
  }

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
export const metadata = { title: ${JSON.stringify(manifest.pages[0]?.title ?? "Site")} };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body>{children}</body></html>
  );
}
`,
    "utf8",
  );

  await writeFile(
    path.join(args.out, "README.md"),
    `# ${manifest.sourceUrl}\n\nMigrated by Eject from \`${manifest.platform}\` on ${manifest.capturedAt}.\n\n## Run\n\n\`\`\`\npnpm install\npnpm dev\n\`\`\`\n\n## Deploy\n\nConnect this repo to Cloudflare Pages or Vercel. Both work zero-config.\n`,
    "utf8",
  );

  console.log(`\n✓ rebuilt ${manifest.pageCount} pages → ${args.out}`);
  console.log(`\nNext steps:\n  cd ${args.out}\n  pnpm install\n  pnpm dev\n`);
}

rebuild().catch((err) => {
  console.error(err);
  process.exit(1);
});
