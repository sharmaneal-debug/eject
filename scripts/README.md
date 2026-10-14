# Eject scripts

Operator scripts: `crawl`, `rebuild`, `site-audit`, `orders`, `deliver`, `editor`, `setup-stripe`.

## `pnpm crawl <url>`

Walks every internal link of the URL with Playwright. Captures rendered DOM, meta tags, image / link / font lists, and design tokens (colors, fonts, sizes, radii). Font files named in the captured CSS (for example Flowbase Inter) are saved into the snapshot even when the browser response body was not readable. Output goes to `data/snapshots/<hostname>/`. The start URL is checked before the browser launches (public http(s) only, and robots.txt). A crawl that saves zero pages exits with code 3. `--pages=/a,/b` captures only those paths.

```
pnpm crawl https://example.com --max-pages=20
```

Outputs:
- `manifest.json` — site overview + per-page summary
- `pages/*.json` — full captured HTML per page
- `design-tokens.json` — extracted design system

## `pnpm static-move <snapshot-dir>`

Reads the same snapshot as `pnpm rebuild` and writes a static site: HTML files, the captured CSS, and local images and fonts. No model and no build step. Platform runtime scripts are removed, internal links point at the local pages, and forms are marked `data-eject-form="needs-endpoint"` with action `#` so a native submit does not post to the previous host. The folder includes `AGENTS.md`, `README.md`, and `scripts/chat-edit.mjs`.

```
pnpm static-move data/snapshots/example-com --out=out/example-com
python3 -m http.server 8080 --directory out/example-com
```

`--noindex` adds a robots meta tag. Use that only for an unlisted preview copy, not for the customer's site.

## `pnpm parity`

Runs crawl, static move, screenshots (1440 and 390), and `scripts/harness/compare.py` for `scripts/harness/sites.tsv`. Output stays in `out/parity/` (not committed). The moved-site screenshot passes `--local`, which blocks requests that are not the local server, so a live CDN cannot fill in a missing image or font. The rating rule in `compare.py` is the one from the 2026-10-10 run, unchanged.

```
pip install -r scripts/harness/requirements.txt
pnpm parity --only=static-cern
```

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

Writes `out/orders/<orderId>/` as a static site. If the order has a site URL and `data/snapshots/<host>/` is missing, it crawls first, then runs static-move into that folder (HTML, CSS, assets, `AGENTS.md`, hosting README). It does not call a model. An order with no site URL and no snapshot still gets the stored text extract.

`pnpm deliver <orderId> --llm` (or `--rebuild`) also runs `pnpm rebuild` into `out/orders/<orderId>-llm` when `ANTHROPIC_API_KEY` is set. Without that key the model step is skipped and the static site is still written.

## `pnpm indexnow`

Submits the public sitemap URLs to IndexNow. Set `INDEXNOW_KEY` in the environment. The same value is served at `/<key>.txt`. The key is not printed.

## `pnpm setup-stripe`

Create-or-lookup Stripe **test mode** products for the $99 automated price and the unpublished custom amount. Refuses live keys. Prints `ENV=price_id` lines. Does not write `.env`.
