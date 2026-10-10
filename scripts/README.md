# Eject scripts

Operator scripts: `crawl`, `rebuild`, `site-audit`, `orders`, `deliver`, `editor`, `setup-stripe`.

## `pnpm crawl <url>`

Walks every internal link of the URL with Playwright. Captures rendered DOM, meta tags, image / link / font lists, and design tokens (colors, fonts, sizes, radii). Output goes to `data/snapshots/<hostname>/`. The start URL is checked before the browser launches (public http(s) only, and robots.txt). A crawl that saves zero pages exits with code 3. `--pages=/a,/b` captures only those paths.

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
ANTHROPIC_API_KEY from the environment, then: pnpm rebuild data/snapshots/example-com
cd out/example-com
pnpm install
pnpm dev
```

Notes:
- Model comes from `--model` or `ANTHROPIC_MODEL`. If neither is set, the script uses its current default. The key is read from `ANTHROPIC_API_KEY` and is not printed.
- Capped at 10 pages per run by default (`--max-pages=...` to override).
- Each page becomes a standalone TSX file; reusable layout is the operator's responsibility post-rebuild.

## `pnpm site-audit <url>`

For outbound prospects. Computes platform, Lighthouse performance score, estimated annual cost, CMS item count. Appends one JSON line per URL to `data/audits/{date}.jsonl`.

The npm script is `site-audit` so `pnpm audit` stays pnpm's own vulnerability audit.

```
pnpm site-audit https://prospect.com
pnpm site-audit --batch=data/prospects/2026-05-02.csv
```

Used by the cold-email engine as the source of truth for `{{annual_cost_estimate}}` / `{{lighthouse_score}}` / `{{cms_item_count}}` merge tokens.

## `pnpm orders`

Prints orders from the configured store: id, status, tier, amount, eligibility, referral, page count, and cost-to-serve. Tokens and email addresses are omitted.

## `pnpm deliver <orderId>`

Writes `out/orders/<orderId>/` from the stored delivery packet (README, AGENTS.md, EDITING.md, and `scripts/chat-edit.mjs`). Does not call a model.

`pnpm deliver <orderId> --rebuild` also runs `pnpm crawl` and `pnpm rebuild` when `ANTHROPIC_API_KEY` is set. Without that key it writes the snapshot and stops.

## `pnpm setup-stripe`

Create-or-lookup Stripe **test mode** products for the $99 automated price and the unpublished custom amount. Refuses live keys. Prints `ENV=price_id` lines. Does not write `.env`.
