import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildOpenAICompatBody,
  isDeepSeekChatHost,
  llmChat,
  llmModelAcceptsVision,
  messagesForVision,
  outputBudgetError,
  parseOpenAICompatChat,
  resolveLlmConfig,
  resolveLlmVision,
  type LlmConfig,
  type LlmMessage,
} from "../lib/llm";

const flash: LlmConfig = {
  provider: "openai-compat",
  apiKey: "test-key",
  baseUrl: "https://api.deepseek.com",
  model: "deepseek-flash",
};

test("DeepSeek host detection includes the default API host and ignores other providers", () => {
  assert.equal(isDeepSeekChatHost(undefined), true);
  assert.equal(isDeepSeekChatHost("https://api.deepseek.com"), true);
  assert.equal(isDeepSeekChatHost("https://api.deepseek.com/v1"), true);
  assert.equal(isDeepSeekChatHost("https://api.together.xyz/v1"), false);
  assert.equal(isDeepSeekChatHost("https://api.fireworks.ai/inference/v1"), false);
  assert.equal(isDeepSeekChatHost("https://openrouter.ai/api/v1"), false);
  assert.equal(isDeepSeekChatHost("https://notdeepseek.com"), false);
});

test("DeepSeek Flash chat body disables thinking so max_tokens is content-only", () => {
  const body = buildOpenAICompatBody(flash, "system", [{ role: "user", content: "rebuild" }], 12_000);
  assert.equal(body.model, "deepseek-flash");
  assert.equal(body.max_tokens, 12_000);
  assert.deepEqual(body.thinking, { type: "disabled" });
  assert.equal("reasoning_effort" in body, false);
});

test("non-DeepSeek hosts do not receive DeepSeek thinking switches", () => {
  const body = buildOpenAICompatBody(
    { ...flash, baseUrl: "https://api.together.xyz/v1", model: "deepseek-ai/DeepSeek-V4-Flash-0731" },
    "system",
    [{ role: "user", content: "rebuild" }],
    12_000,
  );
  assert.equal("thinking" in body, false);
  assert.equal("reasoning_effort" in body, false);
});

test("parser keeps reasoning off the page text and preserves finish_reason length", () => {
  const parsed = parseOpenAICompatChat({
    choices: [
      {
        message: { content: "", reasoning_content: "chain of thought that is not TSX" },
        finish_reason: "length",
      },
    ],
    usage: { prompt_tokens: 20, completion_tokens: 12_000 },
  });
  assert.equal(parsed.text, "");
  assert.equal(parsed.reasoning, "chain of thought that is not TSX");
  assert.equal(parsed.usage.stopReason, "length");
  assert.equal(parsed.usage.outputTokens, 12_000);
  assert.equal(parsed.text.includes("chain of thought"), false);
});

test("parser prefers message.content over reasoning and thinking aliases", () => {
  const parsed = parseOpenAICompatChat({
    choices: [
      {
        message: {
          content: "export default function Page(){return null}",
          reasoning: "ignore me",
          thinking: "also ignore",
        },
        finish_reason: "stop",
      },
    ],
  });
  assert.equal(parsed.text, "export default function Page(){return null}");
  assert.equal(parsed.reasoning, "ignore me");
  assert.equal(parsed.usage.stopReason, "stop");
});

test("length with empty or truncated content fails clearly", () => {
  assert.match(
    outputBudgetError("", "length") ?? "",
    /finish_reason length with empty content/,
  );
  assert.match(
    outputBudgetError("export const metadata = { title: \"x\" };", "length") ?? "",
    /truncated at max_tokens/,
  );
  assert.match(
    outputBudgetError("   ", "max_tokens") ?? "",
    /finish_reason max_tokens with empty content/,
  );
  assert.equal(outputBudgetError("export default function Page(){return null}", "stop"), null);
  assert.match(outputBudgetError("", "stop") ?? "", /empty message.content/);
});

test("llmChat posts thinking disabled and does not treat reasoning as content", async () => {
  const original = globalThis.fetch;
  let requestUrl = "";
  let requestBody: Record<string, unknown> = {};
  let authorization = "";
  globalThis.fetch = async (input, init) => {
    requestUrl = String(input);
    authorization = new Headers(init?.headers).get("authorization") ?? "";
    requestBody = JSON.parse(String(init?.body));
    return new Response(
      JSON.stringify({
        choices: [
          {
            message: { content: null, reasoning_content: "private reasoning" },
            finish_reason: "length",
          },
        ],
        usage: { prompt_tokens: 3, completion_tokens: 12000 },
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  };
  try {
    const result = await llmChat(flash, {
      system: "sys",
      messages: [{ role: "user", content: "page" }],
      maxTokens: 12_000,
    });
    assert.equal(requestUrl, "https://api.deepseek.com/chat/completions");
    assert.equal(authorization, "Bearer test-key");
    assert.deepEqual(requestBody.thinking, { type: "disabled" });
    assert.equal("reasoning_effort" in requestBody, false);
    assert.equal(requestBody.max_tokens, 12_000);
    assert.equal(result.text, "");
    assert.equal(result.reasoning, "private reasoning");
    assert.equal(result.usage.stopReason, "length");
    assert.equal(JSON.stringify(result).includes("test-key"), false);
  } finally {
    globalThis.fetch = original;
  }
});

const LLM_ENV_KEYS = [
  "LLM_PROVIDER",
  "LLM_MODEL",
  "LLM_API_KEY",
  "LLM_BASE_URL",
  "LLM_VISION",
  "ANTHROPIC_API_KEY",
  "ANTHROPIC_BASE_URL",
  "ANTHROPIC_MODEL",
] as const;

function withLlmEnv(values: Record<string, string | undefined>, run: () => void): void {
  const previous = new Map<string, string | undefined>();
  for (const key of LLM_ENV_KEYS) {
    previous.set(key, process.env[key]);
    delete process.env[key];
  }
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    run();
  } finally {
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test("vision allowlist is off for DeepSeek Flash, Together Flash, and Qwen3 Coder", () => {
  for (const model of [
    "deepseek-flash",
    "deepseek-v4-flash",
    "deepseek-chat",
    "deepseek-ai/DeepSeek-V4-Flash-0731",
    "qwen/qwen3-coder-480b-a35b",
    "qwen3-coder-480b-a35b",
  ]) {
    assert.equal(llmModelAcceptsVision(model), false, model);
    assert.equal(resolveLlmVision(model, ""), false, model);
  }
  assert.equal(llmModelAcceptsVision("claude-sonnet-5-5"), true);
  assert.equal(llmModelAcceptsVision("anthropic/claude-sonnet-4"), true);
  assert.equal(llmModelAcceptsVision("deepseek-v4-flash-vision-exp"), true);
  assert.equal(resolveLlmVision("deepseek-flash", "1"), true);
  assert.equal(resolveLlmVision("deepseek-flash", "true"), true);
  assert.equal(resolveLlmVision("claude-sonnet-5-5", "0"), false);
  assert.equal(resolveLlmVision("claude-sonnet-5-5", "no"), false);
  assert.equal(resolveLlmVision("claude-sonnet-5-5", "maybe"), false);
});

test("anthropic config uses ANTHROPIC_BASE_URL and ignores LLM_BASE_URL", () => {
  withLlmEnv(
    {
      LLM_PROVIDER: "anthropic",
      LLM_BASE_URL: "https://api.deepseek.com",
      LLM_API_KEY: "llm-key",
      ANTHROPIC_API_KEY: "ant-key",
      ANTHROPIC_MODEL: "claude-sonnet-5-5",
    },
    () => {
      const config = resolveLlmConfig();
      assert.equal(config.provider, "anthropic");
      assert.equal(config.baseUrl, undefined);
      assert.equal(config.apiKey, "ant-key");
      assert.equal(config.model, "claude-sonnet-5-5");
      assert.equal(config.vision, true);
    },
  );

  withLlmEnv(
    {
      LLM_PROVIDER: "anthropic",
      LLM_BASE_URL: "https://api.deepseek.com",
      ANTHROPIC_BASE_URL: "https://api.deepseek.com/anthropic/",
      ANTHROPIC_API_KEY: "ant-key",
      ANTHROPIC_MODEL: "deepseek-flash",
    },
    () => {
      const config = resolveLlmConfig();
      assert.equal(config.baseUrl, "https://api.deepseek.com/anthropic");
      assert.equal(config.model, "deepseek-flash");
      assert.equal(config.vision, false);
    },
  );

  withLlmEnv(
    {
      LLM_PROVIDER: "openai-compat",
      LLM_BASE_URL: "https://api.together.xyz/v1",
      LLM_API_KEY: "together-key",
      LLM_MODEL: "deepseek-ai/DeepSeek-V4-Flash-0731",
      ANTHROPIC_BASE_URL: "https://api.anthropic.com",
    },
    () => {
      const config = resolveLlmConfig();
      assert.equal(config.provider, "openai-compat");
      assert.equal(config.baseUrl, "https://api.together.xyz/v1");
      assert.equal(config.vision, false);
    },
  );

  withLlmEnv(
    {
      LLM_PROVIDER: "openai-compat",
      LLM_BASE_URL: "https://openrouter.ai/api/v1",
      LLM_API_KEY: "or-key",
      LLM_MODEL: "qwen/qwen3-coder-480b-a35b",
      LLM_VISION: "1",
    },
    () => {
      assert.equal(resolveLlmConfig().vision, true);
    },
  );

  withLlmEnv(
    {
      ANTHROPIC_API_KEY: "ant-key",
      LLM_BASE_URL: "https://api.deepseek.com",
      LLM_VISION: "0",
    },
    () => {
      const config = resolveLlmConfig();
      assert.equal(config.provider, "anthropic");
      assert.equal(config.baseUrl, undefined);
      assert.equal(config.model, "claude-sonnet-5-5");
      assert.equal(config.vision, false);
    },
  );
});

const shot: LlmMessage = {
  role: "user",
  content: [
    { type: "image", image: { mediaType: "image/jpeg", base64: "screenshot-bytes" } },
    { type: "text", text: "rebuild from the DOM" },
  ],
};

test("text-only chat bodies omit screenshots and vision models keep them", async () => {
  const original = globalThis.fetch;
  const bodies: Array<Record<string, unknown>> = [];
  globalThis.fetch = async (_input, init) => {
    bodies.push(JSON.parse(String(init?.body)));
    return new Response(
      JSON.stringify({
        choices: [{ message: { content: "export default function Page(){return null}" }, finish_reason: "stop" }],
        usage: { prompt_tokens: 1, completion_tokens: 2 },
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  };
  try {
    const textOnly = messagesForVision(flash, [shot]);
    assert.equal(JSON.stringify(textOnly).includes("screenshot-bytes"), false);
    assert.equal(JSON.stringify(textOnly).includes("image_url"), false);
    assert.equal(JSON.stringify(textOnly).includes("rebuild from the DOM"), true);

    await llmChat(flash, { system: "sys", messages: [shot], maxTokens: 100 });
    await llmChat(
      { ...flash, model: "deepseek-v4-flash-vision-exp", vision: true },
      { system: "sys", messages: [shot], maxTokens: 100 },
    );
    assert.equal(JSON.stringify(bodies[0]).includes("image_url"), false);
    assert.equal(JSON.stringify(bodies[0]).includes("screenshot-bytes"), false);
    assert.equal(JSON.stringify(bodies[0]).includes("rebuild from the DOM"), true);
    assert.deepEqual(bodies[0]?.thinking, { type: "disabled" });
    assert.equal(JSON.stringify(bodies[1]).includes("image_url"), true);
    assert.equal(JSON.stringify(bodies[1]).includes("screenshot-bytes"), true);
  } finally {
    globalThis.fetch = original;
  }
});
