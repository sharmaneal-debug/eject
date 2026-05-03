---
title: "AI Editing Kit"
slug: "editor"
description: "After your site is live, edit it forever by chatting with any AI. The instruction file + 100+ ready-to-paste prompts."
order: 4
icon: "04"
estimatedMinutes: 10
---

# AI Editing Kit

Once your site is live, you don't need us anymore. Edit anything by chatting with the AI of your choice. ChatGPT, Claude, Gemini, Cursor — free tiers all work.

The setup is one-time, ~10 minutes. After that you just type what you want changed.

---

## Step 1: Set up the AI to read your site

You need to give your AI access to your site files. There are three ways depending on which AI you use.

### If you use Cursor

Easiest path. Cursor reads your project folder by default.

1. Open Cursor.
2. **File → Open Folder** → pick the folder of your migrated site.
3. Open the chat sidebar (`Cmd-L` on Mac, `Ctrl-L` on Windows).
4. Cursor knows about every file. Skip to Step 2.

### If you use ChatGPT or Claude in browser

Slightly more manual. Two options:

**Option A — Claude Projects or ChatGPT Custom GPTs (recommended):**
- Claude.ai → Projects → New Project → upload all your site files (drag the folder in).
- ChatGPT → Custom GPTs → Knowledge → upload the files.
- Now Claude / ChatGPT has them in context permanently.

**Option B — Paste files manually:**
- When you want to edit something, paste the relevant file contents into the chat first.
- Slower but works on any free tier.

### If you use Gemini

Gemini supports file uploads in the free tier. Upload all your project files at the start of a conversation.

---

## Step 2: Paste this Instruction File once

Copy the entire block below. Paste it into your AI as the very first message of a new conversation (or save it as a "Custom Instruction" / "System Prompt" if your AI supports it).

```
You are editing my website for me. The site lives in a folder called my-site. Each page is a Next.js TSX file in app/. Each blog post is a markdown file in content/blog/. The styling uses Tailwind CSS with my design tokens defined in tailwind.config.ts.

When I ask for a change:
1. Find the right file (I'll tell you the page name if I know it; otherwise scan the project).
2. Make the smallest change that does what I asked.
3. Show me what you changed (a diff, or just the new contents) before saving.
4. After I confirm, save the file.

Don't change colors, fonts, or layout unless I specifically ask. Don't add things I didn't ask for. If you're unsure what I meant, ask one clarifying question instead of guessing.

My website's tone is friendly and clear. We don't use emojis or exclamation points unless I do. We don't use em-dashes (the long horizontal line); use periods or commas instead.

Stack details:
- Next.js 15 with App Router
- TypeScript
- Tailwind CSS for all styling
- Markdown for blog posts (with gray-matter for frontmatter)
- Resend for transactional email (if I have a contact form)
- Cloudflare Pages / Vercel / Netlify for hosting

If you make a change and the build breaks, immediately roll back to the previous version of the file and tell me what went wrong.

Acknowledge you've read this with: "Ready. What do you want to change?"
```

The AI will respond with "Ready. What do you want to change?". You're set.

---

## Step 3: Just say what you want

Below are 100+ example prompts. Copy any of them, replace the bracketed parts with your real values, paste into your AI.

### Headline + copy

> Change my homepage hero headline to: "We make handmade leather goods in Brooklyn."

> Update the subtitle on my about page to mention we ship internationally.

> Replace the word "amazing" with "great" everywhere on the site.

> Soften the tone on the pricing page; less aggressive, more inviting.

> Add a one-line tagline under my logo in the header: "Coffee, but better."

### Sections

> Add a new testimonials section after the features. The quote is "Best coffee I've had in years." Author: Sarah K., regular customer.

> Remove the "About the founder" block from the homepage. Keep it on the About page.

> Move the booking button to the top of the homepage, before the hero text.

> Add a FAQ section to the bottom of the pricing page with these 5 questions: [list them].

> Duplicate the testimonials section onto the contact page.

### Pricing

> Change my pricing from $99/month to $129/month everywhere it appears.

> Add a new $49 starter tier between Free and Pro on the pricing page.

> Update the "Save 20% annually" callout to say "Save 30% annually" and change the math.

### Blog

> Write a 600-word blog post titled "5 things every small business website needs" in my usual tone. File it under content/blog/.

> Add a new blog post about my recent trip to Italy. Make it about 800 words, casual, with 3 photo placeholder spots.

> Pull the blog post titled "Coffee 101" and turn its key points into bullet form.

> Add tags to all my blog posts based on their content.

> Sort the blog index by date instead of alphabetically.

### Images

> Replace the photo on my About page with the new one I just uploaded to /public/team-2026.jpg.

> Add a hero background image. Use /public/hero-bg.jpg. Make it cover the full hero section, with a dark gradient overlay so the white text on top stays readable.

> Compress all images in /public/ to WebP format if they're not already.

> Add an alt text to every image that doesn't have one.

### Contact + forms

> Change my contact email everywhere from old@example.com to hi@yourdomain.com.

> Add a phone number to the contact page: (555) 123-4567.

> Add a "Subject" dropdown to the contact form with options: General question, Quote request, Press, Other.

> Wire the contact form to send to my Slack via webhook instead of email.

### Layout + design

> Add a sticky header that hides when scrolling down and reappears when scrolling up.

> Make the homepage hero full viewport height on desktop, but auto on mobile.

> Add some breathing room around the testimonials section. Maybe 80px top and bottom on desktop.

> Center the footer on mobile.

> Add a thin orange line under each section heading.

### SEO + meta

> Add proper Open Graph images to every page. Use the brand color and page title.

> Update the meta description on the homepage to: "Handmade leather goods, made to order in Brooklyn since 2018."

> Add schema.org Organization markup to the homepage.

> Add a canonical link to every page.

> Generate FAQPage schema for the FAQ section on the homepage.

### Performance

> Run a Lighthouse check; tell me what's slowing the site down.

> Lazy-load all images below the fold.

> Add a max-width to the article content on blog posts (~700px) for better readability.

> Compress every image in /public/ that's over 200KB.

### Branding

> The brand color shifted slightly. Update everywhere from #FF5C2A to #FF6A40.

> Replace my old logo at /public/logo.svg with the new one I uploaded.

> Switch from Inter to Plus Jakarta Sans throughout. Keep the weights the same.

### Misc

> The contact page typo: change "recieve" to "receive".

> Add a 404 page that shows a sitemap-style list of my main pages.

> Add a "back to top" button on long pages.

> Add a cookie banner (use a small one at the bottom; lawyer-approved minimal).

> Move every page that's currently /about, /contact, /pricing under a top-level menu, but don't change the URLs.

---

## When the AI gets stuck

Sometimes the AI will say "I'm not sure" or make a change you didn't ask for. Three things to do:

1. **Be more specific.** Instead of "make it look better", say "make the hero font 20% larger and add 40px of padding above it".
2. **Show, don't tell.** Paste a screenshot of what's wrong. Most AIs accept images.
3. **Reset the conversation.** If you've been chatting for a while, start fresh and re-paste the instruction file. Long conversations drift.

If the AI breaks the build (a syntax error, a missing import), it should auto-rollback per the instruction file. If it doesn't:

- `git status` to see what changed
- `git checkout .` to discard everything (you'll lose the broken edit but be able to start over)
- Try the prompt again, more specifically

---

## A few more tips

**Save your common prompts.** As you find ones you use a lot, save them as Custom Instructions / saved prompts in your AI tool.

**Make small changes.** One file at a time. One sentence at a time. The AI is much better at small focused diffs than big sweeping rewrites.

**Always preview before deploying.** Run `npm run dev` and click around your site before committing. The AI doesn't catch every visual regression.

**Commit often.** Use git. After every successful change, `git add . && git commit -m "what you changed"`. That way if anything goes wrong tomorrow, you can roll back to today.

---

That's the kit. Make it yours.
