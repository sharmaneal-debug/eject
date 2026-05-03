---
title: "Edit Your Website with ChatGPT (No Coding Required)"
slug: "edit-website-with-chatgpt"
description: "If your website lives in a folder of files, any AI can edit it. ChatGPT, Claude, Cursor. Free tiers all work. Here's the setup, 12 real prompts, and what the AI won't do well."
date: "2026-05-03"
author: "Eject Team"
tags: ["chatgpt", "claude", "ai-editor", "no-code", "vibe-coding", "seo"]
ogImage: "/og/edit-website-with-chatgpt.png"
canonical: "https://ejectfrom.com/blog/edit-website-with-chatgpt"
---

# Edit Your Website with ChatGPT (No Coding Required)

You pay $30 a month for Webflow. Or $23 for Squarespace. Or $16 for Wix. You don't really use most of what they offer. You log in twice a year to swap a headline or fix a typo, and every time you remember why you stopped trying to do it yourself: the editor menus moved, the breakpoint switcher confused you, you accidentally unpublished something, you closed the tab and made yourself a coffee.

Here's the thing nobody told you: in the last eighteen months, the cost of editing a website went to zero. Not the hosting, not the domain. The **editing**. The part you've been paying for the entire time.

You don't need a website builder anymore. You need a folder of files and ChatGPT.

This post is going to walk you through:

- [The shift that just happened](#the-shift) and why your monthly subscription stopped making sense
- [Why this changes the math](#why-it-changes-math) for every small business with a website
- [The mental model](#mental-model). Your website is a folder; an AI can read and write it
- [The setup](#setup), with the actual instruction file you paste into your AI of choice (about 15 lines, copyable)
- [Twelve real prompts](#prompts) you'd actually type, with before/after explanations
- [ChatGPT vs. Claude vs. Cursor](#which-ai). When to use which, honestly
- [What the AI won't do well](#what-it-wont-do). The cases where you still need a human
- [The "but I'm not technical" objection](#not-technical), addressed directly
- [The cost calculator](#cost-calculator) so you can see what you'd save
- [FAQ](#faq) covering the most common worries
- [How to start](#cta)

About 15 minutes of reading. By the end of it, the next time you want to change a headline on your site, you'll do it in 30 seconds, in a chat window, for free.

If you're already on Framer, Webflow, Wix, or Squarespace and you want to see the migration playbook itself, we've got dedicated walkthroughs for [Framer to Next.js](/blog/framer-to-nextjs), [Webflow to Next.js](/blog/webflow-to-nextjs), and [Squarespace to Next.js](/blog/squarespace-to-nextjs). This post is the "what happens after you migrate" post. And the reason migrating is now worth it.

---

## The shift that just happened

In early 2024, asking ChatGPT to edit your website was a parlor trick. It would give you broken HTML, hallucinate file names, miss closing tags, and confidently tell you to install something that didn't exist. People wrote thinkpieces about how AI was overrated.

Eighteen months later, the same prompt finishes the job correctly on the first try, against a real codebase, with the right framework conventions, and respects your existing code style.

What happened in between is genuinely a shift, not hype. Three things compounded:

1. **Models got dramatically better at code.** GPT-5, Claude Opus 4.7, and Gemini 2.5 Pro all hit the point where editing a JSX component is roughly as reliable as editing a Google Doc. Internal benchmarks at the model labs show success rates on real-world coding tasks above 80%, up from 40-something percent just two years ago.
2. **The interfaces caught up.** ChatGPT now has a "projects" feature where you can attach a whole folder. Claude has [Projects](https://www.anthropic.com/news/projects) and [Artifacts](https://www.anthropic.com/news/artifacts). [Cursor](https://cursor.com/) is a full IDE that wraps Claude and ships with file-aware editing built in. You don't have to copy-paste files anymore. The model can see what it's editing.
3. **A culture formed around it.** "Vibe coding". The term [Andrej Karpathy popularized in February 2025](https://twitter.com/karpathy/status/1886192184808149383). Describes a workflow where you describe what you want and the AI writes the code. The phrase went from inside joke to YouTube tutorial trend in six months. Modulify's recent [Vibe Coding Explained: Why It's Replacing No-Code](https://modulify.io/blog/vibe-coding-explained) piece sums up the moment well: people who would never have learned Webflow are now editing real codebases by chatting.

The practical consequence: a non-developer can now do, in plain English, what used to require either a Webflow subscription or a developer on retainer. Not "in theory" or "eventually." Right now. This week. With the free tier of ChatGPT.

That's the shift. The rest of this post is what to do about it.

---

## Why this changes the math

Here's the trade you've been making for the last decade, whether or not you ever wrote it down:

> "I'll pay $30/month forever so that I never have to look at code."

That trade made sense in 2015. The alternative was hiring a developer at $80/hour every time you wanted to swap a headline. Webflow, Squarespace, Wix, Framer. All of them solved a real problem. They turned "I need to update my website" from a $200 invoice into a Tuesday afternoon.

But the cost was real and it stacked up. Three years on a Webflow CMS plan: about $1,400. Five years on Squarespace Business: about $1,100. Add a few overage months and a Workspace seat or two and the number creeps north of $5,000 per site over a five-year horizon.

You paid that bill because the alternative. Code. Was inaccessible. The fence was real and it was high.

ChatGPT is the ladder.

The new trade looks like this:

> "I'll own the folder of files that is my website. When I want to change something, I'll describe it to a free AI, which will edit the files for me."

The ongoing cost is $0. Not "almost free." Zero. ChatGPT has a [free tier that handles website edits cleanly](https://openai.com/chatgpt/pricing/). [Claude.ai is free](https://claude.com/pricing). Cursor's [hobbyist plan is free](https://cursor.com/pricing). You're hosting on something like [Cloudflare Pages](https://www.cloudflare.com/plans/developer-platform/) or [Vercel's free tier](https://vercel.com/pricing). Also $0 for a small business marketing site.

The only money that changes hands is the one-time migration: getting your site out of Webflow/Wix/Squarespace and into a folder of files. After that, your bill is the domain renewal you were already paying.

Run the numbers for your situation in the [calculator below](#cost-calculator). For most readers of this article, the five-year delta is between $1,500 and $6,000. That's a couple of months of payroll for a small business, and you get it back by switching off a subscription you barely use.

---

## The mental model: your website is a folder

If you take one thing from this post, take this: **a website, at the bottom of the stack, is a folder of files.**

That's not a metaphor. That's literally what it is. When you visit a Webflow site, what you're seeing is HTML and CSS that Webflow's servers generated from your project and shipped to your browser. When you visit a Next.js site (the kind we migrate you to), the same thing happens. Except the source files live on your computer, in a folder, and you can open them.

Open one up. It looks roughly like this:

```
my-website/
├── app/
│ ├── page.tsx ← the homepage
│ ├── about/page.tsx ← the /about page
│ ├── pricing/page.tsx ← the /pricing page
│ └── blog/
│ ├── page.tsx ← the blog index
│ └── [slug]/page.tsx ← individual blog posts
├── components/
│ ├── Hero.tsx ← the hero section
│ ├── Features.tsx ← the features grid
│ └── Footer.tsx ← the footer
├── content/
│ └── posts/ ← blog post markdown files
│ └── my-first-post.md
├── public/
│ ├── logo.svg
│ └── team.jpg ← images go here
└── package.json ← project config
```

That's the whole site. Every page, every section, every image, every piece of copy. It's roughly 30 to 80 files for a typical small business site. Each one is plain text you can open in any editor. Including ChatGPT.

The key insight: **ChatGPT can read and write that folder.** When you give it access (we'll show you how in a minute), it can:

- Open any file
- Read what's in it
- Edit specific lines
- Save the change
- Show you the result

That's it. That's the whole trick. Once you understand that your website is just a folder, and an AI can edit folders, every other limitation falls away. You don't need a designer to swap a headline. You don't need a developer to fix a typo. You don't need a CMS to publish a blog post. You need to type a sentence into a chat window.

If that sounds too simple, good. It is too simple. That's the point. The simplicity is what's new.

---

## The setup (one time, about 10 minutes)

Here's what you actually do, end to end. The first time takes about 10 minutes. After that, edits are 30-second affairs.

### Step 1: Have a folder

If your site is already on Eject. Or any Next.js / Astro / SvelteKit setup. You have one. It's the GitHub repo that holds your site. (If you're still on Webflow, Wix, Squarespace, or Framer, you'd start with one of our migration guides linked above. After that, you're here.)

### Step 2: Open ChatGPT (or Claude, or Cursor. Pick one)

For now, let's say ChatGPT. Go to [chatgpt.com](https://chatgpt.com) and sign in. The free tier is fine to start.

### Step 3: Paste in the instruction file

Create a new chat. Before you ask it anything, paste in this exact instruction file. This is what tells the AI how your website is structured and what conventions to follow.

```
You are helping me edit my website. Here is what you need to know:

1. My site is a Next.js 15 project using the App Router and Tailwind CSS.
2. Pages live in /app/{route}/page.tsx. Components in /components/.
3. Images go in /public/. Reference them as "/image.jpg" (no /public prefix).
4. Blog posts are markdown files in /content/posts/.
5. Use existing Tailwind classes; don't invent new ones unless necessary.
6. Match the tone, voice, and structure of nearby code/copy.
7. When I ask for a change, output the FULL updated file (not a diff).
8. Tell me which file path to save it to.
9. If you're not sure which file holds the thing I'm asking about, ask me.
10. Never invent file paths. If a file doesn't exist, ask before creating it.

I'll paste files when you need them. Confirm you understand.
```

The AI will reply with something like "Understood. Paste the file you'd like to edit, or describe the change."

That's the setup. You're ready.

### Step 4 (optional): Use a project / repo-aware tool

If you graduate from copy-pasting files (and you will, within a week), upgrade to one of these:

- **ChatGPT Projects**. Attach your whole repo as files; ask questions across all of them
- **Claude Projects**. Same idea, slightly better at code
- **Cursor**. A full code editor with the AI baked in; you never copy-paste

We'll [compare those three in detail below](#which-ai). For now, if you're brand new to this, ChatGPT with the instruction file above is plenty.

---

## Twelve real prompts you'd actually type

Abstract is bad. Specific is good. Here are twelve real prompts. The kind you'd actually send on a Tuesday morning when you remember you've been meaning to update something on your site. Each one shows you the prompt, what the AI does, and why it works.

### 1. Change the hero headline

> **Prompt:** "Change the hero headline on the homepage to: 'We make handmade leather goods.'"

**What happens:** The AI opens `app/page.tsx`, finds the `<h1>` inside the hero section, replaces the text. It outputs the full updated file with one line changed. You paste it back into your repo. Push to GitHub. Site is live with the new headline in 90 seconds.

**Why it works:** "Hero headline" is unambiguous. The h1 is almost always the headline. The AI doesn't need to make any judgment calls. Just find it and swap it.

### 2. Add a testimonial

> **Prompt:** "Add a testimonial after the features section on the homepage. Quote: 'Eject saved us $4,000 a year and we still update the site every week.' Author: Maya Chen, founder, Northstar Labs."

**What happens:** The AI looks at how testimonials are styled elsewhere on your site (or builds a clean default), inserts a `<Testimonial />` component, fills in the quote and author, and tells you which file to save. If you don't have a testimonial component yet, it creates one in `/components/` and imports it.

**Why it works:** You gave it the exact text. The AI handles the layout, the styling, the import statement. The boring stuff. You just provided the words.

### 3. Update pricing across multiple pages

> **Prompt:** "Update my pricing from $99 to $129 on the homepage and the pricing page."

**What happens:** The AI opens both files, finds the price (it'll usually be in a `<PricingCard />` component or a `data` object), updates both, and tells you which two files to save. If the price is centralized in one config file, even better. It'll catch that and update the source.

**Why it works:** Search-and-replace across multiple files is exactly what AIs are good at. They don't miss instances. (Humans miss instances.)

### 4. Write a blog post

> **Prompt:** "Write a 600-word blog post about 5 things every small business website needs. Save it as a markdown file with frontmatter. Title: 'Five things every small business website needs in 2026.' Tags: small-business, web-design."

**What happens:** The AI drafts the post, formats it with proper markdown, adds the frontmatter block (title, slug, date, tags, description), and tells you to save it as `content/posts/five-things-every-small-business-website-needs.md`. You save it. Push. The blog post is live, indexed by Google in a few days.

**Why it works:** The model is good at writing in plain prose. The formatting boilerplate (frontmatter, slugs, file naming) is handled by the instructions you gave it earlier.

### 5. Replace an image

> **Prompt:** "Replace the photo on my About page with the new one. I just dropped it at /public/team.jpg."

**What happens:** The AI opens `app/about/page.tsx`, finds the existing `<Image />` reference, updates the `src` attribute to `/team.jpg`. Tells you the file is saved. The new photo is live next time you push.

**Why it works:** You did the file upload manually (drop the image into `/public/`). The AI did the wiring. This split. Humans handle the binary stuff, AI handles the text stuff. Is the natural division of labor.

### 6. Fix a typo

> **Prompt:** "Fix the typo on my contact page. 'Recieve' should be 'receive.'"

**What happens:** The AI greps for "recieve" in your codebase, finds it in `app/contact/page.tsx`, fixes it. Total time including your typing: 15 seconds.

**Why it works:** This is the single most common kind of website edit. It used to involve logging into Webflow, finding the page in the designer, double-clicking the text element, deleting and retyping, hitting publish, and waiting for the deploy. Now it's a sentence.

### 7. Update an email everywhere

> **Prompt:** "Change my email everywhere on the site from old@example.com to new@example.com."

**What happens:** The AI searches the entire codebase, finds every reference (footer, contact page, schema markup, mailto links), replaces all of them, tells you the list of files it touched. You review, push, done.

**Why it works:** This is hours of work in a no-code builder, where you have to remember every place the email is used. The AI doesn't forget.

### 8. Add a sticky header

> **Prompt:** "Add a sticky header that hides when scrolling down and reappears when scrolling up."

**What happens:** This one is more complex. The AI updates your `<Header />` component with the right Tailwind classes (`sticky top-0`), adds a small piece of client-side scroll-detection logic, and tells you to save the updated component. You push. The header now does the smart hide-on-scroll thing you've seen on Stripe's site.

**Why it works:** "Sticky header that hides on scroll" is a pattern the AI has seen thousands of times. It knows the standard implementation. You don't have to know it.

### 9. Add a new page

> **Prompt:** "Add a /careers page. Include a short intro paragraph about our team culture, a 'currently hiring' section with three role cards (Senior Developer, Marketing Manager, Customer Success Lead), and a contact email at the bottom: jobs@mycompany.com."

**What happens:** The AI creates `app/careers/page.tsx` with the layout you described, matching your site's existing component patterns. It might also tell you to add the page to your nav, and ask if you want it linked from the footer. You say yes, it makes that change too.

**Why it works:** "Add a page" used to mean opening a CMS, picking a template, dragging in components, configuring SEO. Now it's a sentence and a paragraph of brief.

### 10. Improve SEO on a page

> **Prompt:** "The /pricing page is ranking poorly on Google. Add a longer description below the pricing cards explaining what's included in each plan, optimized for the keyword 'small business website pricing.' Also update the meta title and description."

**What happens:** The AI writes ~200 words of plan-comparison copy, adds it as a section under the pricing cards, and updates the `generateMetadata` block at the top of the file with a new title and description. Saves. You push. Google re-crawls within a week.

**Why it works:** The AI is competent at SEO copy. It's not going to win you Pulitzer Prizes, but it's going to write better keyword-aware copy than most small business owners would write themselves on a Tuesday afternoon.

### 11. Make the site mobile-friendly

> **Prompt:** "On mobile, the hero headline is way too big. Make it scale down. Also stack the hero buttons vertically on small screens instead of side-by-side."

**What happens:** The AI updates the Tailwind classes. `text-6xl md:text-8xl` becomes `text-4xl md:text-6xl lg:text-8xl`; the button container gets `flex-col sm:flex-row`. You save, push, check on your phone. Fixed.

**Why it works:** Tailwind's responsive prefixes are exactly the kind of pattern AI is excellent at. It'd take you twenty minutes to figure out which breakpoint is which. The AI does it in two seconds.

### 12. Add structured data

> **Prompt:** "Add Organization schema to the homepage so we show up in Google's knowledge panel. Logo is /logo.svg, founded 2018, based in Austin, Texas, contact email is hello@mycompany.com."

**What happens:** The AI generates a JSON-LD `<script>` block with the [Organization](https://schema.org/Organization) schema, drops it into the homepage, fills in the details you gave it. Validates against Schema.org spec. You push. Within a couple of weeks, Google may start surfacing your business in panels and rich results.

**Why it works:** Structured data is finicky to write by hand and easy for an AI to template. This used to require hiring an SEO consultant or installing a $25/month plugin. Now it's a free three-line prompt.

These twelve cover roughly 80% of the changes a small business owner would actually want to make to their site. The pattern is the same every time: describe what you want; the AI edits the relevant files; you push; the site updates.

---

## ChatGPT vs. Claude vs. Cursor. When to use which

The honest comparison. All three work. They have different strengths.

### ChatGPT

**Best for:** People who already use it for everything else. The interface is familiar; the free tier is generous; and at this point ChatGPT is the default starting point for anyone trying AI for the first time.

**Strengths:** Easiest entry. The Projects feature lets you attach files and reference them across a long conversation. Good general writing quality (helpful for blog posts and meta descriptions). Plays well with screenshots. Paste a picture of your site, ask "fix the alignment of the section I'm pointing to."

**Weaknesses:** Slightly weaker at code than Claude, especially for complex multi-file refactors. The free tier has rate limits that hit you in the middle of a long edit session.

**Use it when:** You're new to this. You want one tool. You already have an account.

### Claude

**Best for:** People who want the best code quality. Claude (made by Anthropic) consistently wins coding benchmarks and tends to produce cleaner JSX, better type safety, and fewer hallucinated imports than the alternatives.

**Strengths:** Best-in-class for code. The free tier on [claude.ai](https://claude.com) gives you Sonnet 4.6, which is genuinely excellent. [Projects](https://www.anthropic.com/news/projects) let you attach your whole repo. [Artifacts](https://www.anthropic.com/news/artifacts) preview rendered HTML/JSX live in a side panel. You can see your changes before saving them.

**Weaknesses:** Less ubiquitous than ChatGPT. Fewer guides, smaller community. The interface is slightly more spartan.

**Use it when:** Your site has gotten a bit complex and you're starting to make multi-file edits. Or when ChatGPT gives you an answer that doesn't quite work and you want a second opinion.

### Cursor

**Best for:** People willing to install a desktop app and graduate to the "real" workflow. Cursor is a full IDE (forked from VS Code) with AI editing built directly into the file tree. You don't copy-paste. You select code, hit Cmd+K, describe the change, and watch it apply.

**Strengths:** No copy-paste. Sees your whole codebase automatically. Excellent at multi-file edits. "rename this component everywhere" is a single command. Built-in AI agents that can fix multiple bugs in one pass. Free hobby plan ([cursor.com/pricing](https://cursor.com/pricing)) covers most small-business use cases.

**Weaknesses:** It's an IDE, which means you're looking at code most of the time. If the word "IDE" makes you nervous, start with ChatGPT and graduate later. Steeper initial setup.

**Use it when:** You make weekly edits and you're tired of copy-pasting files into a browser. You're comfortable installing software. You want to get good at this and never go back.

### The honest recommendation

Most small business owners reading this should start with **ChatGPT** because the friction is lowest. After a month, when you've made twenty edits and you've started to notice the copy-paste dance gets old, **switch to Cursor**. Use **Claude** as your second opinion when ChatGPT confuses you, or as your primary if you're a writer who values writing quality.

You don't need to commit. They're all free. Try them in that order; pick whichever fits.

---

## What the AI won't do well

This is the section we wish more articles in this space included. AI is excellent at the kinds of edits we listed above. It is genuinely worse than a human for a specific, predictable list of things. We will name them.

### Full redesigns

If you say "redesign the homepage to look more modern," the AI will produce something. It will be technically functional. It will also be average. Generic in a way that good design isn't. A good designer understands your brand, your audience, your competitive set, and your business goals. The AI understands the words "modern" and "homepage."

For brand-defining work, hire a designer. Use the AI to implement what they hand you.

### Complex animations

Subtle micro-interactions, scroll-triggered effects, custom motion design. The kind of thing Framer's designer team excels at. Are difficult to specify in text and difficult for the AI to implement well. It'll use [Framer Motion](https://motion.dev/) or CSS transitions and produce something that works. It probably won't produce something that delights.

For animation-heavy sites, either keep Framer or hire a motion designer. Use the AI for the static structure around the animations.

### E-commerce

If your site sells products with a real cart, payment processing, inventory, taxes, shipping rules, and customer accounts. That's a different beast. The AI can edit your product page copy. It cannot debug a Stripe webhook race condition that's eating $400 of orders. It cannot redesign your checkout flow to lift conversion three points.

For real e-commerce, you want a developer who specializes in [Shopify](https://www.shopify.com/) or a properly-built headless commerce stack. Use the AI for the marketing pages around the storefront.

### Legal and compliance copy

The AI will happily write you a privacy policy. It might not be the right privacy policy for your jurisdiction, your industry, or your contractual obligations to your enterprise customers. Have a lawyer (or at least [Termly](https://termly.io/) or [Iubenda](https://www.iubenda.com/)) generate the templates. Use the AI to format them and drop them into the right files.

### Production-critical decisions you don't understand

If the AI suggests "let me add this third-party script to your site to fix that issue," and you don't understand what the script does, **say no**. Ask it to explain. If you still don't understand, get a developer. The AI is occasionally wrong in ways that look correct, and "I trust the AI" is not a defense when your site goes down or starts leaking customer emails.

The mental model: AI is a fast, capable junior employee with no context about your business. Treat it like one. Trust it for the routine stuff. Verify everything that touches money, security, or legal.

---

## "But I'm not technical"

If this entire post has felt like it's almost-but-not-quite written for you. Like maybe everyone else reading this is a little more comfortable with code than you are. We want to address that head-on.

The whole point of this post is that you don't have to be technical anymore. That fence used to be high. It's now ankle-height. Stepping over it requires:

- **Reading.** This post. Or one like it. About fifteen minutes of attention to learn the mental model.
- **A free account.** ChatGPT, Claude, or Cursor. You probably already have one.
- **Roughly 10 minutes of setup**, the first time. Mostly pasting an instruction file.
- **Pushing a button on GitHub.** When the AI gives you a change, you save it and click "commit." That's it. There is no terminal. There are no commands. There's a button on a webpage.

We are not pretending this is zero learning. Anything new requires a couple of hours of "wait what" before it clicks. We are saying that the cliff used to be a hundred feet tall and it's now a curb. People who've never written a line of code are doing this. Not "could in theory." Are. Today. We see them in our customer base.

The thing the website builders sold you was the absence of fear. The absence of fear is now free. Webflow's actual product. Drag-drop visual editing. Is no longer the only path to "I'm not afraid of my website." Chat-based editing got there too, and it's cheaper and more flexible.

If you're reading this and thinking "I still don't think I can do this": we offer a [Done-for-You migration tier](#cta) where we set everything up, give you the instruction file, and walk you through your first three edits on a screen-share. Most customers feel comfortable independently after the first call. That's how low the cliff actually is.

---

## How much would YOU save?

The calculator below takes your current setup, your current monthly bill, and your team size, and shows you the 36-month and 60-month delta of moving to Eject + chat-based editing.

<CostCalculatorEmbed />

**Inputs:**
- Your current platform (Webflow / Squarespace / Wix / Framer / other)
- Current monthly bill
- Number of editors on your team
- Approximate number of edits per month

**Outputs:**
- Your 36-month and 60-month total on the current platform
- Your one-time migration cost on Eject
- Your $0/month ongoing cost after migration
- Net savings, with a shareable URL you can send to your CFO or your co-founder

For most small businesses currently paying $20–$40/month for a website builder, the five-year savings land between **$1,500 and $5,500**. Then there's the part that's harder to put in dollars: the friction tax. The fact that you're going to make more updates more often when each one takes 30 seconds instead of 30 minutes.

---

## FAQ

### Will I break my site?

Probably not. And if you do, you can roll back instantly. Every change is a Git commit. If something looks wrong after you push, you click "revert" on GitHub or in your hosting dashboard, and the site is back to where it was 30 seconds ago. There's no "permanent break." Most platforms (Cloudflare Pages, Vercel, Netlify) keep every previous deploy forever, free.

The most common "break" is something visual being slightly off. A button the wrong color, a section out of order. You see it, you ask the AI to fix it, you push again. The whole loop is under a minute.

### What if the AI gets confused?

It will, occasionally. The fix is almost always to give it more context. Paste the relevant file. Tell it what you're trying to accomplish at a higher level. If it's still confused, switch models. Try Claude if you were using ChatGPT, or vice versa. Different models confuse on different things.

In our experience, after a week of using the workflow, you develop an intuition for which kinds of requests work first-try and which need a clarification. By month two, the success rate on first-try is above 90%.

### Do I need to install anything?

No, if you start with ChatGPT or Claude in your browser. Yes (one app), if you graduate to Cursor. Either way, you're never installing a development environment. There's no Node.js, no Homebrew, no Xcode. Your hosting platform builds the site for you in the cloud.

### What about my CMS?

Depends on which CMS. If you've been using Webflow's CMS for a blog, we migrate that content into markdown files in your repo (or into a free tier of [Sanity](https://www.sanity.io/) if you have lots of editors). After migration, "publishing a blog post" is exactly the prompt we showed in [example #4](#prompts). Describe what you want, the AI writes the markdown, you push.

If you have something more complex (referenced collections, complex relationships, dynamic queries), we have a longer migration path that keeps a hosted CMS layer. We'll tell you upfront which path applies to your site.

### What about my forms?

Forms become a 40-line file plus a [Resend](https://resend.com/) account ([3,000 emails/month free](https://resend.com/pricing)). Submissions can email you, write to a database, or post to Slack. Spam protection is via [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/). Free, no CAPTCHA puzzles. The migration sets all this up; after that, "add a new form field" is a one-line prompt.

### Is this just for tech people pretending it's for non-tech people?

We hear this concern. It's fair. The honest answer: this approach started in the developer community in 2024 and has been steadily moving outward as the tools have gotten more accessible. As of 2026, the typical Eject customer is a small business owner with no coding background. We're not pretending. We're describing a workflow that's actually being used by people who would have laughed at this two years ago.

If you want a sanity check: try one prompt before committing. Sign up for ChatGPT. Paste the [instruction file](#setup). Type one of [our example prompts](#prompts). Read the output. Decide for yourself whether it makes sense. If it doesn't, don't migrate. We'd rather you stay on Webflow than feel forced into something that doesn't fit how you work.

### Can I still hire a designer or developer when I need to?

Yes. And this is actually one of the under-appreciated benefits. Because your site is a normal Next.js codebase, any developer can work on it. You're not locked into hiring a "Webflow expert" or a "Squarespace specialist." You can hire any frontend developer in the world, hand them a GitHub link, and they can contribute. Hourly rates for "Webflow specialist" are 40-60% higher than equivalent React developers, because the talent pool is smaller. You'll save real money on the occasional contractor too.

### What's the catch?

Honest answer: the catch is that for the first week or two, you're learning. There is a learning curve, and we're not pretending otherwise. Your first edit might take longer than it would have on Webflow. Your second edit will be roughly equal. By your fifth, you're faster than Webflow ever was and you've stopped paying $30/month. The math is clearly in your favor by month three. The pain is concentrated in week one.

---

## Ready to start editing your site by chat?

Three ways in:

| Option | What it costs | What you get |
|---|---|---|
| **Scan your site** | **Free** | Drop your URL into our scanner. We'll tell you, in 60 seconds, whether your site is a good fit for migration, what we'd estimate the migration to cost, and what the 36-month savings look like. No commitment, no signup. |
| **Start a migration** | **$49–$1,499 one-time** | Pick a tier (DIY, Done-with-You, or Done-for-You). We move your site from Webflow / Wix / Squarespace / Framer to a Next.js codebase. After that, your hosting is $0/month and your editing is via chat. |
| **Talk to a human** | **Free 20-min call** | If you've read this far and still aren't sure, book a call. We'll look at your site live, tell you honestly whether migration makes sense, and recommend the right tier (or recommend you stay where you are if that's the right answer). |

**[Scan your site →](https://ejectfrom.com/scan)** • **[Start a migration →](https://ejectfrom.com/start)** • **[Book a call →](https://ejectfrom.com/call)**

The internet has spent ten years convincing you that editing a website is hard. As of 2026, it isn't. Open ChatGPT. Type what you want changed. Done.

---

<script type="application/ld+json">
{
 "@context": "https://schema.org",
 "@type": "FAQPage",
 "mainEntity": [
 {
 "@type": "Question",
 "name": "Will I break my site by editing it with ChatGPT?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Probably not, and if you do, you can roll back instantly. Every change is a Git commit. If something looks wrong after you push, you click revert on GitHub or in your hosting dashboard, and the site is back to where it was 30 seconds ago. Hosting platforms like Cloudflare Pages, Vercel, and Netlify keep every previous deploy forever, free of charge."
 }
 },
 {
 "@type": "Question",
 "name": "What if the AI gets confused?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "It will occasionally. The fix is usually to give it more context: paste the relevant file, describe the goal at a higher level, or switch models. After a week of use, most people develop an intuition for which requests work first-try. By month two, the first-try success rate is above 90 percent."
 }
 },
 {
 "@type": "Question",
 "name": "Do I need to install anything to edit my website with ChatGPT?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "No, if you start with ChatGPT or Claude in your browser. Yes, one app, if you graduate to Cursor. Either way, you are never installing a development environment. There is no Node.js, no Homebrew, no Xcode. Your hosting platform builds the site for you in the cloud."
 }
 },
 {
 "@type": "Question",
 "name": "What happens to my CMS content when I migrate?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "It comes with you. Simple blogs migrate to markdown files in your repo. More complex CMS setups migrate to a hosted CMS layer like Sanity (free tier covers most small businesses). After migration, publishing a blog post is a single chat prompt: describe the post, the AI writes the markdown, you push to GitHub."
 }
 },
 {
 "@type": "Question",
 "name": "What about my contact and signup forms?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Forms become a 40-line file plus a Resend account, free for 3,000 emails per month. Submissions can be emailed to you, posted to Slack, or written to a database. Spam protection via Cloudflare Turnstile is also free and does not show CAPTCHA puzzles. The migration sets this up for you."
 }
 },
 {
 "@type": "Question",
 "name": "Is editing websites with ChatGPT really for non-technical people?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Yes. This workflow started in the developer community in 2024 and has been steadily moving outward as tools have gotten more accessible. As of 2026, the typical Eject customer is a small business owner with no coding background. The only commitment to verify this is signing up for a free ChatGPT account, pasting an instruction file, and trying one prompt to see for yourself."
 }
 },
 {
 "@type": "Question",
 "name": "Can I still hire a designer or developer when I need to?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Yes, and this is actually a benefit. Because your site is a normal Next.js codebase, any frontend developer can work on it. You are not locked into hiring a Webflow specialist or Squarespace specialist. Hourly rates for general React developers are 40 to 60 percent lower than for builder-platform specialists, because the talent pool is much larger."
 }
 },
 {
 "@type": "Question",
 "name": "What is the catch with editing websites by chat?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "The catch is a one-to-two-week learning curve. The first edit might take longer than it would on Webflow. By the fifth, you are faster than Webflow ever was and have stopped paying a monthly subscription. The math is clearly in your favor by month three. The friction is concentrated in week one."
 }
 }
 ]
}
</script>
