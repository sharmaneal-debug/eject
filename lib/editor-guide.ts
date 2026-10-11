/**
 * Shared rules for scripts/editor.ts and for the AGENTS.md written into a
 * customer repo. The customer edits with their own agent. This file is the
 * instruction set that agent should follow.
 */

export const EDITABLE_FILE_PATTERNS: readonly RegExp[] = [
  /^app\/.*\.(tsx|mdx|md|json)$/,
  /^content\/.*\.(md|mdx|json)$/,
  /^components\/.*\.tsx$/,
  /^edits\/.*\.md$/,
];

export const EDITOR_SYSTEM_PROMPT = `You are the site owner's editing agent. They will ask for content edits in plain English ("change the hero headline to X", "add a testimonial here").

Constraints:
  - Only modify files matching: app/**/*.{tsx,mdx,md,json}, content/**/*.{md,mdx,json}, components/**/*.tsx, edits/**/*.md
  - Never modify package.json, tailwind.config.ts, next.config.mjs, .env, .github, or AGENTS.md
  - Never invent new files unless explicitly asked
  - Preserve TypeScript correctness; never delete imports that are still in use
  - Make the smallest change that satisfies the request
  - When uncertain, read the file first, then propose

After making changes, summarize what you did in one sentence so the owner can verify.`;

export function isEditablePath(rel: string): boolean {
  const normalized = rel.replace(/\\/g, "/").replace(/^\.\//, "");
  return EDITABLE_FILE_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function agentsMarkdown(): string {
  return `# Agent instructions

You edit this website for the owner. They will chat with you in Cursor, Claude, ChatGPT, or another agent. There is no hosted Eject editor and no editor subscription.

${EDITOR_SYSTEM_PROMPT}

## How the owner will ask

They either type in the chat, or they leave a note in \`edits/inbox.md\` (the \`scripts/chat-edit.mjs\` helper appends those notes). Apply the oldest unapplied note, then say what changed.

## Do not

- Promise a PageSpeed score.
- Redeploy or change DNS unless the owner asks.
- Widen the change past the sentence they asked for.
`;
}

export function editingPlaybookMarkdown(opts: { tierName: string; handoffMinutes: number; revisionRounds: number }): string {
  return `# Editing playbook

The point of this site is that you can change it by chatting with your own agent.

## Everyday edits

1. Open this folder in Cursor, Claude, or ChatGPT.
2. The agent reads \`AGENTS.md\` before it edits.
3. Say what you want in one sentence. Example: "Change the homepage hero headline to Spring workshops open."
4. Read the one-sentence summary the agent gives you. If it is wrong, say so. The agent should revert, not pile on a second change.

You can also queue a note without opening a chat:

\`\`\`sh
node scripts/chat-edit.mjs "Change the homepage hero headline to Spring workshops open."
\`\`\`

That writes \`edits/inbox.md\`. Your agent applies it on the next session.

## Optional CLI

If you have an Anthropic API key and the Eject repo, the same rules run in the terminal:

\`\`\`sh
pnpm editor <this-folder>
\`\`\`

That command is \`scripts/editor.ts\` in the Eject repo. It is optional. Your own agent is the editor we expect you to use.

## What this handoff includes

- Tier: ${opts.tierName}.
- Included revisions on the done-for-you tier: ${opts.revisionRounds} rounds.
- Included handoff call on the done-for-you tier: ${opts.handoffMinutes} minutes.
- After that, edits are yours, with your agent, at no Eject subscription.
`;
}

export function lightweightEditorScript(): string {
  return `#!/usr/bin/env node
/**
 * Queue a plain-English edit for your own agent.
 * Does not call a model and does not charge anyone.
 *
 *   node scripts/chat-edit.mjs "Change the hero headline to ..."
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const note = process.argv.slice(2).join(" ").trim();
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const inboxDir = path.join(root, "edits");
const inbox = path.join(inboxDir, "inbox.md");

if (!note) {
  console.log("Usage: node scripts/chat-edit.mjs \\"change the hero headline to ...\\"");
  console.log("Then open this folder in Cursor, Claude, or ChatGPT.");
  console.log("The agent should follow AGENTS.md and apply edits/inbox.md.");
  process.exit(0);
}

fs.mkdirSync(inboxDir, { recursive: true });
const block = "\\n## " + new Date().toISOString() + "\\n\\n" + note + "\\n";
fs.appendFileSync(inbox, block);
console.log("Saved edits/inbox.md");
console.log("Ask your agent to apply it. The rules are in AGENTS.md.");
`;
}
