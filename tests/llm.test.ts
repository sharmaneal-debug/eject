import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildOpenAICompatBody,
  isDeepSeekChatHost,
  llmChat,
  outputBudgetError,
  parseOpenAICompatChat,
  type LlmConfig,
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
