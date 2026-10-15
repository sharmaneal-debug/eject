/**
 * LLM provider switch for scripts/rebuild.ts (optional React rebuild path).
 *
 * Static move remains the default delivery path. This client is only for the
 * optional polish/rebuild when an operator sets LLM_* or ANTHROPIC_* env vars.
 *
 * Providers:
 *   - openai-compat  OpenAI Chat Completions (DeepSeek, Together, Fireworks, OpenRouter, …)
 *   - anthropic      Anthropic Messages API (optional; also works with DeepSeek's
 *                    Anthropic-compatible base URL https://api.deepseek.com/anthropic)
 *
 * Env (openai-compat — preferred for open-weights):
 *   LLM_PROVIDER=openai-compat
 *   LLM_BASE_URL=https://api.deepseek.com          (or Together / Fireworks / OpenRouter)
 *   LLM_API_KEY=…                                  (never commit; never print)
 *   LLM_MODEL=deepseek-flash                       (host-specific slug; see scripts/README.md)
 *
 * Env (anthropic — optional):
 *   LLM_PROVIDER=anthropic
 *   ANTHROPIC_API_KEY=…                            (or LLM_API_KEY)
 *   ANTHROPIC_BASE_URL=…                           (optional; DeepSeek anthropic endpoint)
 *   ANTHROPIC_MODEL=… or LLM_MODEL=…
 *
 * Auto-detect when LLM_PROVIDER is unset:
 *   LLM_API_KEY + LLM_BASE_URL  → openai-compat
 *   ANTHROPIC_API_KEY           → anthropic
 */

import Anthropic from "@anthropic-ai/sdk";
import { DEFAULT_ANTHROPIC_MODEL, resolveAnthropicModel } from "./model";

export type LlmProvider = "openai-compat" | "anthropic";

export type LlmImage = {
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
  base64: string;
};

export type LlmContentPart =
  | { type: "text"; text: string }
  | { type: "image"; image: LlmImage };

export type LlmMessage = {
  role: "user" | "assistant";
  content: string | LlmContentPart[];
};

export type LlmUsage = {
  inputTokens: number;
  outputTokens: number;
  stopReason: string | null;
};

export type LlmChatResult = {
  text: string;
  usage: LlmUsage;
};

export type LlmConfig = {
  provider: LlmProvider;
  apiKey: string;
  baseUrl?: string;
  model: string;
};

/** USD per million tokens. Confirm on the provider page before billing. */
export const PRICING_USD_PER_MTOK: Record<string, { in: number; out: number }> = {
  // Anthropic
  "claude-sonnet-5-5": { in: 2, out: 10 },
  "claude-sonnet-5": { in: 2, out: 10 },
  "claude-sonnet-4-5-20250929": { in: 3, out: 15 },
  "claude-sonnet-4-6": { in: 3, out: 15 },
  "claude-haiku-4-5-20251001": { in: 1, out: 5 },
  "claude-haiku-5-5": { in: 0.1, out: 0.5 },
  "claude-opus-4-8": { in: 5, out: 25 },
  // DeepSeek (1st-party Flash; V4.1 Flash / legacy flash aliases)
  "deepseek-flash": { in: 0.15, out: 0.6 },
  "deepseek-v4-flash": { in: 0.15, out: 0.6 },
  "deepseek-v4-flash-vision-exp": { in: 0.15, out: 0.6 },
  "deepseek-chat": { in: 0.15, out: 0.6 },
  // Together Flash 0731
  "deepseek-ai/DeepSeek-V4-Flash-0731": { in: 0.14, out: 0.28 },
  // Qwen3 Coder escalation (OpenRouter-ish mid; confirm before use)
  "qwen/qwen3-coder-480b-a35b": { in: 0.22, out: 1.8 },
  "qwen3-coder-480b-a35b": { in: 0.22, out: 1.8 },
};

export const DEFAULT_OPENAI_COMPAT_MODEL = "deepseek-flash";
export const DEFAULT_OPENAI_COMPAT_BASE_URL = "https://api.deepseek.com";

export function costOf(model: string, inTok: number, outTok: number): number {
  const p = PRICING_USD_PER_MTOK[model];
  if (!p) return 0;
  return (inTok * p.in + outTok * p.out) / 1_000_000;
}

function flagModel(flag?: string): string {
  return flag && flag !== "true" ? flag.trim() : "";
}

/**
 * Resolve provider + credentials. Does not print secrets.
 * `modelFlag` is the CLI `--model=` value when present.
 */
export function resolveLlmConfig(opts: { modelFlag?: string; dryRun?: boolean } = {}): LlmConfig {
  const providerRaw = (process.env.LLM_PROVIDER ?? "").trim().toLowerCase();
  const modelFromFlag = flagModel(opts.modelFlag);
  const llmModel = process.env.LLM_MODEL?.trim() ?? "";
  const llmKey = process.env.LLM_API_KEY?.trim() ?? "";
  const llmBase = process.env.LLM_BASE_URL?.trim() ?? "";
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim() ?? "";
  const anthropicBase = process.env.ANTHROPIC_BASE_URL?.trim() ?? "";

  const wantOpenAI =
    providerRaw === "openai-compat" ||
    providerRaw === "openai" ||
    providerRaw === "deepseek" ||
    providerRaw === "together" ||
    providerRaw === "fireworks" ||
    providerRaw === "openrouter" ||
    (!providerRaw && Boolean(llmKey && llmBase));

  if (wantOpenAI) {
    const apiKey = llmKey || anthropicKey || (opts.dryRun ? "dry-run" : "");
    if (!apiKey) {
      throw new Error(
        "openai-compat provider needs LLM_API_KEY (or ANTHROPIC_API_KEY as fallback). See scripts/README.md.",
      );
    }
    const baseUrl = (llmBase || DEFAULT_OPENAI_COMPAT_BASE_URL).replace(/\/$/, "");
    const model = modelFromFlag || llmModel || DEFAULT_OPENAI_COMPAT_MODEL;
    return { provider: "openai-compat", apiKey, baseUrl, model };
  }

  const wantAnthropic =
    providerRaw === "anthropic" || (!providerRaw && Boolean(anthropicKey)) || Boolean(anthropicKey && !llmKey);

  if (wantAnthropic || anthropicKey || opts.dryRun) {
    const apiKey = anthropicKey || llmKey || (opts.dryRun ? "dry-run" : "");
    if (!apiKey) {
      throw new Error(
        "anthropic provider needs ANTHROPIC_API_KEY (or set LLM_PROVIDER=openai-compat with LLM_API_KEY). See scripts/README.md.",
      );
    }
    const model = modelFromFlag || llmModel || resolveAnthropicModel(undefined);
    return {
      provider: "anthropic",
      apiKey,
      baseUrl: anthropicBase || llmBase || undefined,
      model: model || DEFAULT_ANTHROPIC_MODEL,
    };
  }

  throw new Error(
    "No LLM credentials. Set LLM_PROVIDER=openai-compat with LLM_API_KEY + LLM_BASE_URL (recommended: DeepSeek Flash), or ANTHROPIC_API_KEY. See scripts/README.md.",
  );
}

function partsToAnthropic(
  content: string | LlmContentPart[],
): string | Array<Anthropic.TextBlockParam | Anthropic.ImageBlockParam> {
  if (typeof content === "string") return content;
  return content.map((p) => {
    if (p.type === "text") return { type: "text" as const, text: p.text };
    return {
      type: "image" as const,
      source: { type: "base64" as const, media_type: p.image.mediaType, data: p.image.base64 },
    };
  });
}

function partsToOpenAI(
  content: string | LlmContentPart[],
): string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> {
  if (typeof content === "string") return content;
  return content.map((p) => {
    if (p.type === "text") return { type: "text" as const, text: p.text };
    return {
      type: "image_url" as const,
      image_url: { url: `data:${p.image.mediaType};base64,${p.image.base64}` },
    };
  });
}

async function chatAnthropic(
  config: LlmConfig,
  system: string,
  messages: LlmMessage[],
  maxTokens: number,
): Promise<LlmChatResult> {
  const client = new Anthropic({
    apiKey: config.apiKey,
    ...(config.baseUrl ? { baseURL: config.baseUrl } : {}),
  });
  const resp = await client.messages.create({
    model: config.model,
    max_tokens: maxTokens,
    system,
    messages: messages.map((m) => ({
      role: m.role,
      content: partsToAnthropic(m.content),
    })),
  });
  const text = resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  return {
    text,
    usage: {
      inputTokens: resp.usage.input_tokens,
      outputTokens: resp.usage.output_tokens,
      stopReason: resp.stop_reason,
    },
  };
}

async function chatOpenAICompat(
  config: LlmConfig,
  system: string,
  messages: LlmMessage[],
  maxTokens: number,
): Promise<LlmChatResult> {
  const base = (config.baseUrl ?? DEFAULT_OPENAI_COMPAT_BASE_URL).replace(/\/$/, "");
  // DeepSeek: https://api.deepseek.com/chat/completions
  // Together/Fireworks/OpenRouter: set LLM_BASE_URL to …/v1 so this becomes …/v1/chat/completions
  const endpoint = `${base}/chat/completions`;

  const body = {
    model: config.model,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: system },
      ...messages.map((m) => ({
        role: m.role,
        content: partsToOpenAI(m.content),
      })),
    ],
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const raw = await res.text();
  if (!res.ok) {
    const snippet = raw.replace(/sk-[A-Za-z0-9_-]{8,}/g, "[redacted]").slice(0, 400);
    throw new Error(`openai-compat HTTP ${res.status} at ${endpoint.replace(/https?:\/\/[^/]+/, "[host]")}: ${snippet}`);
  }

  let data: {
    choices?: Array<{ message?: { content?: string | null }; finish_reason?: string | null }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("openai-compat returned non-JSON body");
  }

  const text = data.choices?.[0]?.message?.content ?? "";
  return {
    text,
    usage: {
      inputTokens: data.usage?.prompt_tokens ?? 0,
      outputTokens: data.usage?.completion_tokens ?? 0,
      stopReason: data.choices?.[0]?.finish_reason ?? null,
    },
  };
}

/** One chat turn (system + messages). Retries stay in the caller. */
export async function llmChat(
  config: LlmConfig,
  opts: { system: string; messages: LlmMessage[]; maxTokens: number },
): Promise<LlmChatResult> {
  if (config.provider === "openai-compat") {
    return chatOpenAICompat(config, opts.system, opts.messages, opts.maxTokens);
  }
  return chatAnthropic(config, opts.system, opts.messages, opts.maxTokens);
}

/** Human-readable provider line for logs (no secrets). */
export function describeLlmConfig(config: LlmConfig): string {
  const host = config.baseUrl ? config.baseUrl.replace(/^https?:\/\//, "").split("/")[0] : "default";
  return `${config.provider} model=${config.model} host=${host}`;
}
