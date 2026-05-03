---
title: "The Playbook"
slug: "playbook"
description: "The master walkthrough. From URL paste to live site, in an afternoon. Every step, every prompt, every gotcha."
order: 1
icon: "01"
estimatedMinutes: 240
---

# The Playbook

This is the master document. Open the other kit pages as you need them. Work through this start to finish and you will end up with a real, deployed website you own — built by your AI of choice, supervised by you.

**Time required:** about 4 hours total, in a single afternoon, if your site is under 30 pages. Bigger sites take a second session.

**What you need before you start:**
- The URL of your current site (Webflow, Framer, Wix, or Squarespace)
- Free account on either ChatGPT, Claude, Gemini, or Cursor
- A free GitHub account
- Your domain registrar login (where you bought your domain)
- About 4 hours of focused time

If you are missing any of these, fix that first. The rest of the playbook assumes all of them are sorted.

---

## Phase 1: Setup (15 min)

### Step 1.1: Create your project folder
Open your terminal. Don't have one open? On Mac, search "Terminal" in Spotlight. On Windows, open PowerShell. On a Chromebook, use the Linux terminal.

Type:
```bash
mkdir my-site
cd my-site
```

That makes a folder for your project and moves into it. Done.

### Step 1.2: Download the starter template
The starter is a small Next.js + Tailwind project the AI will fill in. Download it from GitHub (we link the latest version in your kickoff email) or run:

```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --no-eslint --import-alias "@/*"
```

Press Enter through any prompts (defaults are fine). Wait about 60 seconds for it to install.

Verify it works:
```bash
npm run dev
```

Open `http://localhost:3000` in your browser. You should see the default Next.js welcome screen. If you do, kill the server (Ctrl+C in the terminal) and continue.

### Step 1.3: Open the project in your AI

Pick one:
- **Cursor:** Download from cursor.com. Open Cursor. File → Open Folder → pick `my-site`.
- **ChatGPT or Claude or Gemini:** Open the chat in your browser. You will copy/paste files manually. Slower but works on free tier.

If you are not technical and the terminal made you nervous, switch to ChatGPT in browser. The rest of the playbook works fine that way; you'll just paste file contents in and out instead of having the AI write them directly.

---

## Phase 2: Capture your old site (30 min)

### Step 2.1: Open Prompt 1 from the prompt library

Go to the prompts page. Find **Prompt 1: Site analysis**. Copy it.

### Step 2.2: Run Prompt 1

Paste it into your AI. Replace `[YOUR_SITE_URL]` with your real URL. Hit send.

The AI will respond with a structured plan: how many pages it sees, what platform you are on, what design tokens it detects, which sections it identifies. This becomes your build plan for Phase 3.

If the AI says it cannot fetch your URL: that means it does not have web access. Open your site in a browser, "view source" (Cmd+Option+U on Mac, Ctrl+U on Windows), copy the entire HTML, and paste it back in with: "Here is the HTML of my homepage. Analyze it as before."

### Step 2.3: Save the AI's response

Copy the AI's analysis. Save it as `notes.md` in your project folder. You'll reference it through the rest of the build.

---

## Phase 3: Rebuild (2–3 hours)

This is the bulk of the work. You'll go page by page. Each page takes 5–15 minutes.

### Step 3.1: Identify your pages

Look at your `notes.md`. It lists every page. Pick the homepage first.

### Step 3.2: Open Prompt 2 from the prompt library

**Prompt 2: Page rebuild.** Copy it. Paste it into your AI. Replace `[PAGE_URL]` with your homepage URL. Replace `[PAGE_NAME]` with `home`.

### Step 3.3: Let the AI rebuild the page

The AI will write a `app/page.tsx` file (for the homepage) or `app/[name]/page.tsx` (for other pages). 

**If you're using Cursor:** the AI writes the file directly. Verify it looks right.

**If you're using ChatGPT/Claude/Gemini in browser:** the AI gives you the file contents in a code block. Copy the whole block. In your project folder, create the file at the path the AI specifies. Paste the contents in. Save.

### Step 3.4: Preview

Run `npm run dev` again. Open `http://localhost:3000`. You should see your rebuilt homepage. Compare it side-by-side with your old site (open both in two browser windows).

If something looks off:
- Wrong colors → run **Prompt 3: Fix design tokens**
- Missing image → check the image URL is right; run **Prompt 4: Fix images**
- Wrong layout → tell the AI: "the [section name] is displayed wrong, look at [old URL] and fix it"

### Step 3.5: Repeat for every page

For each remaining page in your `notes.md`, repeat steps 3.2 through 3.4. Tip: open multiple AI conversations in tabs and rebuild pages in parallel.

### Step 3.6: Migrate your blog (if you have one)

If your old site has a blog: run **Prompt 5: Blog migration**. This pulls every post and saves them as `.md` files in `content/blog/`.

---

## Phase 4: Wire up the small stuff (30 min)

### Step 4.1: Forms

If your old site had a contact form: run **Prompt 6: Forms with Resend**. Sign up for Resend (free, 100 emails/day). Add the API key to `.env.local`. The AI wires up a `/api/contact` route that emails submissions to you.

### Step 4.2: Redirects

So your Google rankings don't tank. Run **Prompt 7: 301 redirects**. Paste in the URL list from Phase 2. The AI writes a `next.config.mjs` `redirects()` block that points every old URL to the new one.

### Step 4.3: Sitemap + robots.txt

Run **Prompt 8: Sitemap and robots**. Auto-generates `app/sitemap.ts` and `app/robots.ts`.

### Step 4.4: Favicon + OG image

Run **Prompt 9: Favicon and OG**. Generates a simple favicon and a per-page OG image route.

---

## Phase 5: Deploy (10 min)

Open the **Deploy Guide** kit page. Pick one host (we recommend Cloudflare Pages — truly free for small sites). Follow it step by step.

When you're done, your site is live at a URL like `your-site-abc123.pages.dev` or `your-site.vercel.app`.

---

## Phase 6: Domain cutover (5 min)

This is the moment. Open the deploy guide section on **Custom Domain**. Add your real domain to your hosting provider. Update the DNS record at your registrar. Wait 5–30 minutes. Visit your domain.

You're live. Go check your old hosting account and cancel the subscription. That's the moment Eject earns its $49.

---

## Phase 7: Set up the AI editor (5 min)

So you can change anything later without re-doing this whole playbook.

Open the **AI Editing Kit** page. Copy the Instruction File. Save it once into the AI of your choice as a saved prompt or "custom instructions." After that, you just say things like "change my hero headline to X" and the AI edits the file directly.

---

## You're done

A few things you should also do this week:
1. Submit your sitemap to Google Search Console (10 min). Your traffic is tied to this.
2. Tell your team / customers nothing has changed (it hasn't, except your bill).
3. If you used the Express tier and have any feedback or got stuck, email hi@ejectfrom.com. We read every reply.

You now own your website. Forever.
