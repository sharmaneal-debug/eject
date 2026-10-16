# Open-weights LLM options for Eject's rebuild pipeline (2026-10-15)

**Recommendation:** Stay static-first and don't use a model by default. When a site needs a React/Next rebuild, use **DeepSeek V4 Flash** (open weights, about $0.14/$0.28 per 1M tokens on Together or Fireworks). That costs about **2–4 cents per 10-page site**. Escalate to Qwen3 Coder 480B (about $0.07–0.18 per site) only when Flash output fails review.

## Context
- Static move (PR #5, no model) already scores 14 High and 2 Medium on visual match across 16 test sites. Last week's AI rebuild with Claude Sonnet scored Low.
- So the model is an optional path for polish or rebuilds, for hard cases only: script-driven Squarespace layouts, menus or animation that need platform JS, or a customer who wants editable React components.
- Workload per site: 50–150k input tokens and 30–80k output tokens. Cost per site = in × price_in + out × price_out.

## Prices gathered (USD per 1M tokens, checked 2026-10-15 from provider pages, OpenRouter and aggregators. Confirm on the provider page before billing.)
| Model (open weights) | Host | In / Out | Context | API shape | Est. per site (low–high) | Notes |
|---|---|---|---|---|---|---|
| **DeepSeek V4 Flash (0731)** | Together, Fireworks | $0.14 / $0.28 | ~128k+ | OpenAI-compatible | **$0.015 – $0.04** | Cheapest capable option; caching ~$0.03 in |
| DeepSeek V4.1 Flash | DeepSeek API (1st party) | off-peak $0.15/$0.60, peak $0.30/$1.20 | — | OpenAI **and Anthropic**-compatible | $0.03 – $0.07 (off-peak) | Anthropic-compatible endpoint means near-zero code change |
| DeepSeek V3.2 | OpenRouter (cheapest route) | ~$0.21 / $0.31 | 164k | OpenAI-compatible | $0.02 – $0.06 | Coding Index 44 (OpenRouter), ~50 tok/s |
| **Qwen3 Coder 480B A35B** | OpenRouter | $0.22 / $1.80 (Fireworks $0.45/$1.80) | 262k | OpenAI-compatible | **$0.065 – $0.18** | Coding-specialised, ~85 tok/s, 0.6s p50 latency |
| **gpt-oss-120b** | Groq / Together / Fireworks | $0.15 / $0.60 | 131k | OpenAI-compatible | $0.025 – $0.07 | Very fast on Groq (~500 tok/s); free tier 200k tok/day for testing |
| GLM 4.6 | OpenRouter (Venice), DeepInfra $0.50/$2.00 | $0.43 / $1.75 | 205k | OpenAI-compatible | $0.08 – $0.20 | Good frontend taste; pricier |
| Kimi K2.7 Code | Fireworks / Nebius | $0.95 / $4.00 | — | OpenAI-compatible | $0.17 – $0.46 | Premium tier; not needed for simple sites |
| Llama 3.3 70B | Together $1.04/$1.04; Groq enterprise-only since Aug 2026 | — | 128k | OpenAI-compatible | $0.08 – $0.24 | Outdated for coding; skip |
| Self-host (vLLM/Ollama) | rented H100 ~$2–3/hr | — | — | OpenAI-compatible (vLLM) | GPU idle cost dominates | Not worth it at <1,000 sites/month; API is pennies |

For comparison, the Claude Sonnet path costs about $3/$15 per 1M, which is roughly $0.60–1.65 per site.

## Ranked top 3
1. **DeepSeek V4 Flash** (default): lowest cost, strong at general coding, OpenAI-compatible on Together and Fireworks. The 1st-party DeepSeek API also has an Anthropic-compatible endpoint.
2. **Qwen3 Coder 480B**: escalation for tougher pages. It's coding-tuned and has a 262k context, so a whole site can fit in one call if needed.
3. **gpt-oss-120b on Groq**: fastest and cheap, with a free tier good for CI and smoke tests. Its 131k context means one page per call.

Caveat: none of these has been tested on our 16-site set yet. The Claude rebuild scored Low, so model choice alone may not fix rebuild fidelity. **Before committing, run the existing test harness on the 8 easy sites with Flash and with Qwen3 Coder.** Expected spend is under $2 total, but it needs Neal's approval of a small top-up on one provider.

## Wiring steps (no secrets, no purchases made)
`scripts/rebuild.ts` currently hard-codes the Anthropic SDK (`ANTHROPIC_API_KEY`, default model claude-sonnet-4-5).
- **Option A, zero-code test:** The Anthropic SDK accepts `baseURL`. Point it at DeepSeek's Anthropic-compatible endpoint (`https://api.deepseek.com/anthropic`) with `--model deepseek-v4-flash`. Check that the SDK reads `ANTHROPIC_BASE_URL`, or add a `baseURL: process.env.ANTHROPIC_BASE_URL` option.
- **Option B, recommended small refactor:** Add a provider switch that uses the `openai` npm SDK for any OpenAI-compatible host:
  - env: `LLM_PROVIDER=openai-compat`, `LLM_BASE_URL` (e.g. `https://api.together.xyz/v1`, `https://api.fireworks.ai/inference/v1`, `https://openrouter.ai/api/v1`, `https://api.groq.com/openai/v1`), `LLM_API_KEY`, `LLM_MODEL`.
  - Map `messages.create` to `chat.completions.create` and read `choices[0].message.content`. Keep the existing prompt and the TSX-extraction logic.
  - Keep Anthropic as an optional provider. Default `LLM_MODEL` to the DeepSeek V4 Flash slug on the chosen host.
- Store the key in Vercel env and the local env file only. Never commit it. Log tokens and $ per site in the order notes.
- Add a per-site spend cap in code, e.g. abort over 400k total tokens, which is about $0.10 on Flash.

## Should we stay static-first?
**Yes.** Static move is free, deterministic and already scores High on most sites. Use the model only for (a) hard-case pages flagged by the parity check (Medium/Low), (b) customers who want componentised Next.js, and (c) small polish tasks like alt text, meta tags and form rewiring notes. At about $0.04 per site, model cost is negligible against $99, so the real constraint is output quality and review time, not token price.
