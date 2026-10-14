/**
 * Build a self-contained static site from a crawler snapshot.
 * No model and no network. The snapshot's rendered HTML, stylesheets,
 * images, and fonts are the site.
 */

import { mkdir, readFile, writeFile, copyFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { lightweightEditorScript, staticAgentsMarkdown, staticHostingReadme } from "./editor-guide";
import {
  ENTRANCE_CSS,
  assetHref,
  buildPageHtml,
  lookupAsset,
  normalizeLocalRoute,
  outputFileForRoute,
  resolutionBase,
  rewriteCssUrls,
  rewriteStylesheet,
  rootPrefixFor,
  type AssetMap,
  type FormNote,
} from "./static-html";

type Manifest = {
  sourceUrl: string;
  platform: string;
  capturedAt: string;
  pageCount: number;
  pages: Array<{ url: string; path: string; title: string; description?: string }>;
};

type AssetItem = { url: string; file: string };
type StyleItem = { url: string; file: string };

export type StaticMoveReport = {
  sourceUrl: string;
  platform: string;
  capturedAt: string;
  pages: number;
  routes: string[];
  outputBytes: number;
  forms: FormNote[];
  videos: number;
  audios: number;
  iframes: number;
  embeds: string[];
  scriptsRemoved: number;
  stylesheets: number;
  hotlinkedStylesheets: number;
  assetsCopied: number;
  missingAssetFiles: number;
  notes: string[];
  elapsedMs: number;
};

async function readJson<T>(file: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(file, "utf8")) as T;
  } catch {
    return null;
  }
}

function pageFilename(pagePath: string): string {
  return `${pagePath === "/" ? "_root" : pagePath.replace(/^\//, "").replace(/\//g, "__")}.json`;
}

async function dirBytes(dir: string): Promise<number> {
  if (!existsSync(dir)) return 0;
  let total = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) total += await dirBytes(full);
    else total += (await stat(full)).size;
  }
  return total;
}

function dedupeNotes(notes: string[]): string[] {
  return [...new Set(notes.filter(Boolean))];
}

export async function buildStaticSite(snapshotDir: string, outDir: string, opts: { noindex?: boolean } = {}): Promise<StaticMoveReport> {
  const started = Date.now();
  const manifest = await readJson<Manifest>(path.join(snapshotDir, "manifest.json"));
  if (!manifest?.pages?.length) throw new Error(`no pages in ${snapshotDir}`);

  const assetItems = (await readJson<{ items?: AssetItem[] }>(path.join(snapshotDir, "assets.json")))?.items ?? [];
  const styleItems = (await readJson<StyleItem[]>(path.join(snapshotDir, "stylesheets.json"))) ?? [];
  const assets: AssetMap = new Map();
  for (const item of [...assetItems, ...styleItems]) {
    if (item?.url && item.file) assets.set(item.url, item.file);
  }

  const paths = manifest.pages.map((page) => page.path || "/");
  const rootPrefix = rootPrefixFor(paths);
  const origin = new URL(manifest.sourceUrl).origin;
  const routes = new Set(paths.map((p) => normalizeLocalRoute(p, rootPrefix)));

  await mkdir(path.join(outDir, "assets"), { recursive: true });
  await mkdir(path.join(outDir, "scripts"), { recursive: true });
  await mkdir(path.join(outDir, "edits"), { recursive: true });

  const copied = new Set<string>();
  let missingAssetFiles = 0;
  for (const item of assetItems) {
    if (!item.file || copied.has(item.file)) continue;
    copied.add(item.file);
    const from = path.join(snapshotDir, "assets", item.file);
    if (!existsSync(from)) {
      missingAssetFiles += 1;
      continue;
    }
    await copyFile(from, path.join(outDir, "assets", item.file));
  }

  const styleFiles = new Map<string, string>();
  for (const item of styleItems) {
    if (!item.file || styleFiles.has(item.file)) continue;
    styleFiles.set(item.file, item.url);
  }
  let hotlinkedStylesheets = 0;
  for (const [file, sheetUrl] of styleFiles) {
    const from = path.join(snapshotDir, "styles", file);
    if (!existsSync(from)) {
      missingAssetFiles += 1;
      hotlinkedStylesheets += 1;
      continue;
    }
    const css = rewriteStylesheet(await readFile(from, "utf8"), sheetUrl, assets);
    if (/url\(\s*['"]?https?:/i.test(css)) hotlinkedStylesheets += 1;
    await writeFile(path.join(outDir, "assets", file), css, "utf8");
    copied.add(file);
  }

  let fontsCss = "";
  try {
    fontsCss = await readFile(path.join(snapshotDir, "fonts.css"), "utf8");
  } catch {
    fontsCss = "";
  }
  const fontsRewritten = fontsCss
    .replace(/url\(\s*['"]?\/assets\/([^'")]+)['"]?\s*\)/gi, 'url("$1")')
    .trim();
  if (fontsRewritten) {
    await writeFile(path.join(outDir, "assets", "fonts.css"), `${fontsRewritten}\n`, "utf8");
  }
  await writeFile(path.join(outDir, "assets", "eject-static.css"), ENTRANCE_CSS, "utf8");

  const forms: FormNote[] = [];
  const embeds = new Set<string>();
  let scriptsRemoved = 0;
  let videos = 0;
  let audios = 0;
  let iframes = 0;
  const writtenRoutes: string[] = [];
  const seen = new Set<string>();
  const notes: string[] = [];

  for (const page of manifest.pages) {
    const route = normalizeLocalRoute(page.path || "/", rootPrefix);
    if (seen.has(route)) continue;
    seen.add(route);
    const filename = pageFilename(page.path || "/");
    const pagePath = path.join(snapshotDir, "pages", filename);
    if (!existsSync(pagePath)) {
      notes.push(`Missing capture for ${page.path}.`);
      continue;
    }
    const captured = JSON.parse(await readFile(pagePath, "utf8")) as { html?: string; url?: string; baseUrl?: string; adoptedCss?: string };
    if (!captured.html) {
      notes.push(`Empty HTML for ${page.path}.`);
      continue;
    }
    const pageUrl = captured.baseUrl || resolutionBase(captured.url || page.url);
    let adoptedCss = "";
    if (captured.adoptedCss) {
      try {
        adoptedCss = await readFile(path.join(snapshotDir, "css", captured.adoptedCss), "utf8");
      } catch {
        adoptedCss = "";
      }
      adoptedCss = rewriteCssUrls(adoptedCss, (raw) => {
        const file = lookupAsset(assets, raw, pageUrl);
        return file ? assetHref(file, route) : null;
      });
    }
    const extraHead = fontsRewritten ? `<link rel="stylesheet" href="${assetHref("fonts.css", route)}">` : "";
    const built = buildPageHtml({
      html: captured.html,
      ctx: { pageUrl, pageRoute: route, origin, rootPrefix, routes },
      assets,
      adoptedCss,
      extraHead,
      noindex: opts.noindex,
    });
    const dest = path.join(outDir, outputFileForRoute(route));
    await mkdir(path.dirname(dest), { recursive: true });
    await writeFile(dest, built.html, "utf8");
    writtenRoutes.push(route);
    forms.push(...built.forms);
    scriptsRemoved += built.scriptsRemoved;
    videos += built.videos;
    audios += built.audios;
    iframes += built.iframes;
    for (const host of built.embeds) embeds.add(host);
  }

  if (writtenRoutes.length === 0) throw new Error("static move wrote 0 pages");

  if (forms.length) {
    const noun = forms.length === 1 ? "form" : "forms";
    const pronoun = forms.length === 1 ? "it does" : "they do";
    notes.push(
      `${forms.length} ${noun} flagged data-eject-form="needs-endpoint". The action is "#" and native submit is blocked, so ${pronoun} not post to the previous host. Original actions are listed below.`,
    );
  }
  if (videos) notes.push(`${videos} video element${videos === 1 ? "" : "s"} left pointing at the original host. Video files are not copied.`);
  if (audios) notes.push(`${audios} audio element${audios === 1 ? "" : "s"} left pointing at the original host.`);
  if (iframes) notes.push(`${iframes} iframe${iframes === 1 ? "" : "s"} kept. Third-party embeds still load from ${[...embeds].slice(0, 6).join(", ") || "their original hosts"}.`);
  if (scriptsRemoved) notes.push(`${scriptsRemoved} runtime script${scriptsRemoved === 1 ? "" : "s"} removed (analytics and platform JS). CSS animations that do not need that JS still run. Scroll-triggered and menu JS does not.`);
  if (hotlinkedStylesheets) notes.push(`${hotlinkedStylesheets} stylesheet${hotlinkedStylesheets === 1 ? "" : "s"} still reference a remote url() or were not in the snapshot.`);
  if (missingAssetFiles) notes.push(`${missingAssetFiles} asset file${missingAssetFiles === 1 ? "" : "s"} listed in the snapshot were missing on disk.`);
  notes.push("Entrance animations that waited for the platform runtime are flattened so the captured layout stays visible.");
  notes.push("Internal links between captured pages are relative. Links to pages that were not captured stay on the original site.");

  const capturedAt = manifest.capturedAt || new Date().toISOString();
  await writeFile(path.join(outDir, "AGENTS.md"), staticAgentsMarkdown(), "utf8");
  await writeFile(
    path.join(outDir, "README.md"),
    staticHostingReadme({ sourceUrl: manifest.sourceUrl, platform: manifest.platform || "unknown", capturedAt, formCount: forms.length }),
    "utf8",
  );
  await writeFile(path.join(outDir, "scripts", "chat-edit.mjs"), lightweightEditorScript(), "utf8");
  await writeFile(
    path.join(outDir, "edits", "inbox.md"),
    "# Edit inbox\n\nQueued notes from `node scripts/chat-edit.mjs` appear below. Apply the oldest one first.\n",
    "utf8",
  );
  const migration = `# Migration notes

Source: ${manifest.sourceUrl}
Platform: ${manifest.platform || "unknown"}
Captured: ${capturedAt}
Pages: ${writtenRoutes.join(", ")}

${dedupeNotes(notes).map((note) => `- ${note}`).join("\n")}
${forms.length ? `\n## Forms\n\n${forms.map((form) => `- \`${form.pageRoute}\` action \`${form.action || "(none)"}\``).join("\n")}\n` : ""}
`;
  await writeFile(path.join(outDir, "MIGRATION.md"), migration, "utf8");

  const outputBytes = await dirBytes(outDir);
  const report: StaticMoveReport = {
    sourceUrl: manifest.sourceUrl,
    platform: manifest.platform || "unknown",
    capturedAt,
    pages: writtenRoutes.length,
    routes: writtenRoutes,
    outputBytes,
    forms,
    videos,
    audios,
    iframes,
    embeds: [...embeds],
    scriptsRemoved,
    stylesheets: styleFiles.size,
    hotlinkedStylesheets,
    assetsCopied: copied.size,
    missingAssetFiles,
    notes: dedupeNotes(notes),
    elapsedMs: Date.now() - started,
  };
  await writeFile(path.join(outDir, "move.json"), JSON.stringify(report, null, 2), "utf8");
  return report;
}
