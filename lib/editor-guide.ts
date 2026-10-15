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

/**
 * Rules for a no-model static move: plain HTML and CSS, no build step.
 * The Next.js rules in EDITOR_SYSTEM_PROMPT do not apply to these files.
 */
export const STATIC_EDITOR_SYSTEM_PROMPT = `You are the site owner's editing agent. They will ask for content edits in plain English ("change the hero headline to X", "add a testimonial here").

This site is plain HTML and CSS. There is no build step, no React, and no Tailwind. Each page is an .html file. Shared images, fonts, and stylesheets are in assets/. Some pages also have <style> blocks in the document head.

Constraints:
  - Only modify *.html, assets/**/*.css, assets/**/*.{png,jpg,jpeg,webp,gif,svg,avif,woff,woff2}, and edits/**/*.md
  - Never modify AGENTS.md, README.md, EDITING.md, or MIGRATION.md unless the owner asks
  - Never add a package.json, a bundler, or a framework unless the owner asks
  - Never paste the old Framer, Webflow, Wix, or Squarespace runtime back in
  - Leave the script marked data-eject="directory-base" in place. It keeps relative links and images working when a host serves the page without a trailing slash
  - Keep the site's own responsive CSS. Do not freeze the desktop layout into inline pixel widths
  - Make the smallest change that satisfies the request
  - When uncertain, read the file first, then propose

Forms marked data-eject-form="needs-endpoint" cannot submit. The action is "#", the method is "dialog", and onsubmit returns false, so a native submit does not post to the previous host and does not reload the page. Submit buttons do not keep formaction or formmethod. The original action is in MIGRATION.md. Do not pretend a form works. When the owner names an endpoint, set the form action and method and remove onsubmit="return false". Do not put formaction or formmethod back on the button.

After making changes, summarize what you did in one sentence so the owner can verify.`;

export function staticAgentsMarkdown(): string {
  return `# Agent instructions

You edit this website for the owner. They will chat with you in Cursor, Claude, ChatGPT, or another agent. There is no hosted editor and no editor subscription.

The pages are HTML files you can open in a browser. Styles, images, and fonts live in \`assets/\`. Internal links are relative paths between those HTML files.

${STATIC_EDITOR_SYSTEM_PROMPT}

## How the owner will ask

They either type in the chat, or they leave a note in \`edits/inbox.md\` (the \`scripts/chat-edit.mjs\` helper appends those notes). Apply the oldest unapplied note, then say what changed.

## Do not

- Promise a PageSpeed score.
- Redeploy or change DNS unless the owner asks.
- Widen the change past the sentence they asked for.
- Rewrite the site as React. The owner asked for files they can edit, and these are those files.
`;
}

export function staticHostingReadme(opts: { sourceUrl: string; platform: string; capturedAt: string; formCount: number }): string {
  const forms =
    opts.formCount > 0
      ? `\n## Forms\n\n${opts.formCount} form${opts.formCount === 1 ? "" : "s"} ${opts.formCount === 1 ? "is" : "are"} marked \`data-eject-form="needs-endpoint"\`. The fields and labels are here. The action is \`#\` and the method is \`dialog\`, so a native submit does not post to the previous host. Submit buttons do not keep \`formaction\` or \`formmethod\`. Nothing is sent until you point the form \`action\` at your own endpoint, set \`method\` to \`post\` or \`get\`, and remove \`onsubmit="return false"\`. The original action is in MIGRATION.md.\n`
      : "";
  return `# Your site

These files are the site. They are plain HTML and CSS, captured from ${opts.sourceUrl} (${opts.platform}) on ${opts.capturedAt.slice(0, 10)}.

There is no build step and no account to keep paying. Open the folder, or upload it to any static host.

## Preview on your computer

From this folder:

\`\`\`sh
python3 -m http.server 8080
\`\`\`

Then open http://localhost:8080

## Put it on a host

Upload this folder as-is. Leave the build command empty. A one-line script in each page keeps links and images working if the host drops the trailing slash.

- **Cloudflare Pages.** Create a project from the folder. Build command: none. Output directory: the folder itself (or \`.\` if you connected git).
- **Netlify.** Drag the folder onto the deploy drop zone, or set the publish directory to \`.\` and the build command to empty.
- **GitHub Pages.** Push the folder and serve the branch root. Paths like \`about/\` map to \`about/index.html\`.
- **Vercel.** Import the folder. Framework preset: Other. Build command: empty. Output directory: \`.\`.

Point DNS only after you have looked at the result and approved it.

## Editing

The short guide is [EDITING.md](EDITING.md): open this folder in Cursor, Claude Code, or ChatGPT, ask for a change, preview it on your computer, then publish it.

You can also queue a sentence:

\`\`\`sh
node scripts/chat-edit.mjs "Change the homepage hero headline to Spring workshops open."
\`\`\`

That writes \`edits/inbox.md\`.
${forms}
## What was removed

Platform runtime scripts (Framer, Webflow, Wix, Squarespace, analytics) are not in these files. Layout and responsive CSS from the captured page are. Entrance animations that needed that runtime are flattened so the page stays visible. Video and third-party embeds, if any, still point at their original hosts. See MIGRATION.md.
`;
}

/**
 * Plain-language walkthrough for the owner of a static handoff.
 * AGENTS.md is for their agent. This file is for them.
 */
export function staticEditingGuideMarkdown(): string {
  return `# How to edit this site

You change this site by chatting with an AI agent you already use. There is no hosted editor and no editor subscription.

## Open the folder

Open this folder in Cursor, Claude Code, or ChatGPT. The agent reads \`AGENTS.md\` and follows it.

## Ask for a change

Say what you want in one sentence. Example: "Change the homepage hero headline to Spring workshops open."

Read the one-sentence summary the agent gives you. If it is wrong, say so and ask it to undo that change.

You can also leave the sentence in a file and come back later:

\`\`\`sh
node scripts/chat-edit.mjs "Change the homepage hero headline to Spring workshops open."
\`\`\`

That writes \`edits/inbox.md\`. The next time you open this folder, ask the agent to apply the oldest note.

## Preview on your computer

From this folder:

\`\`\`sh
python3 -m http.server 8080
\`\`\`

Open http://localhost:8080 and look at the page before you publish.

## Publish

Upload this folder as-is to a static host. Cloudflare Pages, Netlify, GitHub Pages, and Vercel each offer a free plan for static files. Use it when it fits the traffic. Leave the build command empty. A paid plan on the same host takes this same folder.

- **Cloudflare Pages.** Create a project from the folder. Build command: none. Output directory: the folder itself (or \`.\` if you connected git).
- **Netlify.** Drag the folder onto the deploy drop zone, or set the publish directory to \`.\` and the build command to empty.
- **GitHub Pages.** Push the folder and serve the branch root. Paths like \`about/\` map to \`about/index.html\`.
- **Vercel.** Import the folder. Framework preset: Other. Build command: empty. Output directory: \`.\`.

Open the URL the host gives you and check the page. Point your domain at it only after you have looked and approved it.
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
