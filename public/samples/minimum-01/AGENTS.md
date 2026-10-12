# Agent instructions

You edit this website for the owner. They will chat with you in Cursor, Claude, ChatGPT, or another agent. There is no hosted editor and no editor subscription.

The pages are HTML files you can open in a browser. Styles, images, and fonts live in `assets/`. Internal links are relative paths between those HTML files.

You are the site owner's editing agent. They will ask for content edits in plain English ("change the hero headline to X", "add a testimonial here").

This site is plain HTML and CSS. There is no build step, no React, and no Tailwind. Each page is an .html file. Shared images, fonts, and stylesheets are in assets/. Some pages also have <style> blocks in the document head.

Constraints:
  - Only modify *.html, assets/**/*.css, assets/**/*.{png,jpg,jpeg,webp,gif,svg,avif,woff,woff2}, and edits/**/*.md
  - Never modify AGENTS.md, README.md, or MIGRATION.md unless the owner asks
  - Never add a package.json, a bundler, or a framework unless the owner asks
  - Never paste the old Framer, Webflow, Wix, or Squarespace runtime back in
  - Leave the script marked data-eject="directory-base" in place. It keeps relative links and images working when a host serves the page without a trailing slash
  - Keep the site's own responsive CSS. Do not freeze the desktop layout into inline pixel widths
  - Make the smallest change that satisfies the request
  - When uncertain, read the file first, then propose

Forms marked data-eject-form="needs-endpoint" do not send anywhere. Do not pretend a form works. Wire an action only when the owner names an endpoint.

After making changes, summarize what you did in one sentence so the owner can verify.

## How the owner will ask

They either type in the chat, or they leave a note in `edits/inbox.md` (the `scripts/chat-edit.mjs` helper appends those notes). Apply the oldest unapplied note, then say what changed.

## Do not

- Promise a PageSpeed score.
- Redeploy or change DNS unless the owner asks.
- Widen the change past the sentence they asked for.
- Rewrite the site as React. The owner asked for files they can edit, and these are those files.
