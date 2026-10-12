#!/usr/bin/env node
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
  console.log("Usage: node scripts/chat-edit.mjs \"change the hero headline to ...\"");
  console.log("Then open this folder in Cursor, Claude, or ChatGPT.");
  console.log("The agent should follow AGENTS.md and apply edits/inbox.md.");
  process.exit(0);
}

fs.mkdirSync(inboxDir, { recursive: true });
const block = "\n## " + new Date().toISOString() + "\n\n" + note + "\n";
fs.appendFileSync(inbox, block);
console.log("Saved edits/inbox.md");
console.log("Ask your agent to apply it. The rules are in AGENTS.md.");
