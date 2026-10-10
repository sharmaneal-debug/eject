import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { test } from "node:test";

function run(command: string, args: string[], env: NodeJS.ProcessEnv = process.env): Promise<{ code: number | null; output: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { env, cwd: process.cwd() });
    let output = "";
    child.stdout.on("data", (chunk) => {
      output += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      output += String(chunk);
    });
    child.on("error", reject);
    child.on("exit", (code) => resolve({ code, output }));
  });
}

test("pnpm crawl with no args prints usage and does not hit top-level await", { timeout: 60_000 }, async () => {
  const result = await run("pnpm", ["crawl"]);
  assert.equal(result.code, 2);
  assert.match(result.output, /usage: pnpm crawl/);
  assert.doesNotMatch(result.output, /top-level await|__name is not defined|ERR_REQUIRE_ASYNC_MODULE/);
});

test("setup-stripe refuses a live key without printing it", { timeout: 60_000 }, async () => {
  const liveKey = "sk_live_example_not_used";
  const result = await run("pnpm", ["exec", "tsx", "scripts/setup-stripe.ts"], {
    ...process.env,
    STRIPE_SECRET_KEY: liveKey,
  });
  assert.equal(result.code, 1);
  assert.match(result.output, /refusing a live Stripe key/);
  assert.equal(result.output.includes(liveKey), false);
});
