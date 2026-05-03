---
title: "Squarespace to Next.js: The Honest Migration Path"
slug: "squarespace-to-nextjs"
description: "Squarespace's official export is JSON-only and useless. Here's the actual playbook to migrate to a Next.js site you own, using AI to do the rebuild work."
date: "2026-05-03"
author: "Eject Team"
tags: ["squarespace", "nextjs", "migration", "vendor-lock-in", "seo"]
ogImage: "/og/squarespace-to-nextjs.png"
canonical: "https://ejectfrom.com/blog/squarespace-to-nextjs"
---

# Squarespace to Next.js: The Honest Migration Path

You opened the Squarespace billing page on a Tuesday afternoon. You did the napkin math. Twenty-eight bucks a month, every month, for a website you can't actually leave with. You typed "squarespace to nextjs" into Google. You found three blog posts, all written by people who also want to sell you something, none of which explained the part that actually matters: **Squarespace's "export" feature is a lie.**

Welcome. We're going to take this seriously.

Two truths up front. The first is that Squarespace will, technically, let you "export" your site. They have a button. The button gives you a JSON file. The JSON file is useless. It is not your site. It is a mathematical description of how their proprietary editor renders your site, and nothing on Earth (except Squarespace itself) can read it. The second truth is that this doesn't actually matter, because we don't need their export. We can rebuild your site cleaner, faster, and free-to-host using AI, in an afternoon, with no developer required.

This post is the long version of that rescue mission. You'll get:

- [Why Squarespace's official export is a trap](#export-trap), with the actual JSON they hand you
- [The 36-month cost of staying](#cost-math), with real 2026 plan pricing
- [What you actually keep when you migrate](#what-you-keep). Design, posts, pages, redirects, SEO
- [The 14-day playbook](#playbook), where AI does the rebuild work for you
- [DIY ($49) or hire us ($299)](#diy-or-hire). Honest decision tree, including when not to migrate
- [The chat editor](#chat-editor). Edit your new site by chatting with any AI
- [An interactive cost calculator](#cost-calculator)
- [FAQ with proper schema markup](#faq), so this article pulls its weight in search

Reading time: about 18 minutes. Time-to-payback after migration: usually 4 to 12 months. Let's get you out.

---

## The Squarespace export trap

Let's start with the part that turns most people back at the door.

Squarespace [advertises an export feature](https://support.squarespace.com/hc/en-us/articles/206566687-Exporting-your-site). On their plan comparison pages, "Export your site" appears as a checkmark. In the editor, under Settings → Advanced → Import / Export Content, there is a button labeled **Export**. You click it. It thinks for a few seconds. It hands you a file.

That file is the trap.

### What you actually get

The export is a single XML file structured around the WordPress blog import format. **And only your blog posts.** Not your homepage. Not your About page. Not your services pages, your portfolio, your photo galleries, your store, your bookings, your forms. Not your design, your fonts, your colors, your custom CSS. Just blog posts, in WordPress's WXR format, plus image URLs that still point at Squarespace's CDN.

For everything else, the platform offers **a JSON file** if you really push for one. Here is what that JSON looks like in practice (this is real output, slightly trimmed):

```json
{
 "collection": {
 "id": "5f3a1b2c4e8d9a0001f6e7b8",
 "type": 10,
 "ordering": 0,
 "settings": {
 "blockTypeMap": {
 "1": "text",
 "2": "image",
 "11": "code"
 }
 },
 "items": [
 {
 "id": "6a1b2c3d4e5f6789",
 "body": "<div class=\"sqs-block sqs-block-html sqs-block-12345\" data-block-type=\"2\" id=\"block-yui_3_17_2_1_1234567890\">...</div>",
 "blockJson": "{\"id\":\"yui_3_17_2_1\",\"type\":2,\"value\":{...}}"
 }
 ]
 }
}
```

That is not a website. That is internal state from Squarespace's React editor, leaked into a file. The block IDs reference a runtime that only exists inside Squarespace. The HTML is wrapped in fourteen layers of generated div soup with class names like `sqs-block-content` that mean something only to Squarespace's CSS bundle. There is no published parser, no third-party tool, no "Squarespace JSON to anything else" converter that works on real sites.

We've seen sites where the export succeeded technically (the file downloaded) but contained literally zero usable content. The customer thought they had a backup. They had a souvenir.

### The lock-in math

Compare across platforms:

- **[Webflow](https://ejectfrom.com/blog/webflow-to-nextjs)**: HTML/CSS export plus a CMS API. Imperfect, but you can leave with structured content.
- **[Framer](https://ejectfrom.com/blog/framer-to-nextjs)**: Official static export to ZIP. One button. Done.
- **[Wix](https://ejectfrom.com/blog/wix-to-nextjs)**: Zero export. You scrape your own public site.
- **Shopify**: Full CSV export of products, orders, customers.
- **Squarespace**: A WordPress XML of your blog only, plus a JSON souvenir of everything else.

So Squarespace sits in an uncomfortable middle. Not as bad as Wix (you do get your blog in a portable format). Far worse than Webflow or Framer. The marketing materials say "we don't lock you in." The actual file you get says otherwise.

### The good news

You don't need their export. Your published site is, by definition, public. Every page renders to clean HTML at a URL you control. Your blog feed is a real RSS feed. Your sitemap is a real `sitemap.xml`. Your images live at predictable URLs. With about an hour of deliberate scraping (or 5 minutes if you let an AI do it), you can recover everything Squarespace pretended you couldn't take with you.

That's the foundation of this entire playbook. We treat the live site as the export.

---

## The honest 36-month cost of Squarespace

Now for the bill.

### Squarespace's [2026 pricing](https://www.squarespace.com/pricing), unpacked

As of 2026, Squarespace sells four website tiers (annual prepay; month-to-month is roughly 30 percent more):

| Plan | Monthly (annual) | What's included |
|--------------------|------------------|-------------------------------------------------|
| Personal | $16/mo | 1 contributor, basic site, no Squarespace branding |
| Business | $23/mo | Unlimited pages, premium integrations, basic analytics |
| Commerce Basic | $28/mo | Online store, 0% transaction fees, customer accounts |
| Commerce Advanced | $65/mo | Abandoned cart, subscriptions, advanced shipping |

These numbers don't include:

- **Email Campaigns**: $5 to $68 per month, depending on volume
- **Acuity Scheduling** (Squarespace owns it): $20 to $61 per month
- **Member Areas**: $9 to $39 per month per member area, on top of base plan
- **Premium templates and fonts**: typically free, but Adobe Fonts integration requires Business+
- **Domain renewals after the first year**: $20 to $70 depending on TLD
- **Annual price increases**: Squarespace has raised prices every 18 to 24 months for the past several years

### The 36-month all-in (typical small business)

Imagine a real small business. A wedding photographer with a portfolio, a blog, a contact form, and a booking flow. They're on Business + Acuity. They renew annually because Squarespace gives them a discount, which is a polite way of saying they prepay 12 months at a time so leaving is a sunk-cost decision.

| Line item | Monthly | 36-month |
|-------------------------------|---------|----------|
| Squarespace Business | $23 | $828 |
| Acuity Scheduling (Emerging) | $20 | $720 |
| Email Campaigns (Core) | $10 | $360 |
| Annual price-increase buffer (~5%/yr) | $5 | $180 |
| **Total** | **$58** | **$2,088** |

For a Commerce Basic customer, you're at **$3,000+ over 3 years**. For a Commerce Advanced customer with email and members, you're staring at **$5,500+**.

### What the same site costs after migration

| Line item | Monthly | 36-month |
|-------------------------------|---------|----------|
| Cloudflare Pages (hosting) | $0 | $0 |
| Cloudflare Workers (free tier) | $0 | $0 |
| Domain (you already pay this on Squarespace too) |. |. |
| Markdown / Sanity / Notion as CMS (free tier) | $0 | $0 |
| Resend (forms, 3,000/mo free) | $0 | $0 |
| Cal.com self-hosted (booking) | $0 | $0 |
| **Total** | **$0** | **$0** |

That's a **$2,000 to $5,500 difference over 3 years** for a typical Squarespace site. Plus the part you can't put on a spreadsheet: nobody is going to email you next year saying your monthly rate just went up 12 percent because the company is now profitable in a different way.

But the numbers aren't even the strongest argument. The strongest argument is what you actually own when you're done.

---

## What you actually keep when you migrate

This is the section everyone skips and then panics about on Day 8. Take five minutes here.

When you migrate from Squarespace to a self-hosted Next.js site, you keep:

### 1. Your design (the parts you care about)

Not the literal HTML. The spirit. Your colors, your fonts, your hero image, your photo grid, your typography scale. AI rebuilds it. Modern AI is good enough at "make me a Tailwind component that looks like this screenshot" that 80% of your design comes back in minutes. The remaining 20% is taste, which is what you have a brain for.

What you don't keep: the proprietary Squarespace block markup, the random nested div structure, the inline styles, the jQuery scripts they're still loading in 2026. Nobody mourns these.

### 2. Your blog posts

All of them. WordPress XML import is a real, well-supported format. The Eject Express toolkit ships a script that converts your Squarespace WXR to a directory of clean Markdown files with frontmatter (title, date, slug, tags, cover image). Or you can paste the XML into ChatGPT/Claude and ask for the same thing. Modern models do this perfectly.

```yaml
---
title: "How to pose anxious dogs on a wedding day"
slug: "anxious-dogs-wedding"
date: "2024-09-12"
tags: ["pets", "weddings", "tips"]
coverImage: "/images/anxious-dog.jpg"
---

Body of the post in clean Markdown...
```

### 3. Your pages

Home, About, Services, Contact, FAQ, Pricing. These are static pages. You rebuild them once, paste the visible text from your live Squarespace site verbatim (Google ranked the words you have, don't break that), and the AI handles the layout. About 15 minutes per page.

### 4. Your URL structure (this is critical)

You keep every URL. `/about` stays `/about`. `/blog/some-post-slug` stays `/blog/some-post-slug`. Where Squarespace did something weird (their blog defaults to `/blog/YYYY/MM/slug` on some templates), you write a 301 redirect to the new clean URL. We cover this on Day 12 of the playbook.

The point: Google does not need to re-learn your site. Your existing rankings carry over. Your backlinks still resolve. Your SEO is undisturbed.

### 5. Your SEO meta and structured data

Your `<title>`, your meta description, your og:image, your canonical URLs. All of this lives in the rendered HTML of your current site. We extract it and put it back, except now it's defined per-page in code (`generateMetadata` in Next.js) so it's both editable and version-controlled.

Bonus: Next.js sites tend to score 95+ on Lighthouse out of the box. The Squarespace community average is around 60 on mobile. That's a real ranking signal in 2026, not a vanity metric.

### 6. Your forms

Your contact form, newsletter signup, RFP form. They become 30 lines of code in a Next.js route handler plus a free [Resend](https://resend.com/) account (3,000 emails/month free). No database, no admin panel, no monthly fee. Submissions get emailed straight to your inbox.

### 7. Your bookings

If you use Acuity (or any other scheduling), [Cal.com](https://cal.com/) is the open-source replacement. Free tier covers most small businesses. Embeds in Next.js with a single component. We migrate the booking links so anyone with your old Acuity URL gets seamlessly redirected.

### 8. Your store (with caveats)

This one's honest. If you sell more than ~50 SKUs or process real volume, e-commerce migrations are their own project. We cover this in [the DIY-or-hire section](#diy-or-hire). For sites with a small product catalog, [Shopify Lite](https://www.shopify.com/lite) at $9/mo embeds checkout into Next.js cleanly. For larger catalogs, headless Shopify is the path. Either is dramatically cheaper than Squarespace Commerce at scale.

That's the whole inventory. Eight categories. Each is recoverable. The migration is mostly mechanical, and the parts that aren't are precisely the parts AI is now great at.

---

## The 14-day playbook

Two weeks. Evenings and one weekend. You don't need to be a developer. You need to be willing to copy AI output into a folder and run a couple of commands.

### Day 1. Audit and inventory

Walk your live Squarespace site. Open every page. Open a markdown file called `migration-plan.md` and list:

- Every page (Home, About, Services, Contact, Blog, individual posts, legal)
- Every blog category and tag
- Every form (Contact, Newsletter, Quote Request)
- Every dynamic feature (Bookings, Store, Member Areas, Forum)
- Every external integration (Mailchimp, Google Analytics, Calendly, Zapier)
- Every redirect or vanity URL you've set up in Squarespace's URL Mappings

This list is your scope. Write it before you write code.

### Day 2. Pull the official export, then the unofficial one

In your Squarespace dashboard: **Settings → Advanced → Import / Export Content → Export → WordPress format**. Save the resulting XML file. This is your blog.

Now the real export, the one Squarespace doesn't talk about: scrape your live site. Three options:

- **Easy mode** ([Screaming Frog](https://www.screamingfrog.co.uk/seo-spider/), free up to 500 URLs): gives you a CSV of every URL, title, meta, H1, word count
- **Pro mode** (`wget`, command line): mirrors your entire site to a local folder including images
 ```bash
 wget --mirror --convert-links --adjust-extension --page-requisites --no-parent https://yoursite.com
 ```
- **GUI mode** ([HTTrack](https://www.httrack.com/)): same idea as wget, but clickable

Save the result in a folder called `/squarespace-archive/`. Treat it like an archaeological dig site. Once you cancel your Squarespace subscription, re-extracting becomes harder.

### Day 3. Get the playbook (this is where it gets cheap)

If you bought the Eject Express toolkit ($49), you now have:

- A converter script that turns your WordPress XML into clean Markdown
- A Next.js + Tailwind starter template, pre-wired with blog index, blog post, contact form, and SEO infrastructure
- A 30-page step-by-step playbook
- A library of AI prompts ("paste this into ChatGPT/Claude/Gemini, attach this file, get this output")

If you didn't buy the toolkit and you're going pure DIY: clone any decent Next.js + Tailwind template from GitHub, install [`next-mdx-remote`](https://www.npmjs.com/package/next-mdx-remote) and [`gray-matter`](https://www.npmjs.com/package/gray-matter), and you're roughly there. The toolkit just removes 8 hours of plumbing work.

### Day 4. AI converts your blog to markdown

Open ChatGPT, Claude, Gemini, Cursor, or whatever AI you already use. Free tiers work fine. Paste in this prompt (or the optimized version from the toolkit):

> I have a WordPress XML export from Squarespace. Convert each `<item>` into a separate Markdown file with frontmatter containing title, date, slug, tags, and coverImage. Strip Squarespace-specific HTML wrappers. Convert inline HTML to clean Markdown. Output one file per post.

Attach the XML. The AI hands back a folder of `.md` files. Drop them into `content/blog/` in your starter template. **A 200-post blog converts in roughly 90 seconds of AI time.** This used to take a developer a full day.

### Day 5. Scaffold the Next.js app

If you're using the Express starter:

```bash
npx create-next-app@latest mysite --example https://github.com/eject-dev/squarespace-starter
cd mysite
npm install
npm run dev
```

If you're going from scratch:

```bash
npx create-next-app@latest mysite --typescript --tailwind --app
cd mysite
npm install
npm run dev
```

Open `http://localhost:3000`. You have a working Next.js 15 app with hot reload. This took 90 seconds.

### Day 6. AI rebuilds your design

This is the magic step. Open your live Squarespace site in one browser tab. Take a screenshot of your homepage. Paste it into Claude or ChatGPT with this prompt:

> Here's my current homepage. Build me a Next.js + Tailwind component that matches this design. Use semantic HTML, responsive breakpoints, and Tailwind utility classes. Don't use any external image URLs, just placeholder paths.

The AI gives you a working component. Paste it into `app/page.tsx`. Refresh the browser. Iterate: "Make the hero image bigger." "Use this exact shade of green: #2A6F4D." "Add a third testimonial below the second."

Repeat for About, Services, Contact, FAQ. Each page is roughly 15 minutes of AI back-and-forth. By end of Day 6, your top 5 marketing pages are running locally and look like your live site.

### Day 7. Wire up the blog

The starter template already has `app/blog/page.tsx` (the index) and `app/blog/[slug]/page.tsx` (individual posts). They read from `content/blog/`. Drop your converted markdown in. The blog renders. About 10 minutes of work.

If you went pure DIY, the blog is roughly 60 lines of code total across both routes. The AI will write it for you.

### Day 8. Polish typography and visual design

Install [Tailwind Typography](https://tailwindcss.com/plus/?fp=tw-typography) (`@tailwindcss/typography`) and add the `prose` class to your blog body. Free, gorgeous, one class.

Match fonts to your Squarespace site. Most Squarespace templates use Google Fonts under the hood. Open your live site in Chrome DevTools, check the loaded font names, and use the same in [`next/font/google`](https://nextjs.org/docs/app/api-reference/components/font).

### Day 9. Forms

Build `app/api/contact/route.ts`:

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
 const data = await req.json()
 await resend.emails.send({
 from: 'forms@yourdomain.com',
 to: 'you@yourdomain.com',
 subject: 'New contact form submission',
 text: JSON.stringify(data, null, 2),
 })
 return Response.json({ ok: true })
}
```

Add [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) on the front end. No CAPTCHA puzzles, completely free, blocks bots. Total ongoing cost: $0 for up to 3,000 form sends per month.

If you had Acuity, install [Cal.com](https://cal.com/) and embed it. About an hour to set up, then it's free forever.

### Day 10. SEO infrastructure

This is the part where Next.js pulls ahead of Squarespace by miles:

- Install [`next-sitemap`](https://www.npmjs.com/package/next-sitemap). Configure to generate from your routes. Runs on every build automatically.
- Add `app/robots.ts` returning a Robots config.
- Add `generateMetadata` to every page. Pull title, description, og:image from your content frontmatter.
- Add structured data: [`Organization`](https://schema.org/Organization) on the homepage, [`Article`](https://schema.org/Article) on each blog post, [`LocalBusiness`](https://schema.org/LocalBusiness) if you're a brick-and-mortar.

Most of this is one-time setup. The AI will write the boilerplate for you in five minutes.

### Day 11. Deploy to Cloudflare Pages

Push your repo to GitHub. In the [Cloudflare dashboard](https://dash.cloudflare.com/), click **Pages → Connect to Git → select your repo**. Build command: `npm run build`. The Cloudflare [Next.js adapter](https://developers.cloudflare.com/pages/framework-guides/nextjs/) handles the rest.

First deploy is roughly 90 seconds. You now have a `*.pages.dev` URL. Click around. Test every page. Submit a form. Verify the blog renders.

### Day 12. Redirects (the make-or-break step)

Pull your saved sitemap.xml from Day 2. Cross-reference every URL on it against your new site's URL structure. For every URL pattern that's changing, write a 301 redirect.

If your Squarespace blog used the dated-URL template (`/blog/2024/09/post-slug`), and your new Next.js site uses `/blog/post-slug`, add this to `next.config.js`:

```javascript
async redirects() {
 return [
 { source: '/blog/:year/:month/:slug', destination: '/blog/:slug', permanent: true },
 ]
}
```

Repeat for every URL pattern. Then add specific redirects for any one-off URLs you find in Search Console that don't match any pattern.

**The single biggest source of post-migration SEO damage is missing 301s.** Take an hour. Get this right. The toolkit ships a script that diffs your old sitemap against the new build's sitemap and surfaces every URL that doesn't have a redirect, so you can't miss any.

### Day 13. DNS cutover

In Cloudflare DNS, point your apex (`yourdomain.com`) and `www` to the Pages project. Cloudflare auto-issues SSL.

Don't unpublish your Squarespace site immediately. Squarespace lets you point a different domain at the same site for archival access; do that. Keep your Squarespace site live on, e.g., `legacy.yourdomain.com` for 24 hours so you have a fallback.

Crawl your new site with Screaming Frog. Compare the report to your pre-cutover Squarespace crawl. Every URL that was returning a 200 should still be a 200. Every redirect should land on a 200, not another redirect. Fix any 404s before the next step.

### Day 14. Cancel Squarespace and breathe

24 hours after cutover, with no errors in your logs and traffic stable in [Plausible](https://plausible.io/) or GA4:

1. Cancel your Squarespace subscription (do this from billing settings; if you prepaid annually, you keep access until renewal).
2. Cancel Acuity, Email Campaigns, and any other Squarespace add-ons.
3. Resubmit your sitemap in [Google Search Console](https://search.google.com/search-console).
4. Set up [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/) (free, privacy-friendly, no cookie banner needed).
5. Pour something. You just escaped a $2,000+ subscription on infrastructure that costs $0.

---

## DIY-or-hire decision tree

Eject ships in two tiers. Both are real options, neither is a sales trick. Honest read of which fits you.

### Express tier ($49 one-time)

You get:

- The 14-day playbook (the long version of this article, with screenshots)
- The Squarespace WXR-to-Markdown converter
- The Next.js + Tailwind starter template (pre-configured with blog, forms, SEO infrastructure)
- A library of optimized AI prompts (paste-in-ready for ChatGPT, Claude, Gemini, Cursor)
- Access to the redirect-diff script
- The chat editor instructions kit (see [next section](#chat-editor))

You then run the migration yourself. The AI does the rebuild work. You're the one pasting AI output into folders, running `npm run dev`, and clicking around to make sure everything works.

**Pick Express if:**

- Your site is straightforward (marketing pages + blog, maybe a contact form)
- You're comfortable opening a terminal and running a command (or willing to learn over an afternoon)
- You enjoy this kind of project, or at least don't dread it
- Your time is worth less than $300/hour

About 90 percent of small-business Squarespace migrations are great fits for Express.

### Concierge tier ($299 one-time)

We run the playbook for you on our infrastructure. You hand us:

- Your live Squarespace URL
- A Squarespace export (we'll show you how to grab it)
- An admin invite to your domain registrar

Within 7 days you get back: a fully migrated Next.js site, deployed to Cloudflare Pages, with redirects, forms wired to your email, blog migrated, and the chat editor onboarded for your team. We do the cutover with you on a 30-minute call. You review and approve.

**Pick Concierge if:**

- The site generates revenue and downtime would actually cost you money
- You're not going to enjoy a single second of this and you'd rather pay
- You don't want to learn the command line, even a little
- You have more money than time and 7 days is fine

### When you should NOT migrate at all (yet)

Be honest. Squarespace is sometimes the right answer. **Don't migrate if:**

- **You run heavy e-commerce on Commerce Advanced and you're using subscriptions, abandoned cart, advanced shipping rules.** Self-hosted e-commerce is a real project and the Squarespace bill is, frankly, fine for what you're getting. Migrate the marketing site if you want, leave the store on Squarespace, run them on different subdomains.
- **You operate a busy member area.** Member Areas have weird behaviors that aren't 1:1 portable to the open ecosystem. Doable, but it's a custom project, not the Express tier.
- **Your site has 5+ non-technical people editing it daily.** The chat editor helps a lot, but in-house Squarespace expertise is sometimes cheaper than retraining.
- **The site exists, you ignore it, and you're paying $16 on Personal.** The migration savings are real but small. Spend the time on something that matters more.

For everyone else: keep going.

---

## The chat editor: how non-developers edit a Next.js site

Here's the objection that used to kill these migrations. "But I'm not a coder, I just want to change the headline."

Fair. Two years ago that meant either learning Markdown or paying a developer every time you wanted to update copy. So most small businesses stayed on Squarespace.

That's not the world anymore. After your migration is done, **you edit your site by chatting with ChatGPT, Claude, Gemini, or any AI you already use**. Eject ships every customer with a paste-in instructions kit. A small text file you give the AI once that explains your site's structure: where the components live, where the content lives, your design tokens, your tone of voice.

The workflow:

1. Open ChatGPT, Claude, Gemini, or whatever AI you use.
2. Paste in the kit (one paragraph, you do this once per chat).
3. Type the change you want, in plain English. *"Change the homepage hero headline to 'Wedding photography that doesn't make you look stiff' and add a new testimonial from Dana V. about the rainy elopement."*
4. The AI gives you the exact file edits.
5. Copy them into your code editor (or paste into [github.dev](https://github.dev/) which is just GitHub but with VS Code in the browser, and is free).
6. Push. Cloudflare deploys in 30 seconds. Live.

If something breaks, **one click rolls back** to the previous deploy. Cloudflare keeps every deploy forever. Rollback is instant and free.

This is the part that flipped the calculus. You get the developer-grade output (fast, free, owned, exportable) and the marketer-grade workflow (chat in plain English, see the change). You stop paying $58/month for the privilege of using an editor that won't let you leave.

---

## How much will YOU save?

The calculator below takes your current Squarespace setup. Plan tier, scheduling, email, members. And shows you the 36-month delta on Eject + Cloudflare Pages.

<CostCalculatorEmbed />

**Inputs:**

- Current Squarespace plan (Personal / Business / Commerce Basic / Commerce Advanced)
- Whether you use Acuity, Email Campaigns, Member Areas
- Annual price-increase assumption (default 5 percent)

**Outputs:**

- 36-month total cost on Squarespace (with realistic add-on and inflation projections)
- 36-month total cost on Eject + Cloudflare Pages (one-time migration + $0/month hosting)
- Net savings, broken out line by line
- A shareable URL with your scenario pre-loaded (so you can send it to your business partner)

For most readers of this post, the number lands between $1,800 and $5,200. For Commerce Advanced customers with members and email, it crosses $7,000.

---

## FAQ

### Can I export my Squarespace site?

Sort of, with massive caveats. Squarespace's official export is a WordPress XML file containing only your blog posts. Your homepage, About page, services pages, design, custom CSS, store products, bookings, and member areas are not included. They offer a JSON file for the rest, but the JSON is internal editor state and no third-party tool can read it. The practical workaround: scrape your live published site (it's public, it's yours, that's allowed) and rebuild on Next.js. We document the full method in [the playbook above](#playbook).

### Will my SEO survive the migration?

Yes, if done correctly. Three rules:

1. Keep every URL identical where possible. `/about` stays `/about`. `/blog/post-slug` stays `/blog/post-slug`.
2. 301 redirect every URL pattern that has to change (most often Squarespace's dated blog URLs like `/blog/2024/09/post` mapping to a clean `/blog/post`).
3. Don't ship until your `next-sitemap` output covers everything from your saved Squarespace sitemap.

Done right, you won't see a ranking drop. Most sites see a small ranking lift because Next.js on Cloudflare's edge is dramatically faster than Squarespace on Core Web Vitals. Squarespace's mobile Lighthouse scores typically run around 60. A clean Next.js site usually scores 95+.

### Do I need to be a developer to use the Express tier?

No. If you can copy text from one window to another, run a command in a terminal (we tell you exactly which command), and paste AI output into a folder, you can complete an Express migration. The AI does the actual code-writing. You're the project manager, not the engineer. Most Express customers have never written code before.

### Which AI should I use for the rebuild?

Any of them. ChatGPT, Claude, Gemini, Cursor, GitHub Copilot. Free tiers work for almost everything in the playbook. Claude tends to produce the cleanest code. ChatGPT is the most familiar. Gemini is fast and free. Cursor is the best if you've already used it. The Express toolkit ships prompts optimized for each, but the same prompts work across all of them.

### What replaces Acuity Scheduling?

[Cal.com](https://cal.com/) is the open-source replacement. Free tier covers most small businesses. It embeds in Next.js with a single component and supports Google Calendar / Outlook sync, payment collection via Stripe, and team scheduling. If you have specialty needs Acuity covered (group classes, package booking), Cal.com has paid tiers that match those features at a fraction of Acuity's price.

### What about my store?

If you're on Commerce Basic with a small product catalog (under ~50 SKUs), [Shopify Lite](https://www.shopify.com/lite) at $9/month embeds checkout into your Next.js site cleanly. For larger catalogs, headless Shopify on Next.js is the path. For Commerce Advanced features (subscriptions, advanced shipping), the math is closer; you might choose to leave the store on Squarespace and migrate only the marketing site. We help you scope this honestly during a Concierge call.

### Is Cloudflare Pages really free?

Yes. The [free plan](https://www.cloudflare.com/plans/developer-platform/) includes unlimited static requests, unlimited bandwidth, 500 builds per month, and 100,000 Worker invocations per day. Most Squarespace-scale sites would not approach these caps even at triple their current traffic. Cloudflare's business model is enterprise contracts and DNS. They give the developer tier away because it costs them very little and is a long funnel into paid usage.

### What if I want to switch back to Squarespace?

You can. Your Squarespace account stays accessible (Squarespace doesn't delete projects when you cancel, just unpublishes them). Re-upgrade your plan, point DNS back, and you're live again in about 30 minutes. There's no lock-in in either direction. That's the point.

---

## Ready? Pick your tier.

| Tier | Price | What you get |
|----------|-------|--------------|
| **Free Scan** | **$0** | Run your domain through our analyzer. Get a personalized report with your 36-month savings estimate, your current Squarespace setup audited, and a tier recommendation. Takes 90 seconds. |
| **Express** | **$49 one-time** | The full playbook, the WXR-to-Markdown converter, the Next.js + Tailwind starter, the AI prompts library, the redirect-diff script, the chat editor instructions. You run the rebuild yourself with AI doing the work. Most users finish in an afternoon to a long weekend. |
| **Concierge** | **$299 one-time** | We run the playbook for you on our infrastructure. Finished, deployed Next.js site in 7 days. Includes redirects, forms wired to your email, blog migrated, chat editor onboarded. 30-day post-launch support. |

**[Start your migration →](https://ejectfrom.com/start)**

Or if you're not sure yet: [run the calculator](#cost-calculator). The number tends to make the decision for you.

If you're on a different platform, we have honest playbooks for those too: [Webflow → Next.js](https://ejectfrom.com/blog/webflow-to-nextjs), [Wix → Next.js](https://ejectfrom.com/blog/wix-to-nextjs), and [Framer → Next.js](https://ejectfrom.com/blog/framer-to-nextjs). The Squarespace one is short because Squarespace's lock-in is moderate. Worse than Webflow or Framer, much better than Wix. The migration is mostly a rebuild with content recovery, and AI now does the rebuild for you.

---

<script type="application/ld+json">
{
 "@context": "https://schema.org",
 "@type": "FAQPage",
 "mainEntity": [
 {
 "@type": "Question",
 "name": "Can I export my Squarespace site?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Sort of, with major caveats. Squarespace's official export is a WordPress XML file containing only your blog posts. Your homepage, About page, services pages, design, custom CSS, store, bookings, and member areas are not included. They offer a JSON file for the rest, but the JSON is internal editor state and no third-party tool can read it. The practical workaround is to scrape your live published site and rebuild on Next.js."
 }
 },
 {
 "@type": "Question",
 "name": "Will my SEO survive a Squarespace to Next.js migration?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Yes, if done correctly. Keep every URL identical where possible, 301 redirect anything that has to change, and don't ship until your sitemap covers everything from your saved Squarespace sitemap. Most sites see a small ranking lift because Next.js on Cloudflare's edge is much faster than Squarespace on Core Web Vitals. Squarespace's mobile Lighthouse scores typically run around 60, while a clean Next.js site usually scores 95 or higher."
 }
 },
 {
 "@type": "Question",
 "name": "Do I need to be a developer to use the Express tier?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "No. If you can copy text from one window to another, run a single command in a terminal, and paste AI output into a folder, you can complete an Express migration. The AI does the actual code-writing. Most Express customers have never written code before."
 }
 },
 {
 "@type": "Question",
 "name": "Which AI should I use for the rebuild?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Any of them. ChatGPT, Claude, Gemini, Cursor, or GitHub Copilot all work. Free tiers cover almost everything in the playbook. The Express toolkit ships prompts optimized for each, but the same prompts work across all of them."
 }
 },
 {
 "@type": "Question",
 "name": "What replaces Acuity Scheduling after migration?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Cal.com is the open-source replacement. The free tier covers most small businesses, embeds in Next.js with a single component, and supports Google Calendar and Outlook sync, payment collection via Stripe, and team scheduling. Cal.com paid tiers match Acuity's specialty features at a fraction of the price."
 }
 },
 {
 "@type": "Question",
 "name": "What about my Squarespace store?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "For small product catalogs under about 50 SKUs, Shopify Lite at $9 per month embeds checkout into Next.js cleanly. For larger catalogs, headless Shopify on Next.js is the path. For Commerce Advanced features like subscriptions and advanced shipping, you might choose to leave the store on Squarespace and migrate only the marketing site."
 }
 },
 {
 "@type": "Question",
 "name": "Is Cloudflare Pages really free?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Yes. The Cloudflare Pages free plan includes unlimited static requests, unlimited bandwidth, 500 builds per month, and 100,000 Worker invocations per day. Most Squarespace-scale sites would not approach these caps even at triple their current traffic."
 }
 },
 {
 "@type": "Question",
 "name": "What if I want to switch back to Squarespace?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "You can. Your Squarespace account stays accessible after cancellation; the project is unpublished but not deleted. Re-upgrade your plan, point DNS back, and you're live again in about 30 minutes. There is no lock-in in either direction."
 }
 }
 ]
}
</script>
