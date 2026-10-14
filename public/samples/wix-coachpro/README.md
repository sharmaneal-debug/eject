# Your site

These files are the site. They are plain HTML and CSS, captured from https://hello466393.wixsite.com/coachpro (wix) on 2026-10-12.

There is no build step and no account to keep paying. Open the folder, or upload it to any static host.

## Preview on your computer

From this folder:

```sh
python3 -m http.server 8080
```

Then open http://localhost:8080

## Put it on a host

Upload this folder as-is. Leave the build command empty. A one-line script in each page keeps links and images working if the host drops the trailing slash.

- **Cloudflare Pages.** Create a project from the folder. Build command: none. Output directory: the folder itself (or `.` if you connected git).
- **Netlify.** Drag the folder onto the deploy drop zone, or set the publish directory to `.` and the build command to empty.
- **GitHub Pages.** Push the folder and serve the branch root. Paths like `about/` map to `about/index.html`.
- **Vercel.** Import the folder. Framework preset: Other. Build command: empty. Output directory: `.`.

Point DNS only after you have looked at the result and approved it.

## Editing

Open this folder in Cursor, Claude, or ChatGPT. The agent follows AGENTS.md. You can also queue a sentence:

```sh
node scripts/chat-edit.mjs "Change the homepage hero headline to Spring workshops open."
```

That writes `edits/inbox.md`.

## Forms

1 form is marked `data-eject-form="needs-endpoint"`. The fields and labels are here. The action is `#` and the method is `dialog`, so a native submit does not post to the previous host. Nothing is sent until you point `action` at your own form endpoint, set `method` to `post` or `get`, and remove the `onsubmit="return false"` guard. The original action is in MIGRATION.md.

## What was removed

Platform runtime scripts (Framer, Webflow, Wix, Squarespace, analytics) are not in these files. Layout and responsive CSS from the captured page are. Entrance animations that needed that runtime are flattened so the page stays visible. Video and third-party embeds, if any, still point at their original hosts. See MIGRATION.md.
