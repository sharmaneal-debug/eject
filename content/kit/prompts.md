---
title: "AI Agent Prompts"
slug: "prompts"
description: "Copy-paste prompts for ChatGPT, Claude, Gemini, or Cursor. Each prompt does one job in the rebuild."
order: 2
icon: "02"
estimatedMinutes: 0
---

# AI Agent Prompts

Copy each prompt into your AI of choice. Replace the `[PLACEHOLDERS]` with your real values. Free tiers of ChatGPT, Claude, Gemini, and Cursor all work.

These prompts work in any order, but they're numbered to match the playbook phases.

---

## Prompt 1: Site analysis

> I am rebuilding my website on Next.js 15 + Tailwind. My current site is at `[YOUR_SITE_URL]`. 
>
> Visit my homepage and any pages linked in the main navigation. For each, tell me:
> 1. The page name and URL
> 2. The major sections (hero, features, testimonials, pricing, footer, etc.)
> 3. Any unusual interactions (animations, modals, video embeds, forms)
> 4. The platform I am on (Webflow / Framer / Wix / Squarespace / something else)
>
> Then list the design tokens you can detect:
> - Primary brand color (hex)
> - Secondary color (hex)
> - Heading font name
> - Body font name
> - Border radius style (sharp / soft / pill)
>
> Output the result as a markdown checklist I can save as `notes.md`. Be terse; this is a build plan, not a sales pitch.

---

## Prompt 2: Page rebuild

> I am building a Next.js 15 + Tailwind site. My current page lives at `[PAGE_URL]`. The page name is `[PAGE_NAME]`.
>
> Visit the URL. Rebuild it as a Next.js App Router page in TypeScript using only Tailwind classes. The output should:
> - Match the original layout, copy, and structure
> - Use semantic HTML (`<header>`, `<main>`, `<section>`, `<footer>`)
> - Use the design tokens from my `notes.md` (paste them here if not already in our conversation)
> - Replace platform-specific markup (Webflow class names, Framer canvas divs) with idiomatic React + Tailwind
> - Use `<Image>` from `next/image` for images with absolute URLs
> - Preserve copy verbatim. Do not invent, summarize, or translate
> - Be one file, under 800 lines, no TODOs, no placeholders
>
> Save it as:
> - `app/page.tsx` if `PAGE_NAME` is `home`
> - `app/[PAGE_NAME]/page.tsx` otherwise
>
> If the page has repeating cards/items, build them as a typed array constant at the top and map over it in JSX.

---

## Prompt 3: Fix design tokens

> The colors / fonts on the rebuild don't match the original. Open `[PAGE_URL]` again. Compare against the file I just generated.
>
> Update my `tailwind.config.ts` so the colors and fonts match exactly. Use the actual hex values from the original site (use the browser's dev tools color picker). Then update the affected files to reference the new tokens.

---

## Prompt 4: Fix images

> The image at `[SECTION_NAME]` on `[PAGE_NAME]` is broken or wrong. Open `[PAGE_URL]`. Find the actual image URL there. Update my Next.js file to use that URL.
>
> If the image is a background, make sure it stays as a background. If it's a foreground photo, use `<Image>`.

---

## Prompt 5: Blog migration

> My old site has a blog at `[BLOG_INDEX_URL]`. I want to migrate every post to my Next.js site.
>
> For each blog post:
> 1. Visit the post URL
> 2. Pull the title, date, author (if any), description, and full body content
> 3. Save it as `content/blog/[slug].md` with frontmatter (title, slug, description, date)
>
> Then create:
> - `app/blog/page.tsx` — index that lists all posts (newest first)
> - `app/blog/[slug]/page.tsx` — renders one post
> - `lib/posts.ts` — small helper that reads the markdown files
>
> Use `gray-matter` to parse frontmatter and `react-markdown` + `remark-gfm` + `rehype-slug` to render the body. Style with Tailwind. Keep article width to 680px for readability.

---

## Prompt 6: Forms with Resend

> My contact form at `[FORM_URL]` should email submissions to `[YOUR_EMAIL]`. 
>
> 1. Sign me up flow: I'll go to resend.com, create a free account, get an API key. Tell me what to do exactly.
> 2. Once I have the key, write a `/api/contact` route handler that takes a POST with name + email + message, validates them, and uses Resend to send the email to `[YOUR_EMAIL]`.
> 3. Wire up the form on my Next.js site to POST to this route. Show success and error states.
>
> Free tier of Resend covers 3,000 emails/month. We will not exceed that.

---

## Prompt 7: 301 redirects

> Here is the list of every URL my old site has (paste from your `notes.md`):
>
> ```
> [PASTE URL LIST HERE]
> ```
>
> For my new Next.js site, write `next.config.mjs` with a `redirects()` function that 301s every old URL to its new equivalent. The new structure is:
> - `/` → keep as-is
> - `/blog/[slug]` → keep slug
> - other pages → keep at the same path under `/`
>
> Output the entire `next.config.mjs` file, not just the diff.

---

## Prompt 8: Sitemap and robots

> Generate `app/sitemap.ts` (Next.js App Router auto-sitemap) that:
> 1. Lists every page on my site
> 2. Sets the homepage priority to 1.0 and others to 0.7
> 3. Sets `lastModified` to today
>
> Also generate `app/robots.ts` that allows all bots and points to my sitemap.

---

## Prompt 9: Favicon and OG image

> Generate:
> 1. A simple SVG favicon for my site at `app/icon.svg`. Use my brand color from `notes.md`. Make it square, with a single letter or symbol matching my brand.
> 2. An apple-touch-icon at `app/apple-icon.svg`, same style at 180x180.
> 3. A dynamic OG image route at `app/og/route.tsx` using `next/og`. It should accept `?title=...` and `?subtitle=...` query params and render a 1200x630 image with my brand color and the text overlaid.

---

## Prompt 10: SEO + performance check

> The site is built. Before I ship, run a checklist:
>
> 1. Every page has a unique `<title>` under 60 characters
> 2. Every page has a `<meta description>` between 120 and 160 characters
> 3. Every image has an `alt` attribute
> 4. The page that should be H1 has exactly one H1
> 5. Mobile responsive (no horizontal scroll on any viewport)
> 6. Color contrast at least 4.5:1 for body text
>
> Tell me what's broken. For anything I should fix, give me the file and the fix.

---

## Editor prompts (after launch)

These work after you've installed the AI Editing Kit instruction file. Type them into your AI:

### Change a headline
> Change my homepage hero headline to: `[NEW_HEADLINE]`

### Add a section
> Add a new testimonials section after the features. The quote is `[QUOTE]`. The author is `[NAME]`, [TITLE] at [COMPANY].

### Update pricing
> Change my pricing on the homepage from $[OLD] to $[NEW]. Make sure the pricing page also gets updated.

### Add a blog post
> Write a [WORD_COUNT]-word blog post titled "[TITLE]" in my usual tone. Save it under `content/blog/`.

### Replace a photo
> Replace the photo on my About page with the new one I uploaded to `/public/[FILENAME]`.

### Fix a typo
> On my [PAGE] page, change "[OLD_TEXT]" to "[NEW_TEXT]".

### Update contact info
> Change my email everywhere from `[OLD]` to `[NEW]`.

### Change a button
> Move the [BUTTON_LABEL] button to [LOCATION]. Keep the same link.

---

If a prompt isn't working the way you expect: rephrase. Be more specific. Tell the AI what looked wrong and ask it to retry. The whole point of using AI is the iteration loop costs you nothing.
