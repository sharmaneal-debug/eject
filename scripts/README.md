# Eject scripts

Three production scripts: `crawl`, `rebuild`, `audit`.

## `pnpm crawl <url>`

Walks every internal link of the URL with Playwright. Captures rendered DOM, meta tags, image / link / font lists, and design tokens (colors, fonts, sizes, radii). Output goes to `data/snapshots/<hostname>/`.

```
pnpm crawl https://example.com --max-pages=20
```

Outputs:
- `manifest.json` — site overview + per-page summary
- `pages/*.json` — full captured HTML per page
- `design-tokens.json` — extracted design system

## `pnpm rebuild <snapshot-dir>`

Reads a crawler snapshot and uses Claude to regenerate each page as Next.js + Tailwind. Output goes to `out/<hostname>/` and is a runnable Next.js project (with `package.json`, `app/layout.tsx`, `tailwind.config.ts`).

```
ANTHROPIC_API_KEY=sk-... pnpm rebuild data/snapshots/example-com
cd out/example-com
pnpm install
pnpm dev
```

Notes:
- Defaults to `claude-sonnet-4-5-20250929`. Override with `--model=...`.
- Capped at 10 pages per run by default (`--max-pages=...` to override).
- Each page becomes a standalone TSX file; reusable layout is the operator's responsibility post-rebuild.

## `pnpm audit <url>`

For outbound prospects. Computes platform, Lighthouse performance score, estimated annual cost, CMS item count. Appends one JSON line per URL to `data/audits/{date}.jsonl`.

```
pnpm audit https://prospect.com
pnpm audit --batch=data/prospects/2026-05-02.csv
```

Used by the cold-email engine as the source of truth for `{{annual_cost_estimate}}` / `{{lighthouse_score}}` / `{{cms_item_count}}` merge tokens.
