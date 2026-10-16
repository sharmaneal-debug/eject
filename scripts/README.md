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

Reads the same snapshot as `pnpm rebuild` and writes a static site: HTML files, the captured CSS, and local images and fonts. No model and no build step. Platform runtime scripts are removed, internal links point at the local pages, and forms are marked `data-eject-form="needs-endpoint"` with action `#` so a native submit does not post to the previous host. The folder includes `AGENTS.md`, `EDITING.md`, `README.md`, and `scripts/chat-edit.mjs`.

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

**Optional path.** Static move remains the default delivery. This script regenerates each captured page as Next.js + Tailwind when you want a React rebuild.

Output goes to `out/<hostname>/` (runnable Next.js project).

### Preferred: open-weights via OpenAI-compatible API (DeepSeek Flash)

```sh
export LLM_PROVIDER=openai-compat
export LLM_BASE_URL=https://api.deepseek.com          # or Together/Fireworks/OpenRouter …/v1
export LLM_API_KEY=…                                  # never commit; never print
export LLM_MODEL=deepseek-flash                       # Together: deepseek-ai/DeepSeek-V4-Flash-0731
export EJECT_REBUILD_SPEND_CAP_USD=2                  # abort if estimated spend exceeds this

pnpm rebuild data/snapshots/example-com
cd out/example-com && pnpm install && pnpm dev
```

DeepSeek Flash and Pro **think by default** (`thinking.type` defaults to `enabled`). Reasoning tokens are generated first and count toward `max_tokens`, so a capped call can return HTTP 200 with empty or truncated `message.content` and `finish_reason: length`. On `*.deepseek.com` (including the default `https://api.deepseek.com`), `lib/llm.ts` sends `thinking: { "type": "disabled" }` and omits `reasoning_effort`. DeepSeek Chat Completions reject `reasoning_effort: "none"` with HTTP 400; `thinking.type` is the switch that turns thinking off, so the 12k budget, and the one retry at 16k, is entirely for the answer. There is no separate thinking budget on this API. Any `reasoning_content` / `reasoning` / `thinking` text is logged by character count only and is never written as the page. TSX is taken only from `message.content`. A `finish_reason` of `length` (or Anthropic `max_tokens`) with empty or truncated content fails the page instead of saving it. Together, Fireworks, and OpenRouter do not get the DeepSeek `thinking` field.

DeepSeek also exposes an Anthropic-compatible endpoint. That format documents effort (`output_config.effort`: `low` / `high` / `max`) and does not document a thinking-off switch, so Flash rebuilds should stay on the openai-compat path above. The Messages-shaped alternative is:

```sh
export LLM_PROVIDER=anthropic
export ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic
export ANTHROPIC_API_KEY=…   # DeepSeek key
export ANTHROPIC_MODEL=deepseek-flash
```

### Optional: Anthropic Claude

```sh
export ANTHROPIC_API_KEY=…
pnpm rebuild data/snapshots/example-com
```

Notes:
- Provider resolution lives in `lib/llm.ts` (`LLM_PROVIDER`, `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`). Anthropic remains optional.
- `--model=` overrides `LLM_MODEL` / `ANTHROPIC_MODEL`. Default openai-compat model is `deepseek-flash`.
- Capped at 10 pages per run (`--max-pages=...`). Soft USD abort via `EJECT_REBUILD_SPEND_CAP_USD` (default 5).
- If Flash output fails review, escalate `LLM_MODEL` to a Qwen3 Coder slug on OpenRouter/Fireworks (see `content/llm-open-source-options-2026-10-15.md`).
- Keys are never printed. `usage.json` in the output records provider, model, tokens, and estimated USD.

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
