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

Writes `out/orders/<orderId>/` from the stored delivery packet (README, AGENTS.md, EDITING.md, and `scripts/chat-edit.mjs`). Does not call a model.

`pnpm deliver <orderId> --rebuild` also runs `pnpm crawl` and `pnpm rebuild` when `ANTHROPIC_API_KEY` is set. Without that key it writes the snapshot and stops.

## `pnpm indexnow`

Submits the public sitemap URLs to IndexNow. Set `INDEXNOW_KEY` in the environment. The same value is served at `/<key>.txt`. The key is not printed.

## `pnpm setup-stripe`

Create-or-lookup Stripe **test mode** products for the $99 automated price and the unpublished custom amount. Refuses live keys. Prints `ENV=price_id` lines. Does not write `.env`.
