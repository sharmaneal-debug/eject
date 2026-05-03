---
title: "Framer to Next.js: The Honest Migration Guide"
slug: "framer-to-nextjs"
description: "Framer doesn't ship a code export. Here's the honest rebuild path. What it costs, what you lose, what you keep, and the day-by-day playbook to get out without losing your design."
date: "2026-05-03"
author: "Eject Team"
tags: ["framer", "nextjs", "migration", "cloudflare-pages", "vendor-lock-in", "seo"]
ogImage: "/og/framer-to-nextjs.png"
canonical: "https://ejectfrom.com/blog/framer-to-nextjs"
---

# Framer to Next.js: The Honest Migration Guide
You designed something beautiful in Framer. You shipped it. Traffic is decent. The site looks better than 95% of the internet. Then last October you got an email about pricing changes, and the site you'd been paying $20 a month for is suddenly a different number, and a different number again if you want to keep the CMS the way it is, and your stomach did the thing where you realize the tool you fell in love with is now charging you rent on your own design.

You typed "framer to nextjs" into Google. You're in the right place.

Quick truth: Framer is one of the best **design** tools that has ever existed. It is, simultaneously, one of the most aggressive lock-in **businesses** that has ever existed. Those two things are not in tension. They are the same fact.

This guide is the long version of the search you just did:

- [What Framer actually costs over 36 months](#the-cost-math), including the [October 2025 price hike](https://www.reddit.com/r/framer/) that broke a lot of client retainers
- [What you actually lose by leaving](#what-you-lose). And the free or near-free Next.js equivalent for each piece
- [A 14-day day-by-day rebuild playbook](#playbook) you can run on evenings and a weekend
- [A decision tree](#diy-or-hire) for "should I do this myself or hire someone"
- [The chat editor](#chat-editor). The thing that makes Next.js viable for a small business owner who has never opened VS Code
- [A live cost calculator](#cost-calculator) so you can see your specific number
- [FAQ](#faq) with the questions everyone asks but nobody answers honestly

Reading time: about 17 minutes. Three-year payback for the average reader: between $1,800 and $7,200. Let's go.

---

## The honest cost math

Framer's pricing page lists tidy little numbers. The bill you actually pay is a different shape.

### Framer's [current pricing](https://www.framer.com/pricing/), unpacked

There are two stacks: **Site plans** (per project) and **Workspace plans** (per team).

Site plans, as of this writing:

| Plan | Monthly (annual) | What you get |
|------|------------------|--------------|
| Mini | $10 | Up to 1,000 visitors/mo, no CMS, single page only |
| Basic | $20 | Custom domain, 10K visitors/mo, no CMS |
| Pro | $30 | CMS (1,000 items), 100K visitors/mo, password protect |
| Business | $80 | CMS (10,000 items), 1M visitors/mo, advanced analytics |

For any real marketing site with a blog, the floor is **Pro at $30/mo**. Anything with traffic that matters or a partner directory ends up on **Business at $80/mo**.

Then the **Workspace** layer sits on top. Free is fine for a solo. The moment a freelancer or marketer needs editor access, you're on a paid Workspace seat. Multiply by team size.

### The October 2025 receipt

Last October, Framer pushed a pricing update that bumped existing customers off legacy plans. The [113-upvote thread on r/Framer](https://www.reddit.com/r/framer/) made the rounds. Quoting the gist of dozens of comments: agencies who had quoted clients $20/mo for hosting suddenly had $30, $50, $80 invoices. Mid-contract, with the SaaS-classic "we're improving our service" email as the only justification.

If you've been on Framer since 2023 or earlier, you probably remember when the Pro tier was cheaper, the visitor caps were higher, and the CMS limits were softer. None of that is coming back. This is the direction of travel.

### The 36-month all-in (typical small business site)

Let's price out a real-world setup: a marketing site with a blog, two team members editing, ~15K monthly visitors, and one freelance designer rolling in quarterly.

| Line item | Monthly | 36-month |
|-----------|---------|----------|
| Framer Pro (Site plan) | $30 | $1,080 |
| Workspace seats (2 paid editors @ $15) | $30 | $1,080 |
| Estimated overage / Business upgrade after traffic grows | $30 | $1,080 |
| **Total** | **$90** | **$3,240** |

If you're an agency running 4 client sites? **~$13,000 over three years**, just in Framer fees. None of which is going toward owning anything.

### What the same site costs on Next.js + Cloudflare Pages

| Line item | Monthly | 36-month |
|-----------|---------|----------|
| Cloudflare Pages (hosting) | $0 | $0 |
| Cloudflare Workers (functions) | $0 | $0 |
| Domain (you already pay this) |. |. |
| Sanity / Notion / markdown CMS (free tier) | $0 | $0 |
| Resend (forms, 3K/mo free) | $0 | $0 |
| **Total** | **$0** | **$0** |

For most readers, the three-year delta is somewhere between **$1,800 and $7,200**. For agencies with multiple client sites, it's a meaningful share of a salary.

The math isn't whether to migrate. The math is whether you'll do it in two weeks or pay another $90/mo for a year while you think about it.

---

## What you actually lose by leaving Framer

This is the part most "Framer alternatives" posts skip. Framer does several things genuinely well, and if you migrate without a plan for each one you'll find out which ones the hard way.

Here's the inventory, with a Next.js replacement for each.

### 1. The visual canvas

**What Framer does:** drag-drop, layered design, exact pixel control, the best free-flow design canvas of any website builder. This is the thing you fell in love with.

**Replacement:** This is the legitimate hard part. Three honest options:

- **[Tailwind](https://tailwindcss.com/) + an AI editor.** [Cursor](https://cursor.com/), [v0](https://v0.dev/), or our [chat editor](#chat-editor) lets you describe a change in plain English and watch the JSX update. Not as fluid as Framer's canvas, but you get a real codebase as the output.
- **[Builder.io](https://www.builder.io/).** Visual page builder that compiles to Next.js components. Trades one vendor for another, but it's a vendor with an export.
- **Hand off Figma + a developer.** Honest answer if the design is the whole product.

### 2. Animations (the framer-motion magic)

**What Framer does:** wild scroll-driven animations, springs, parallax, the stuff that makes Framer sites feel alive.

**Replacement:** Plot twist. You keep them. [framer-motion](https://www.framer.com/motion/) is open source, MIT-licensed, and rebrands as [Motion](https://motion.dev/). It's the same animation engine that powers Framer itself, and you can install it with `npm install motion` and have springs, scroll triggers, and parallax in your Next.js app within 10 minutes. The fancy thing you thought was Framer-exclusive is a free npm package.

### 3. The CMS

**What Framer does:** structured collections (Posts, Authors, Categories), rich-text fields, image uploads, a clean editor UI for non-developers.

**Replacement (pick one):**

- **Markdown files in the repo.** Best for solo operators. Free, version-controlled, and works with the [chat editor](#chat-editor). You can ask it to "add a new post titled X" and it commits the file for you.
- **[Sanity](https://www.sanity.io/).** Free tier covers 3 users, 10K documents. The closest 1:1 to Framer CMS.
- **[Notion as a CMS](https://developers.notion.com/).** If your team already lives in Notion, this is shockingly clean. Marketers love it.
- **[Payload CMS](https://payloadcms.com/).** Self-hosted, open source, runs alongside your Next.js app on Cloudflare D1.

### 4. Forms

**What Framer does:** drag a form on the canvas, set up a submission target, get an email when someone fills it out. Capped on lower plans.

**Replacement:** [Resend](https://resend.com/) (3,000 free emails/mo) + a Next.js [route handler](https://nextjs.org/docs/app/building-your-application/routing/route-handlers). About 40 lines of code total. Add [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) for free, invisible spam protection. No "select all the boats" puzzles for your visitors.

### 5. Password protection

**What Framer does:** per-page or site-wide passwords on the Pro tier and above.

**Replacement:** [Cloudflare Access](https://www.cloudflare.com/zero-trust/products/access/) (free up to 50 users), or [Clerk](https://clerk.com/) for a real auth layer with magic links and social logins (10K MAU free).

### 6. Hosting + CDN

**What Framer does:** global CDN, automatic SSL, fast publish workflow.

**Replacement:** [Cloudflare Pages](https://pages.cloudflare.com/) does all three, for free, on a network that's measurably faster. Cloudflare's edge spans [330+ cities](https://www.cloudflare.com/network/); Framer hosts on a smaller subset of AWS PoPs. You will not feel a slowdown after migrating.

### 7. SEO meta editor

**What Framer does:** per-page title, description, og:image fields in the right-hand panel.

**Replacement:** Next.js's [`generateMetadata`](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) function is, frankly, better. You can compute meta dynamically from your CMS. If your post has a `seoTitle` field, the function reads it and you're done. Set defaults once at the layout level and override per-page only when needed.

### 8. The "code export" question

**What Framer does:** [nothing](https://www.framer.com/help/articles/can-i-export-my-website-to-html-and-self-host-it/). The Framer help center is unusually candid here. Quoting the page directly, you "cannot export." There is no official HTML/CSS export. There is no API to dump your design. The lock-in is the actual product.

**Replacement:** This is what Eject is for. We render your live Framer URL, parse the HTML structure, extract your CMS data, lift your assets, and rebuild it as a clean Next.js + Tailwind codebase. The [Express tier](#cta) is $49 and runs automatically. The [Concierge tier](#cta) is $299 and a human walks the rebuild end to end.

That's the whole list. Eight things. Each has a free or near-free replacement. The hard one is the canvas, and that's exactly what the rest of this article is about solving.

> Sister post: if you also have a Webflow site (or you're comparing the two), the [Webflow to Next.js migration playbook](/blog/webflow-to-nextjs) covers the same ground for Webflow's slightly different lock-in flavor.

---

## The 14-day day-by-day rebuild playbook

Two weeks. Evenings and one weekend. Nothing in here requires a CS degree.

### Day 1. Audit and inventory

Open your Framer project and list everything. Don't skip this. The migrations that go sideways skip this.

- Every page (Home, About, Pricing, Blog, individual posts, legal)
- Every CMS Collection (Blog Posts, Authors, Case Studies, etc.)
- Every form (Contact, Newsletter, Demo)
- Every external embed (Calendly, Intercom, YouTube, Mailchimp)
- Every animation that matters (the hero parallax, the scroll-driven section, the magnetic buttons)

![placeholder: screenshot of the Framer left sidebar showing the Pages and CMS Collections tree]

Save this as `migration-plan.md` in a fresh folder. It does not need to be pretty. It needs to be complete.

### Day 2. Lift the design data

Framer doesn't expose a nice export API. Two paths:

**Path A. Automated (recommended).** Drop your live URL into [ejectfrom.com](https://ejectfrom.com), it pulls the published HTML for every route, extracts your CMS items by crawling your collection list pages, and packages it as a downloadable codebase. The Express tier ($49) does this and gives you a Next.js starter ready to deploy.

**Path B. Manual.** Open your live site, view-source each page, save the HTML, save the assets, copy CMS items by hand. Tedious but possible. About 6–10 hours for a 20-page site.

```bash
# Manual path: archive the live site
wget --mirror --convert-links --adjust-extension \
 --page-requisites --no-parent https://yourdomain.com
```

This gives you a folder of HTML and assets you can reference while rebuilding. Not the final codebase. Just the source material.

![placeholder: terminal showing wget mirror output with "Downloaded 47 files, 18MB" message]

### Day 3. Pick your CMS layer

Decision tree:

- **Under 50 content items, you'll write the posts yourself?** → Markdown in `/content`. Done. Move on.
- **50–500 items, marketers update content?** → Sanity. Free tier handles you.
- **Already living in Notion?** → Notion API as CMS. Surprisingly clean.
- **1,000+ items, complex relationships, want to self-host?** → Payload + Cloudflare D1.

Default recommendation for someone migrating off Framer: **markdown** if you write the blog yourself, **Notion** if a non-developer does. Sanity is a great third option if you want a dedicated editor.

### Day 4. Scaffold Next.js + Tailwind + Motion

```bash
npx create-next-app@latest mysite --typescript --tailwind --app
cd mysite
npm install motion
npm run dev
```

Open `http://localhost:3000`. You have a working Next.js 15 app with Tailwind and the Motion animation library installed. Total time: 2 minutes.

![placeholder: Next.js default homepage running at localhost:3000 with terminal showing the dev server output]

### Day 5. Rebuild the design system

Don't try to perfectly clone Framer pixel-for-pixel. Aim for the spirit, not the literal HTML. Open your live site in one window, your editor in another.

Start with global tokens. Colors, fonts, spacing. In `tailwind.config.ts`. Build atoms (Button, Input, Card) before pages. Keep it small and composable.

![placeholder: side-by-side of the live Framer site and the localhost Next.js rebuild showing matching hero sections]

Trick: take a screenshot of each section, paste it into [v0.dev](https://v0.dev/) or your AI editor, and ask for the Tailwind component. You'll get to 80% in minutes. Hand-polish the last 20%.

### Day 6. Rebuild Home + About + Pricing

These are static pages. They live in `app/page.tsx`, `app/about/page.tsx`, `app/pricing/page.tsx`. Copy the structure. Keep the **copy** verbatim from Framer. That copy ranks for things, don't break that.

End of Day 6 you should have your top three marketing pages running locally, indistinguishable at first glance from production.

### Day 7. Bring back the animations

Now the fun part. The thing you were most worried about losing.

```typescript
"use client"
import { motion } from "motion/react"

export function Hero() {
 return (
 <motion.h1
 initial={{ opacity: 0, y: 40 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.8, ease: "easeOut" }}
 >
 Build faster than your competitors
 </motion.h1>
 )
}
```

Every Framer animation primitive (springs, scroll progress, hover, drag, layout transitions) is a one-liner in Motion. The [Motion docs](https://motion.dev/) are excellent. Bookmark them.

![placeholder: Motion documentation page showing the springs + scroll-trigger examples with live previews]

### Day 8. Rebuild the blog

Two routes: `app/blog/page.tsx` (the index) and `app/blog/[slug]/page.tsx` (individual posts).

If you went markdown:

```typescript
import fs from "fs"
import matter from "gray-matter"

const posts = fs.readdirSync("./content/blog").map((file) => {
 const raw = fs.readFileSync(`./content/blog/${file}`, "utf-8")
 const { data, content } = matter(raw)
 return {...data, content, slug: file.replace(".md", "") }
})
```

If Sanity, fetch is a one-liner: `await client.fetch('*[_type == "post"] | order(publishedAt desc)')`.

If Notion, use [`@notionhq/client`](https://www.npmjs.com/package/@notionhq/client) and [`notion-to-md`](https://www.npmjs.com/package/notion-to-md) to query a database and render pages as MDX. About 80 lines of glue code.

Get every post rendering. Worry about typography on Day 9.

### Day 9. Polish, typography, dark mode

Use [Tailwind Typography](https://tailwindcss.com/plus/?fp=tw-typography) (`@tailwindcss/typography`) for the article body. One class (`prose`) gives you better default typography than 90% of Framer sites.

![placeholder: two-column comparison of the same blog post rendered in Framer and in the new Next.js site]

### Day 10. Forms

Build a `/api/contact/route.ts`:

```typescript
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
 const data = await req.json()
 await resend.emails.send({
 from: "forms@yourdomain.com",
 to: "you@yourdomain.com",
 subject: "New contact form submission",
 text: JSON.stringify(data, null, 2),
 })
 return Response.json({ ok: true })
}
```

Add [Turnstile](https://www.cloudflare.com/products/turnstile/) on the front-end. Total cost: $0/mo for up to 3,000 submissions.

### Day 11. SEO infrastructure

- Install `next-sitemap`. Configure it. Run after build.
- Add `app/robots.ts`.
- Add `generateMetadata` to every page that needs custom og:image, title, description.
- Add structured data: [`Organization`](https://schema.org/Organization) on the homepage, [`Article`](https://schema.org/Article) on blog posts, `FAQPage` on FAQ pages.

![placeholder: Lighthouse score panel showing 100/100/100/100 for the new build]

### Day 12. Deploy to Cloudflare Pages

Push your repo to GitHub. In the [Cloudflare dashboard](https://dash.cloudflare.com/), click **Pages → Connect to Git → select your repo**. Build command: `npm run build`. Pages handles the Next.js adapter automatically with the [Workers + Next.js integration](https://developers.cloudflare.com/pages/framework-guides/nextjs/).

First deploy takes ~90 seconds. You now have a `*.pages.dev` preview URL. Click around. Test forms. Verify analytics.

### Day 13. Redirects + DNS cutover

Pull your sitemap from Framer (`yourdomain.com/sitemap.xml`). For every URL pattern that's changing, add a 301 in `next.config.js`:

```javascript
async redirects() {
 return [
 { source: "/old-path/:slug", destination: "/new-path/:slug", permanent: true },
 ]
}
```

If your URL structure is staying identical (and you should try to keep it that way), you don't need any redirects. **Keep every existing URL alive at the same path** if at all possible. Google noticed when you ranked for these. Don't make Google relearn your site.

Then, in Cloudflare DNS, point your apex (`yourdomain.com`) and `www` to the Pages project. Cloudflare auto-issues SSL. **Don't unpublish Framer yet**. Keep it as a fallback for 24 hours.

![placeholder: Cloudflare Pages dashboard showing the new deployment as Active with the custom domain attached]

### Day 14. Decommission Framer + monitor

24 hours after cutover, with stable analytics and no errors:

1. Cancel the Framer Site Plan and Workspace.
2. Run a [Screaming Frog](https://www.screamingfrog.co.uk/seo-spider/) crawl. Compare to your pre-cutover crawl. Fix any 404s.
3. Resubmit your sitemap in [Google Search Console](https://search.google.com/search-console).
4. Set up [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/) (free, privacy-friendly).
5. Pour something. You just bought back ~$3,200 over the next three years.

---

## Should I do this myself or hire someone?

Real talk. Not every site is a good DIY candidate, and not every owner should spend two weeks of evenings on this.

### When DIY makes sense

- You're comfortable reading and lightly editing code (HTML/CSS familiarity is enough)
- The site is mostly content + forms (marketing site, blog, portfolio, docs)
- You have ~25 hours over two weeks
- You actually enjoy this kind of project (or at least don't hate it)

### When you should pay someone

- The site is generating real revenue and a 1-day outage would actually hurt
- You don't write any code and don't want to learn
- You have more money than time
- You've already started a migration and it stalled

That's our [Express tier](#cta) ($49. Automated rebuild, you handle deploy) or [Concierge tier](#cta) ($299. A human walks it end to end, 7-day delivery).

### When you should NOT migrate at all

Be honest about this part. Framer is sometimes the right tool. **Don't migrate if:**

- **Heavy ecommerce.** Framer's ecommerce is limited, but if you're using it and it works, [Shopify](https://www.shopify.com/) headless on Next.js is more work than the Framer bill saves you. Stay put.
- **Multi-language sites with content trees.** Doable on Next.js with `next-intl` but the migration is roughly 2x the work. Worth it only at scale.
- **Authenticated member areas with billing.** You'd be rebuilding [Memberstack](https://www.memberstack.com/) plus Stripe Checkout plus session management. Hire a full team or stay put.
- **You're deep in Framer's interactive prototypes.** If half your site is bespoke scroll-driven storytelling, the rebuild cost is real. Plan for double the time, or hire it out.

If any of those are you: stay on Framer, negotiate your annual rate, revisit in a year.

If none of those are you: keep reading.

---

## The chat editor. The missing piece

Here's the core objection to leaving Framer: "I'm a small business owner, not a developer. Once it's in code I'll never touch it again."

Two years ago, that was true. Today it isn't.

Eject ships with a chat editor that sits on top of your migrated Next.js site. After the migration, you edit your site by typing into ChatGPT or Claude. Literally. We give you a "Site Editor Instructions" kit. Paste it into a new ChatGPT or Claude conversation, then describe what you want changed:

> "Make the hero headline say 'The fastest way to ship your weekend project' and change the CTA button to 'Start free trial'."

The model:

1. Reads your repo
2. Identifies the right component (`Hero.tsx`)
3. Generates a code change as a pull request
4. Spins up a preview deploy on Cloudflare Pages (a unique `*.pages.dev` URL)
5. Shows you the live preview
6. On approval, merges to main and the change goes live

If something breaks: **one click rolls back** to the previous deploy. Cloudflare keeps every deploy forever. Rollback is instant.

![placeholder: chat editor UI with a small business owner typing "swap the hero headline" and a preview iframe rendering the change in real time]

This is the part that did not exist when most of the "should I leave Framer?" debates were written. It's why the Framer-vs-Next.js tradeoff used to be real and now is mostly emotional. You get the developer-grade output (real codebase you own) with the Framer-grade workflow (describe what you want, see it happen). And you stop paying $90/mo for the privilege of designing inside someone else's billing system.

---

## How much will YOU save?

Below is the live calculator. Plug in your current Framer setup and see your 36-month delta on Eject + Cloudflare Pages.

<CostCalculatorEmbed />

**Inputs:**
- Current Framer Site plan (Mini / Basic / Pro / Business)
- Number of CMS items
- Monthly visitors
- Number of paid Workspace seats

**Outputs:**
- 36-month total cost on Framer (with the Oct 2025 increase factored in)
- 36-month total cost on Eject + Cloudflare Pages (one-time migration + $0/mo hosting)
- Net savings, broken out by line item
- A shareable URL with your scenario pre-loaded. Useful for the "honey, look at this" conversation

Most readers see a number between **$1,800 and $7,200**.

---

## FAQ

### Can I export my Framer site?

**No.** Not officially. Framer is unusually direct about this. Quoting the [help center](https://www.framer.com/help/articles/can-i-export-my-website-to-html-and-self-host-it/), the platform does "not support" exporting your site to HTML or self-hosting. Your design lives inside Framer's renderer and stays there.

That's exactly the gap Eject fills. We render your live URL, lift the HTML, extract CMS items by crawling your collection pages, and rebuild it as a clean Next.js + Tailwind codebase you own.

### What happens to my Framer animations?

You keep them. [framer-motion](https://www.framer.com/motion/). The open-source animation library that powers Framer itself. Is free, MIT-licensed, and now distributed as [Motion](https://motion.dev/). Install with `npm install motion`. The springs, scroll triggers, parallax, and gesture animations you loved are all one-liners in Next.js.

### Will my SEO survive the migration?

Yes, if you do it correctly. Three rules:

1. Keep every URL identical where possible (`/blog/post-slug` stays `/blog/post-slug`).
2. 301 redirect anything that has to change.
3. Don't ship until your `next-sitemap` output matches your Framer sitemap.

Done right, you won't see a ranking drop. Many sites see a small lift from the speed improvement (Cloudflare's edge is faster than Framer's hosting on Lighthouse Core Web Vitals).

### Is Cloudflare Pages really free?

Yes. The [free plan](https://www.cloudflare.com/plans/developer-platform/) includes unlimited static requests, unlimited bandwidth, 500 builds per month, and 100,000 Worker invocations per day. For a typical small-business marketing site, you will not hit any of those caps. Cloudflare's actual business is enterprise contracts. The free tier is a long funnel, not a loss leader they'll yank.

### What about my CMS content?

It comes with you. Every collection, every item, every reference field. Eject's exporter crawls your live collection pages and dumps everything to JSON or markdown. From there, you import into Sanity, Notion, Payload, or commit the markdown to your repo. Nothing is lost.

### What if I want to switch back to Framer?

You can. Your old Framer project sits archived on the free Workspace plan. Spin up a new Site plan, point DNS back. About 30 minutes of work. There is no lock-in in either direction. That's the point of owning a real codebase. Optionality.

### How long does the migration actually take?

Solo, evenings + a weekend: **10–14 days**. With our [Express tier](#cta): an automated rebuild in **under an hour**, then you deploy at your pace. With our [Concierge tier](#cta): **7 calendar days**, hands-off, a human walking the rebuild end to end.

### How do I edit my new site without writing code?

You chat with ChatGPT or Claude. Every Eject migration ships with a "Site Editor Instructions" kit you paste into a new chat. From there, you describe changes in plain English ("change the hero headline to X", "add a new pricing tier called Founder"). The model generates the code change, spins up a preview deploy, and you click approve. One-click rollback if you don't like it. See the [chat editor section](#chat-editor) for the full flow.

---

## Ready? Pick your tier.

| Tier | Price | What you get |
|------|-------|--------------|
| **Scan your URL** | **Free** | Drop your Framer URL into [ejectfrom.com](https://ejectfrom.com). We crawl your site and show you a preview of your migrated codebase before you pay anything. |
| **Express** | **$49 one-time** | Automated rebuild. Framer site → Next.js + Tailwind + Motion codebase, packaged as a GitHub repo. You deploy to Cloudflare Pages (we include the guide). Includes the chat editor instructions kit. |
| **Concierge** | **$299 one-time** | A human walks the migration end-to-end. 7 calendar days. We rebuild, deploy, set up redirects, verify SEO parity, and onboard your team to the chat editor. You review and approve. Includes 30 days of post-launch support. |

**[Scan your URL on the homepage →](https://ejectfrom.com)**

Or if you're not sure yet: [run the calculator](#cost-calculator). The number tends to make the decision for you.

---

<script type="application/ld+json">
{
 "@context": "https://schema.org",
 "@type": "FAQPage",
 "mainEntity": [
 {
 "@type": "Question",
 "name": "Can I export my Framer site?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "No. Framer does not officially support exporting your site to HTML or self-hosting. The platform's help center confirms this directly. Your design lives inside Framer's renderer. Eject fills this gap by rendering your live URL, lifting the HTML, extracting CMS items, and rebuilding the site as a clean Next.js plus Tailwind codebase you own."
 }
 },
 {
 "@type": "Question",
 "name": "What happens to my Framer animations?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "You keep them. Framer-motion, the open-source animation library that powers Framer itself, is free and MIT-licensed and now distributed as Motion. Install with npm install motion. The springs, scroll triggers, parallax, and gesture animations you loved are all available as one-liners in Next.js."
 }
 },
 {
 "@type": "Question",
 "name": "Will my SEO survive the migration?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Yes, if done correctly. Keep every URL identical where possible, 301 redirect anything that has to change, and do not ship until your sitemap matches your Framer sitemap. Most sites see a small ranking lift from the speed improvement on Cloudflare's edge network."
 }
 },
 {
 "@type": "Question",
 "name": "Is Cloudflare Pages really free?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Yes. The Cloudflare Pages free plan includes unlimited static requests, unlimited bandwidth, 500 builds per month, and 100,000 Worker invocations per day. For a typical small-business marketing site, you will not hit any of those caps."
 }
 },
 {
 "@type": "Question",
 "name": "What about my CMS content?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "It comes with you. Every collection, every item, every reference field. The Eject exporter crawls your live collection pages and dumps everything to JSON or markdown. From there, you import into Sanity, Notion, Payload, or commit the markdown to your repo. Nothing is lost."
 }
 },
 {
 "@type": "Question",
 "name": "What if I want to switch back to Framer?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "You can. Your old Framer project sits archived on the free Workspace plan. Spin up a new Site plan, point DNS back. About 30 minutes of work. There is no lock-in in either direction."
 }
 },
 {
 "@type": "Question",
 "name": "How long does the migration take?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Solo, evenings plus a weekend: 10 to 14 days. With Eject Express: an automated rebuild in under an hour, then you deploy at your pace. With Eject Concierge: 7 calendar days, hands-off, a human walking the rebuild end to end."
 }
 },
 {
 "@type": "Question",
 "name": "How do I edit my new site without writing code?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "You chat with ChatGPT or Claude. Every Eject migration ships with a Site Editor Instructions kit you paste into a new chat. From there, you describe changes in plain English. The model generates the code change, spins up a preview deploy, and you click approve. One-click rollback if you do not like it."
 }
 }
 ]
}
</script>
