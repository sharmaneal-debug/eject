# How to edit this site

You change this site by chatting with an AI agent you already use. There is no hosted editor and no editor subscription.

## Open the folder

Open this folder in Cursor, Claude Code, or ChatGPT. The agent reads `AGENTS.md` and follows it.

## Ask for a change

Say what you want in one sentence. Example: "Change the homepage hero headline to Spring workshops open."

Read the one-sentence summary the agent gives you. If it is wrong, say so and ask it to undo that change.

You can also leave the sentence in a file and come back later:

```sh
node scripts/chat-edit.mjs "Change the homepage hero headline to Spring workshops open."
```

That writes `edits/inbox.md`. The next time you open this folder, ask the agent to apply the oldest note.

## Preview on your computer

From this folder:

```sh
python3 -m http.server 8080
```

Open http://localhost:8080 and look at the page before you publish.

## Publish

Upload this folder as-is to a static host. Cloudflare Pages, Netlify, GitHub Pages, and Vercel each offer a free plan for static files. Use it when it fits the traffic. Leave the build command empty. A paid plan on the same host takes this same folder.

- **Cloudflare Pages.** Create a project from the folder. Build command: none. Output directory: the folder itself (or `.` if you connected git).
- **Netlify.** Drag the folder onto the deploy drop zone, or set the publish directory to `.` and the build command to empty.
- **GitHub Pages.** Push the folder and serve the branch root. Paths like `about/` map to `about/index.html`.
- **Vercel.** Import the folder. Framework preset: Other. Build command: empty. Output directory: `.`.

Open the URL the host gives you and check the page. Point your domain at it only after you have looked and approved it.
