#!/usr/bin/env tsx
/**
 * Eject — chat editor (CLI prototype)
 * -----------------------------------
 * The chat-driven editor that maintains a migrated site. This CLI version
 * demonstrates the loop without GitHub OAuth or hosted deploy:
 *
 *   1. user types an instruction
 *   2. Claude reads the local repo (whitelist of editable files)
 *   3. proposes an edit as a unified diff
 *   4. user approves; we apply + commit on a preview branch
 *   5. (in the hosted version) Cloudflare Pages auto-builds the preview URL
 *
 * The hosted version replaces stdin/stdout with a Next.js chat UI and the
 * local filesystem with a GitHub App writing PRs.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... pnpm tsx scripts/editor.ts ./out/example-com
 */

import Anthropic from "@anthropic-ai/sdk";
import { readFile, writeFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { execSync } from "node:child_process";

const EDITABLE_GLOBS = [/^app\/.*\.(tsx|mdx|md|json)$/, /^content\/.*\.(md|mdx|json)$/, /^components\/.*\.tsx$/];

const SYSTEM_PROMPT = `You are Eject's chat editor. The user is a non-technical owner of a Next.js marketing site. They will ask for content edits in plain English ("change the hero headline to X", "add a testimonial here").

You have these tools available:
  - read_file(path)
  - write_file(path, contents)
  - list_files(prefix)

Constraints:
  - Only modify files matching: app/**/*.{tsx,mdx,md,json}, content/**/*.{md,mdx,json}, components/**/*.tsx
  - Never modify package.json, tailwind.config.ts, next.config.mjs, .env, .github
  - Never invent new files unless explicitly asked
  - Preserve TypeScript correctness; never delete imports that are still in use
  - Make the smallest change that satisfies the request
  - When uncertain, read the file first, then propose

After making changes, summarize what you did in one sentence so the user can verify.`;

async function listEditableFiles(root: string, prefix = ""): Promise<string[]> {
  const dir = path.join(root, prefix);
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const out: string[] = [];
  for (const e of entries) {
    if (e.name.startsWith(".") || e.name === "node_modules" || e.name === ".next") continue;
    const rel = path.join(prefix, e.name);
    if (e.isDirectory()) {
      out.push(...(await listEditableFiles(root, rel)));
    } else if (EDITABLE_GLOBS.some((re) => re.test(rel))) {
      out.push(rel);
    }
  }
  return out;
}

function isEditable(rel: string) {
  return EDITABLE_GLOBS.some((re) => re.test(rel));
}

async function run() {
  const projectRoot = process.argv[2];
  if (!projectRoot) {
    console.error("usage: pnpm tsx scripts/editor.ts <project-root>");
    process.exit(2);
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("error: ANTHROPIC_API_KEY required");
    process.exit(1);
  }

  const root = path.resolve(projectRoot);
  await stat(root); // throws if missing

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const rl = readline.createInterface({ input, output });

  console.log(`Eject editor · ${root}`);
  console.log(`type your edit in plain English. /quit to exit.\n`);

  const conversation: Anthropic.MessageParam[] = [];

  while (true) {
    const userInput = (await rl.question("> ")).trim();
    if (!userInput) continue;
    if (userInput === "/quit" || userInput === "/exit") break;

    conversation.push({ role: "user", content: userInput });

    const editableList = await listEditableFiles(root);

    const resp = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      tools: [
        {
          name: "read_file",
          description: "Read an editable file in the project. Path is repo-relative.",
          input_schema: {
            type: "object",
            properties: { path: { type: "string" } },
            required: ["path"],
          },
        },
        {
          name: "write_file",
          description: "Overwrite an editable file with new contents. Path is repo-relative.",
          input_schema: {
            type: "object",
            properties: { path: { type: "string" }, contents: { type: "string" } },
            required: ["path", "contents"],
          },
        },
        {
          name: "list_files",
          description: "List editable files in the project (optionally filtered by prefix).",
          input_schema: {
            type: "object",
            properties: { prefix: { type: "string" } },
          },
        },
      ],
      messages: conversation,
    });

    // Process tool calls in a loop until the model is done.
    let pending = resp;
    while (pending.stop_reason === "tool_use") {
      const toolBlocks = pending.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const tu of toolBlocks) {
        const args = tu.input as Record<string, string>;
        try {
          if (tu.name === "list_files") {
            const filtered = editableList.filter((f) => !args.prefix || f.startsWith(args.prefix));
            toolResults.push({ type: "tool_result", tool_use_id: tu.id, content: filtered.join("\n") });
          } else if (tu.name === "read_file") {
            if (!isEditable(args.path)) {
              toolResults.push({ type: "tool_result", tool_use_id: tu.id, content: "error: not in editable allowlist", is_error: true });
              continue;
            }
            const text = await readFile(path.join(root, args.path), "utf8");
            toolResults.push({ type: "tool_result", tool_use_id: tu.id, content: text });
          } else if (tu.name === "write_file") {
            if (!isEditable(args.path)) {
              toolResults.push({ type: "tool_result", tool_use_id: tu.id, content: "error: not in editable allowlist", is_error: true });
              continue;
            }
            const confirmed = (await rl.question(`apply edit to ${args.path}? [y/N] `)).trim().toLowerCase();
            if (confirmed !== "y") {
              toolResults.push({ type: "tool_result", tool_use_id: tu.id, content: "user declined" });
              continue;
            }
            await writeFile(path.join(root, args.path), args.contents, "utf8");
            try {
              execSync(`git add "${args.path}" && git commit -m "edit: ${userInput.slice(0, 60)}"`, {
                cwd: root,
                stdio: "ignore",
              });
            } catch {
              /* not a git repo or nothing to commit; non-fatal */
            }
            toolResults.push({ type: "tool_result", tool_use_id: tu.id, content: `wrote ${args.path}` });
          }
        } catch (err) {
          toolResults.push({ type: "tool_result", tool_use_id: tu.id, content: `error: ${(err as Error).message}`, is_error: true });
        }
      }

      conversation.push({ role: "assistant", content: pending.content });
      conversation.push({ role: "user", content: toolResults });

      pending = await client.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        tools: resp.usage ? (resp as any).tools ?? [] : [],
        messages: conversation,
      });
    }

    const finalText = pending.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    if (finalText) console.log("\n" + finalText + "\n");
    conversation.push({ role: "assistant", content: pending.content });
  }

  rl.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
