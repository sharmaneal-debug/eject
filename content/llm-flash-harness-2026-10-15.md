# DeepSeek Flash harness — 8 easy sites (2026-10-15)

**Status: BLOCKED — no open-weights API key on the box.**

Wiring for `LLM_PROVIDER` / `LLM_BASE_URL` / `LLM_API_KEY` / `LLM_MODEL` landed in PR (see repo branch `cursor/openai-compat-llm-rebuild`). Static move stays the default. Checkout and production were not touched.

## Key scan (names + lengths only; values never printed)

Checked process env and known secret files (`theia.env`, `box-secrets.json`, `host-secrets.json`, vendor portals, `.env.example` only):

| Variable | Present? |
|---|---|
| `DEEPSEEK_API_KEY` | missing |
| `TOGETHER_API_KEY` | missing |
| `FIREWORKS_API_KEY` | missing |
| `OPENROUTER_API_KEY` | missing |
| `LLM_API_KEY` | missing |
| `OPENAI_API_KEY` | missing |
| `ANTHROPIC_API_KEY` | present in Theia secrets (Anthropic only — **not used** for this harness; Neal asked for open-weights) |

No DeepSeek / Together / Fireworks / OpenRouter key was found. Per standing rules: do not buy credits or create paid accounts. Cap under $2. **Harness did not run.**

## What Neal must provide (pick one)

**Option A — DeepSeek (recommended, cheapest, vision-capable Flash):**
1. Sign up / top up at https://platform.deepseek.com (or api-docs.deepseek.com) with enough balance for ~$2.
2. Create an API key.
3. Put it on the box as either:
   - `LLM_API_KEY=<key>` plus `LLM_PROVIDER=openai-compat` and `LLM_BASE_URL=https://api.deepseek.com` and `LLM_MODEL=deepseek-flash`, **or**
   - `DEEPSEEK_API_KEY=<key>` (we can map it) — simplest is still `LLM_API_KEY`.
4. Optional Anthropic-shape path: `ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic` with the same DeepSeek key as `ANTHROPIC_API_KEY` / `LLM_API_KEY` and `LLM_PROVIDER=anthropic` / `ANTHROPIC_MODEL=deepseek-flash`.

**Option B — Together:**
1. https://api.together.xyz — create key, fund ~$2.
2. `LLM_PROVIDER=openai-compat`
3. `LLM_BASE_URL=https://api.together.xyz/v1`
4. `LLM_API_KEY=<key>`
5. `LLM_MODEL=deepseek-ai/DeepSeek-V4-Flash-0731`

**Option C — Fireworks:**
1. https://fireworks.ai — create key, fund ~$2.
2. `LLM_PROVIDER=openai-compat`
3. `LLM_BASE_URL=https://api.fireworks.ai/inference/v1`
4. `LLM_API_KEY=<key>`
5. `LLM_MODEL=` (Flash slug on Fireworks — confirm on their model page; escalate to Qwen3 Coder if needed)

Do **not** use the existing Anthropic key for this harness unless Neal explicitly says so.

## Planned harness (ready once a key lands)

Sites (Flash only first; stop if spend approaches $2):

| Slug | URL | Platform |
|---|---|---|
| minimum-01 | https://minimum-01.framer.website/ | Framer |
| photr | https://photr.framer.website/ | Framer |
| smoke | https://smoke.framer.ai/ | Framer |
| one-template | https://one-template.webflow.io/ | Webflow |
| clean-landing | (from prior test-run sites.tsv) | — |
| safia | (from prior test-run) | — |
| wix-daycare | (from prior test-run) | Wix |
| wix-coachpro | (from prior test-run) | Wix |

Notes:
- Prior crawl snapshots under `test-run-2026-10-10/<slug>/v2/snapshot` were deleted after the Claude runs; only logs + `out/` remain. The next harness must **re-crawl** (free) then `pnpm rebuild` with Flash.
- Soft cap: `EJECT_REBUILD_SPEND_CAP_USD=2`.
- Expected cost from the options memo: about $0.015–0.04 per 10-page site on Flash → well under $2 for 8 sites if page counts stay modest.
- Record per site: rebuild success/fail, input/output tokens, estimated $, and (if scoring is re-run) visual parity High/Medium/Low.
- Escalation to Qwen3 Coder 480B only if Flash fails badly — not in the first Flash-only pass.

## Results table (empty until key)

| Site | Pages | Rebuild | In tok | Out tok | Est. $ | Notes |
|---|---|---|---|---|---|---|
| — | — | not run | — | — | $0.00 | blocked on API key |

**Total spent: $0.00**

## Code changes (this PR)

- `lib/llm.ts` — provider switch (`openai-compat` + `anthropic`), pricing table for Flash / Qwen / Claude, `llmChat()`.
- `scripts/rebuild.ts` — uses `resolveLlmConfig` / `llmChat`; logs provider without secrets; writes provider into `usage.json`.
- `.env.example`, `scripts/README.md` — document env vars and DeepSeek / Together / Fireworks examples.
- Does not change `CHECKOUT_OPEN`, delivery defaults, or production.
