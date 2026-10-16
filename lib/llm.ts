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
 *   The Anthropic client never reads LLM_BASE_URL. Unset ANTHROPIC_BASE_URL
 *   uses the Anthropic SDK default host.
 *
 * Screenshots:
 *   LLM_VISION=1|0                                 (optional override)
 *   Unset: Claude and slugs with a `vision` token get images. DeepSeek Flash,
 *   Together Flash, and Qwen3 Coder stay text-only and rebuild from the DOM.
 *
 * Auto-detect when LLM_PROVIDER is unset:
 *   LLM_API_KEY + LLM_BASE_URL  → openai-compat
 *   ANTHROPIC_API_KEY           → anthropic
 *
 * DeepSeek Chat Completions think by default (`thinking.type` = enabled).
 * Reasoning tokens are generated first and count toward `max_tokens`, which
 * can return HTTP 200 with empty `content` and `finish_reason` `length`.
 * On `*.deepseek.com` this client sends `thinking: { type: "disabled" }` so
 * the whole `max_tokens` budget is available for `message.content`.
 * `reasoning_effort` is omitted: DeepSeek rejects `"none"` with HTTP 400,
 * and `thinking.type` is the switch that turns thinking off.
 * `reasoning_content` is returned separately for logs and is never the page.
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
  /** Assistant text. Page TSX comes only from this field (`message.content`). */
  text: string;
  /**
   * Chain-of-thought when the host returns one (`reasoning_content` and similar).
   * Logging/debug only. Never treat this as the page.
   */
  reasoning?: string;
  usage: LlmUsage;
};

export type LlmConfig = {
  provider: LlmProvider;
  apiKey: string;
  baseUrl?: string;
  model: string;
  /**
   * Attach crawler screenshots. Set by `resolveLlmConfig` from `LLM_VISION`
   * or the vision allowlist. Callers that omit it use the allowlist.
   */
  vision?: boolean;
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

/**
 * Vision-capable slugs. Text-only defaults (DeepSeek Flash, Together
 * `DeepSeek-V4-Flash-0731`, Qwen3 Coder) are absent on purpose.
 * `LLM_VISION=1` opts any other model in; `LLM_VISION=0` forces DOM-only.
 */
const VISION_MODEL_RE = [
  /(?:^|[/])claude-/i,
  /(?:^|[/._-])vision(?:$|[/._-])/i,
];

/** True when the slug is on the vision allowlist. Does not read `LLM_VISION`. */
export function llmModelAcceptsVision(model: string): boolean {
  const slug = model.trim();
  if (!slug) return false;
  return VISION_MODEL_RE.some((re) => re.test(slug));
}

/**
 * `LLM_VISION=1|true|yes|on` forces screenshots.
 * `LLM_VISION=0|false|no|off` (and any other non-empty value) forces DOM-only.
 * Unset uses `llmModelAcceptsVision`.
 */
export function resolveLlmVision(model: string, flag: string | undefined = process.env.LLM_VISION): boolean {
  const raw = (flag ?? "").trim().toLowerCase();
  if (!raw) return llmModelAcceptsVision(model);
  if (raw === "1" || raw === "true" || raw === "yes" || raw === "on") return true;
  return false;
}

export function llmConfigUsesVision(config: Pick<LlmConfig, "model" | "vision">): boolean {
  if (typeof config.vision === "boolean") return config.vision;
  return llmModelAcceptsVision(config.model);
}

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
    return { provider: "openai-compat", apiKey, baseUrl, model, vision: resolveLlmVision(model) };
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
    const model = modelFromFlag || llmModel || resolveAnthropicModel(undefined) || DEFAULT_ANTHROPIC_MODEL;
    return {
      provider: "anthropic",
      apiKey,
      // Chat Completions LLM_BASE_URL is a different host (api.deepseek.com vs
      // api.deepseek.com/anthropic). Unset uses the Anthropic SDK default.
      ...(anthropicBase ? { baseUrl: anthropicBase.replace(/\/$/, "") } : {}),
      model,
      vision: resolveLlmVision(model),
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
  const reasoning = anthropicReasoning(resp.content);
  return {
    text,
    ...(reasoning ? { reasoning } : {}),
    usage: {
      inputTokens: resp.usage.input_tokens,
      outputTokens: resp.usage.output_tokens,
      stopReason: resp.stop_reason,
    },
  };
}

function anthropicReasoning(content: Array<{ type: string; thinking?: unknown }>): string {
  return content
    .map((block) => (block.type === "thinking" && typeof block.thinking === "string" ? block.thinking : ""))
    .filter(Boolean)
    .join("\n");
}

/** True for DeepSeek's own Chat Completions hosts, including the default base URL. */
export function isDeepSeekChatHost(baseUrl?: string): boolean {
  const raw = (baseUrl && baseUrl.trim()) || DEFAULT_OPENAI_COMPAT_BASE_URL;
  const host = raw.replace(/^https?:\/\//, "").split("/")[0]?.split(":")[0]?.toLowerCase() ?? "";
  return host === "deepseek.com" || host.endsWith(".deepseek.com");
}

/**
 * Request body for OpenAI-compatible `/chat/completions`.
 * DeepSeek Flash/Pro think by default, and those tokens share `max_tokens`
 * with the answer. `thinking: { type: "disabled" }` keeps the budget for
 * content. `reasoning_effort` is not sent: DeepSeek rejects `"none"` (HTTP 400).
 * Other hosts are left unchanged.
 */
export function buildOpenAICompatBody(
  config: LlmConfig,
  system: string,
  messages: LlmMessage[],
  maxTokens: number,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
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
  if (isDeepSeekChatHost(config.baseUrl)) {
    body.thinking = { type: "disabled" };
  }
  return body;
}

function firstNonEmptyString(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    if (typeof value === "string" && value.length > 0) return value;
  }
  return "";
}

/** Parse a Chat Completions JSON body. TSX is `message.content` only. */
export function parseOpenAICompatChat(data: {
  choices?: Array<{
    message?: {
      content?: string | null;
      reasoning_content?: string | null;
      reasoning?: string | null;
      thinking?: string | null;
    };
    finish_reason?: string | null;
  }>;
  usage?: { prompt_tokens?: number; completion_tokens?: number };
}): LlmChatResult {
  const message = data.choices?.[0]?.message;
  const text = typeof message?.content === "string" ? message.content : "";
  const reasoning = firstNonEmptyString(message?.reasoning_content, message?.reasoning, message?.thinking);
  return {
    text,
    ...(reasoning ? { reasoning } : {}),
    usage: {
      inputTokens: data.usage?.prompt_tokens ?? 0,
      outputTokens: data.usage?.completion_tokens ?? 0,
      stopReason: data.choices?.[0]?.finish_reason ?? null,
    },
  };
}

/**
 * Why a completion cannot be saved as a page. `length` / `max_tokens` with
 * empty or partial content is a hard failure — the draft is truncated.
 * Returns null when the caller should syntax-check `text` as usual.
 */
export function outputBudgetError(text: string, stopReason: string | null): string | null {
  const trimmed = text.trim();
  const cutOff = stopReason === "length" || stopReason === "max_tokens";
  if (!trimmed && cutOff) {
    return `finish_reason ${stopReason} with empty content; output budget exhausted before any page TSX`;
  }
  if (!trimmed) {
    return "model returned empty message.content; reasoning is not used as the page";
  }
  if (cutOff) {
    return `finish_reason ${stopReason}; content was truncated at max_tokens and was not written`;
  }
  return null;
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
  const body = buildOpenAICompatBody({ ...config, baseUrl: base }, system, messages, maxTokens);

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

  let data: Parameters<typeof parseOpenAICompatChat>[0];
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("openai-compat returned non-JSON body");
  }

  return parseOpenAICompatChat(data);
}

/** Drop screenshot parts for text-only models so the host is not sent image_url. */
export function messagesForVision(config: Pick<LlmConfig, "model" | "vision">, messages: LlmMessage[]): LlmMessage[] {
  if (llmConfigUsesVision(config)) return messages;
  return messages.map((message) => {
    if (typeof message.content === "string") return message;
    const text = message.content.filter((part) => part.type === "text");
    if (text.length === message.content.length) return message;
    return {
      ...message,
      content: text.length > 0 ? text : "Rebuild from the DOM. No images are attached.",
    };
  });
}

/** One chat turn (system + messages). Retries stay in the caller. */
export async function llmChat(
  config: LlmConfig,
  opts: { system: string; messages: LlmMessage[]; maxTokens: number },
): Promise<LlmChatResult> {
  const messages = messagesForVision(config, opts.messages);
  if (config.provider === "openai-compat") {
    return chatOpenAICompat(config, opts.system, messages, opts.maxTokens);
  }
  return chatAnthropic(config, opts.system, messages, opts.maxTokens);
}

/** Human-readable provider line for logs (no secrets). */
export function describeLlmConfig(config: LlmConfig): string {
  const host = config.baseUrl ? config.baseUrl.replace(/^https?:\/\//, "").split("/")[0] : "default";
  return `${config.provider} model=${config.model} host=${host} vision=${llmConfigUsesVision(config) ? "on" : "off"}`;
}
