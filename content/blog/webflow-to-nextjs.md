---
title: "Webflow to Next.js: The 14-Day Migration Playbook (2026 Edition)"
slug: "webflow-to-nextjs"
description: "Webflow's CMS plan starts at $23/mo and balloons fast. Here's the honest 36-month math, the day-by-day playbook to migrate to Next.js on Cloudflare Pages, and an interactive cost calculator. No fluff."
date: "2026-05-02"
author: "Eject Team"
tags: ["webflow", "nextjs", "migration", "cloudflare-pages", "cms", "jamstack", "seo"]
ogImage: "/og/webflow-to-nextjs.png"
canonical: "https://eject.dev/blog/webflow-to-nextjs"
---

# Webflow to Next.js: The 14-Day Migration Playbook (2026 Edition)

You opened your Webflow billing page. You saw a number. You closed the tab. You opened it again. You did some napkin math. You realized you've been paying for one site what an entire startup pays for production infrastructure on AWS. You typed "webflow to nextjs" into Google.

Welcome. You're in the right place.

This is the long version of that search. We're going to walk through:

- [What Webflow actually costs over 36 months](#the-honest-cost-math) (with real numbers, not the ones on the marketing page)
- [What you'll lose by leaving](#what-you-actually-lose) and what to replace each piece with
- [A day-by-day, 14-day migration playbook](#the-14-day-playbook) you can run yourself this weekend
- [A decision tree](#diy-or-hire) for "should I do this myself or pay someone"
- [The chat editor](#the-chat-editor). The thing that makes Next.js viable for non-developers
- [An interactive cost calculator](#cost-calculator)
- [FAQ](#faq) (with proper schema markup, because your blog should pull its weight)

Total reading time: about 18 minutes. Total payback: roughly $4,000–$8,000 over three years. Let's go.

---

## The honest cost math {#the-honest-cost-math}

Here's the thing nobody on Webflow's pricing page wants to walk you through: the listed plan price is the appetizer. The bill arrives later.

### Webflow's [2025–2026 pricing structure](https://webflow.com/pricing), unpacked

A small B2B marketing site with a blog needs, at minimum, a **CMS Site Plan** ($23/mo paid annually, or $29 month-to-month). That's the floor. Underneath are Basic ($14) and Starter (free), which don't include a CMS. So they're useless for anything with a blog.

But here's where it gets fun. CMS plan ships with:

- **2,000 CMS items** (the cap)
- **250 form submissions per month**
- **200 GB bandwidth**
- **3 guest editors** included on the workspace

Cross any of those, and you upgrade. Your options:

| Plan | Monthly (annual) | CMS items | Form submissions | Bandwidth |
|--------------|------------------|-----------|------------------|-----------|
| CMS | $23 | 2,000 | 250/mo | 200 GB |
| Business | $39 | 10,000 | 2,500/mo | 400 GB |
| Enterprise | Custom (~$235+) | 10,000+ | Custom | Custom |

Now layer on the **Workspace** (the team account that owns the projects). For 2+ editors you need a paid Workspace, starting at $19/user/month for the Core plan. A typical 3-person marketing team running their own site lands at **~$57/mo just for the seats**, before the site plan.

### The 36-month all-in (typical small B2B SaaS)

Let's say you have:

- A blog with ~400 posts and growing (2,000 cap is fine for now, but you'll hit Business plan within 18 months)
- 600 form submissions a month from your demo + newsletter forms (you'll need Business)
- 350 GB bandwidth (you're over CMS, fine on Business)
- 3 marketers in the workspace
- One designer who freelances quarterly (1 guest editor. Included)

| Line item | Monthly | 36-month |
|-------------------------------|---------|----------|
| Business Site Plan | $39 | $1,404 |
| Workspace Core (3 seats) | $57 | $2,052 |
| Estimated overage buffer* | $15 | $540 |
| **Total** | **$111**| **$3,996** |

*Form add-ons, bandwidth spikes during launch weeks, occasional CMS-item-cap upgrades when you import a partner directory.

### What the same site costs on Cloudflare Pages

| Line item | Monthly | 36-month |
|-------------------------------|---------|----------|
| Cloudflare Pages (hosting) | $0 | $0 |
| Cloudflare Workers (functions)| $0* | $0* |
| Domain (you already pay this) |. |. |
| Sanity / Payload CMS (free tier) | $0 | $0 |
| Resend (forms, 3K/mo free) | $0 | $0 |
| **Total** | **$0** | **$0** |

*Cloudflare's free tier on Pages is genuinely free: unlimited static requests, unlimited bandwidth, 500 builds/month, 100K Worker requests/day. For a site doing a few thousand visits a day, you will never see a bill. ([Cloudflare Pages pricing](https://www.cloudflare.com/plans/developer-platform/))

That's a **~$4,000 difference over 3 years** for a typical small B2B site. For an agency running 5 client sites? **$20,000.** For a 10-person company on Enterprise ($235+/mo)? You're looking at **$8,500+ saved per site, per 3 years**.

The question isn't whether to migrate. It's whether you're going to rip the bandage off in two weeks or pay another $111/month while you think about it.

---

## What you actually lose by leaving Webflow {#what-you-actually-lose}

Time for the honest part. Webflow does several things genuinely well, and if you migrate without a replacement plan you're going to find out which ones the hard way.

Here's what you're giving up, and what plugs the hole.

### 1. The visual editor

**What Webflow does:** drag-drop, live preview, designer-friendly. Non-developers can ship a hero section without breaking the build.

**Replacement:** This is the legitimate hard problem. Three options:
- **[Tailwind](https://tailwindcss.com/) + AI-assisted code editing** (our pick). The new generation of LLM-powered editors lets you describe a change in plain English and watch the JSX update. We built [Eject's chat editor](#the-chat-editor) specifically to fill this gap.
- **[Builder.io](https://www.builder.io/)**. Visual page builder that compiles to Next.js components. Adds a vendor.
- **Just hand off Figma + a developer.** Honest answer for design-heavy sites.

### 2. The CMS

**What Webflow does:** Reference fields, plain-text + rich-text fields, image management, a clean editor UI for marketers.

**Replacement (pick one):**
- **Markdown files in the repo**. Best for engineering-led teams. Free, version-controlled, but marketers have to learn Git or you build them an admin.
- **[Sanity](https://www.sanity.io/)**. Free tier covers 3 users, 10K documents, 100GB bandwidth. The closest 1:1 to Webflow CMS. Strong choice for content-heavy teams.
- **[Payload CMS](https://payloadcms.com/)**. Self-hosted, open source, runs alongside your Next.js app. Free forever if you have a database (and Cloudflare D1 is free).
- **[Notion](https://www.notion.so/) as a CMS**. Via [Notion API](https://developers.notion.com/). Marketers love it. Cheap.

### 3. Forms

**What Webflow does:** Native form handling, captures submissions, emails you on submit, basic spam filtering.

**Replacement:** [Resend](https://resend.com/) (3,000 free emails/mo) + a Cloudflare Worker route handler. About 40 lines of code, total. Add [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) for free spam filtering. It's the [hCaptcha](https://www.hcaptcha.com/) replacement that doesn't show your visitors a "select all the boats" puzzle.

### 4. Hosting

**What Webflow does:** Global CDN, SSL, automatic deploys.

**Replacement:** Cloudflare Pages does all three for free, on a CDN that's measurably faster than Webflow's. ([Cloudflare's network spans 330+ cities](https://www.cloudflare.com/network/) vs. Webflow's AWS-backed ~30 PoPs.)

### 5. Redirects

**What Webflow does:** UI-based 301 redirects in project settings.

**Replacement:** A `_redirects` file at the root of your build, or `next.config.js` redirects. Both are version-controlled, both deploy with the rest of the site, both work.

### 6. Password protection

**What Webflow does:** Per-page or site-wide password gating.

**Replacement:** [Cloudflare Access](https://www.cloudflare.com/zero-trust/products/access/) (free up to 50 users), or [Clerk](https://clerk.com/) for a real auth layer (10K MAU free).

### 7. SEO meta editor

**What Webflow does:** Per-page title, description, og:image fields in the UI.

**Replacement:** Next.js's [`generateMetadata`](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) function is, frankly, better. You can compute meta dynamically from your CMS. If your CMS layer has a `seoTitle` field, the function reads it and you're done.

### 8. Sitemaps

**What Webflow does:** Auto-generated XML sitemap.

**Replacement:** [`next-sitemap`](https://www.npmjs.com/package/next-sitemap). One npm install, one config file, runs at build time. Done.

That's the whole inventory. Eight things. Each has a free or near-free replacement. The only one that requires real thought is the visual editor. Which is exactly the problem the rest of this article is about solving.

---

## The 14-day day-by-day playbook {#the-14-day-playbook}

Two weeks. Evenings and one weekend. You can do this.

### Day 1. Audit and inventory

Before you write a single line of code, take stock. Open your Webflow project and list:

- Every page (Home, Pricing, About, Blog, individual posts, legal)
- Every CMS Collection (Blog Posts, Authors, Categories, Customers, Case Studies)
- Every form (Contact, Newsletter, Demo Request)
- Every redirect rule
- Every external integration (Mailchimp, Calendly embed, Intercom)

![placeholder: screenshot of a Webflow Designer panel with the CMS Collections list expanded, showing field types]

Save this as `migration-plan.md` in a fresh directory. Doesn't need to be pretty. Needs to be complete.

### Day 2. Export everything you can

Webflow's CMS export is gated. Here's the [Webflow Help Center page confirming](https://help.webflow.com/hc/en-us/articles/33961356147347-Export-your-site) that you need a Site Plan to export the static HTML/CSS. But the more useful path is the **CMS API**.

Get a [Webflow API token](https://help.webflow.com/hc/en-us/articles/33961203217171-API-access-token) (Site Settings → Apps & Integrations → Generate API Token). Then:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
 "https://api.webflow.com/v2/sites/YOUR_SITE_ID/collections"
```

That returns every collection schema. For each collection, hit `/collections/{id}/items` and dump to JSON. We've published a [free export script](https://eject.dev/tools/webflow-export) (Node, MIT license, no signup) that does the whole tree in one command and saves it as a directory of markdown files.

![placeholder: terminal showing the export script running, with "Exported 412 blog posts, 8 authors, 24 categories" output]

### Day 3. Pick your CMS layer

Decision tree:

- **Under 100 content items, single author, you write code?** → Markdown in `/content`. Done. Move on.
- **100–1,000 items, marketers update content?** → Sanity. Free tier handles you.
- **1,000+ items, complex relationships, want to self-host?** → Payload + Cloudflare D1.
- **Marketers already live in Notion?** → Notion API as CMS. Surprisingly clean.

Our default recommendation for B2B SaaS migrating from Webflow: **Sanity**. It's the closest workflow match to what your team already knows.

### Day 4. Scaffold Next.js + Tailwind

```bash
npx create-next-app@latest mysite --typescript --tailwind --app
cd mysite
npm install
npm run dev
```

Open `http://localhost:3000`. You have a working Next.js 15 app. This took 90 seconds.

![placeholder: Next.js default homepage in the browser at localhost:3000]

If you picked Sanity:

```bash
npm install next-sanity @sanity/image-url
npx sanity@latest init --bare
```

Sanity Studio is now embedded in your Next.js app at `/studio`. Marketers will edit content there.

### Day 5. Rebuild the design system

Don't try to perfectly recreate your Webflow site. You're going to copy the spirit, not the literal HTML. Open your live site in one window, your editor in the other.

Start with global tokens. Colors, fonts, spacing. In `tailwind.config.ts`. Then build atoms (Button, Input, Card) before pages.

![placeholder: side-by-side of live Webflow site and a localhost Next.js rebuild with the same hero section]

Tip: paste a screenshot of each section into [v0](https://v0.dev/), [Cursor](https://cursor.com/), or your AI editor of choice and ask for the Tailwind component. You'll get to 80% in minutes. Polish the last 20% by hand.

### Day 6. Rebuild Home + Pricing + About

These are static pages. They live in `app/page.tsx`, `app/pricing/page.tsx`, `app/about/page.tsx`. Copy the structure. Keep the copy verbatim from Webflow (it ranks for things. Don't break that).

End of Day 6 you should have your top 3 marketing pages running locally, indistinguishable from production at first glance.

### Day 7. Rebuild the blog

Two routes: `app/blog/page.tsx` (the index) and `app/blog/[slug]/page.tsx` (individual posts).

If you went with Sanity, fetch is a one-liner:

```typescript
const posts = await client.fetch(`*[_type == "post"] | order(publishedAt desc)`)
```

If markdown, use [`gray-matter`](https://www.npmjs.com/package/gray-matter) + [`next-mdx-remote`](https://www.npmjs.com/package/next-mdx-remote).

Get every post rendering. Don't worry about styling perfection yet. That's Day 8.

### Day 8. Polish, typography, dark mode if you want it

Use [Tailwind Typography](https://tailwindcss.com/plus/?fp=tw-typography) (`@tailwindcss/typography`) for the article body. Free, gorgeous, one class (`prose`).

![placeholder: two-column comparison of the same blog post in Webflow and in the new Next.js site]

### Day 9. Forms

Build a `/api/contact/route.ts`:

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

Add [Turnstile](https://www.cloudflare.com/products/turnstile/) on the front-end. Total cost: $0/mo for up to 3,000 form sends.

### Day 10. SEO infrastructure

- Install `next-sitemap`. Configure it. Run `next-sitemap` after build.
- Add `app/robots.ts` returning a Robots config.
- Add `generateMetadata` to every page that needs custom og:image, title, description.
- Add structured data. At minimum, [`Organization`](https://schema.org/Organization) on the homepage and [`Article`](https://schema.org/Article) on blog posts.

![placeholder: Lighthouse score panel showing 100/100/100/100 for the new build]

### Day 11. Set up Cloudflare Pages

Push your repo to GitHub. In the [Cloudflare dashboard](https://dash.cloudflare.com/), click **Pages → Connect to Git → select your repo**. Build command: `npm run build`. Output: `.next` (Pages handles the adapter automatically with the new [Workers + Next.js integration](https://developers.cloudflare.com/pages/framework-guides/nextjs/)).

First deploy takes about 90 seconds. You now have a `*.pages.dev` URL. Test everything.

### Day 12. Redirects and 301s

Pull your sitemap from Webflow. For every URL pattern that's changing. Be honest, some will. Write a 301 in `next.config.js`:

```javascript
async redirects() {
 return [
 { source: '/old-blog/:slug', destination: '/blog/:slug', permanent: true },
 ]
}
```

If your URL structure is staying identical (and you should try to make this true), you don't need any redirects. Either way, **keep every existing URL alive at the same path** if at all possible. Google noticed when you ranked for these. Don't make Google re-learn your site.

### Day 13. DNS cutover, zero downtime

You've already verified the Cloudflare Pages preview at `*.pages.dev`. Now:

1. In Cloudflare DNS, point your apex (`yourdomain.com`) and `www` to the Pages project. Cloudflare auto-issues SSL.
2. **Don't unpublish Webflow yet.** Keep it live for 24 hours as a fallback.
3. Check the live domain. Hit every important page. Submit forms. Verify Google Analytics is firing.
4. Run a [Screaming Frog](https://www.screamingfrog.co.uk/seo-spider/) crawl against the new domain. Compare to a pre-cutover crawl of the Webflow site. Fix any 404s.

![placeholder: Screaming Frog showing 0 4xx errors and a green status bar]

### Day 14. Decommission Webflow + monitor

24 hours after cutover, with no errors in [Sentry](https://sentry.io/) and traffic stable in [Plausible](https://plausible.io/) or GA4:

1. Cancel the Webflow CMS Site Plan. (You can keep the Workspace free for archival access.)
2. Set up [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/) (free, privacy-friendly).
3. Resubmit your sitemap in [Google Search Console](https://search.google.com/search-console).
4. Pour something. You just saved $4,000.

---

## The "should I do this myself" decision tree {#diy-or-hire}

Real talk: not every site is a good candidate for migration, and not every owner should DIY.

### When DIY makes sense

- You write at least a little code (HTML/CSS/JavaScript familiarity counts)
- The site is mostly content + forms (marketing site, blog, docs)
- You have ~30 hours over two weeks
- You enjoy this kind of project (or at least don't hate it)

### When you should pay someone (us, or anyone competent)

- The site is generating real revenue and a 1-day outage would hurt
- You don't write code and don't want to learn
- You have more money than time
- You've tried before and it stalled

### When you should NOT migrate at all

Be honest about this. Webflow is sometimes the right answer. **Don't migrate if:**

- **Heavy e-commerce.** Webflow Ecommerce is fine for what it is. [Shopify](https://www.shopify.com/) headless on Next.js is more work than the Webflow bill saves you, unless you're already an engineer.
- **Multi-language with content trees.** Doable, but the migration is 2x the work. Worth it only at scale.
- **Authenticated member areas with billing.** You'd be rebuilding [Memberstack](https://www.memberstack.com/), Stripe checkout, the works. Hire a full team.
- **Sites where the CMS editor is operated by 5+ non-technical people daily.** The chat editor helps, but in-house Webflow expertise can be cheaper than retraining everyone.

If any of those are you: stay on Webflow, negotiate your annual rate, and revisit in a year.

If none of those are you: keep reading.

---

## The chat editor. The missing piece {#the-chat-editor}

Here's the core objection to leaving Webflow: "but my marketing team can't edit code."

True. Until recently.

Eject ships with an AI chat editor that sits on top of your migrated Next.js site. Your marketers describe a change in plain English:

> "Make the hero headline 'Build faster than your competitors' and change the CTA to 'Start free trial'."

The editor:

1. Parses the request, finds the relevant component (`Hero.tsx`)
2. Generates a code change as a PR
3. Spins up a preview deploy on Cloudflare Pages (a unique `*.pages.dev` URL)
4. Shows the marketer the live preview
5. On approval, merges to main and the change goes live

If something breaks: **one click rolls back** to the previous deploy. Cloudflare Pages keeps every deploy forever; rollback is instant.

![placeholder: chat editor UI with a marketer typing "swap the hero headline" and a preview iframe rendering the change]

This is the part that didn't exist two years ago. It's why "Webflow vs. Next.js" used to be a real tradeoff, and now isn't. You get the developer-grade output and the marketer-grade workflow. You stop paying $111/month for the privilege of running a Squarespace competitor on training wheels.

---

## How much will YOU save? {#cost-calculator}

Below is the live calculator. Plug in your current Webflow setup, see your 36-month delta on Eject + Cloudflare Pages.

<CostCalculatorEmbed />

**Inputs:**
- Current Webflow plan (Basic / CMS / Business / Enterprise)
- Number of CMS items
- Monthly bandwidth (GB)
- Number of team members in your Workspace

**Outputs:**
- 36-month total cost on Webflow (with overage projections)
- 36-month total cost on Eject + Cloudflare Pages (one-time migration + $0/mo hosting)
- Net savings, broken out by line item
- A shareable URL with your scenario pre-loaded (so you can send it to your CFO)

For most readers of this post, the number is between $3,200 and $9,800.

---

## FAQ {#faq}

### Can I export my Webflow site?

Partially. Webflow lets you export static HTML/CSS only on a Site Plan, and **the [CMS export is locked behind paid plans](https://help.webflow.com/hc/en-us/articles/33961356147347-Export-your-site)**. The cleanest path is the [CMS API](https://developers.webflow.com/). It gives you full data access and is what we use in the [Eject export tool](https://eject.dev/tools/webflow-export).

### What happens to my CMS content?

It comes with you. Every collection, every item, every reference field. Our exporter dumps it to JSON or markdown. From there, you import into Sanity, Payload, Notion, or just commit the markdown to your repo. Nothing is lost.

### Will my SEO survive the migration?

Yes. If you do it correctly. Three rules:

1. Keep every URL identical where possible (`/blog/post-slug` stays `/blog/post-slug`).
2. 301 redirect anything that has to change.
3. Don't ship until your `next-sitemap` output matches your Webflow sitemap.

Done right, you won't see a ranking drop. Many sites see a small lift from the speed improvement (Cloudflare's edge is faster than Webflow's hosting on Lighthouse Core Web Vitals).

### Is Cloudflare Pages really free?

Yes. The [free plan](https://www.cloudflare.com/plans/developer-platform/) includes unlimited static requests, unlimited bandwidth, 500 builds/month, and 100K Worker invocations per day. For a typical small-to-medium B2B marketing site, you will not hit any of those caps. Cloudflare's business model is enterprise contracts and DNS. They give away the dev tier because it's cheap for them and a long funnel into paid Workers usage.

### What if I want to switch back to Webflow?

You can. Your Webflow project sits archived on the free Workspace plan. Spin up a new Site Plan, re-publish, point DNS back. About 30 minutes of work. No lock-in either direction. That's the point.

### How long does the migration actually take?

Solo, evenings + a weekend: **10–14 days**. With our [Done-with-You](#cta) tier: **5 business days**. Done-for-You: **3 business days**, hands-off.

### How much does it cost?

The migration itself: $49 (DIY tool), $299 (with our help), or $1,499 (we do everything). After that, your hosting is **$0/month** on Cloudflare Pages, plus whatever your CMS layer costs (free tier on Sanity is generous). Compared to Webflow's $111/mo for a similar setup, payback is between 4 and 14 months depending on tier.

### What about my forms?

Forms become 40 lines of code in a Next.js [route handler](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) plus a [Resend](https://resend.com/) account (3,000 emails/mo free). Spam protection via [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) (free, no CAPTCHA puzzles). Submissions can be emailed to you, posted to Slack, or written to a database. Your call.

---

## Ready? Pick your tier. {#cta}

| Tier | Price | What you get |
|------|-------|--------------|
| **DIY** | **$49 one-time** | The full export toolkit, Webflow → markdown converter, Next.js starter template, Cloudflare deploy guide. You do the work. |
| **Done-with-You** | **$299 one-time** | Everything above + 5 business days of async Slack support with our migration team + a code review of your final repo before cutover. |
| **Done-for-You** | **$1,499 one-time** | We migrate the whole site for you. 3 business days. You review and approve. Includes 30 days of post-launch support and the chat editor onboarded for your team. |

**[Start your migration →](https://eject.dev/start)**

Or if you're not sure yet: [run the calculator](#cost-calculator). The number tends to make the decision for you.

---

<script type="application/ld+json">
{
 "@context": "https://schema.org",
 "@type": "FAQPage",
 "mainEntity": [
 {
 "@type": "Question",
 "name": "Can I export my Webflow site?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Partially. Webflow lets you export static HTML and CSS only on a paid Site Plan, and the CMS export is locked behind paid plans. The cleanest path is the Webflow CMS API, which gives full data access. The Eject export tool uses this API to extract everything in one command."
 }
 },
 {
 "@type": "Question",
 "name": "What happens to my CMS content?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "It comes with you. Every collection, every item, every reference field. The Eject exporter dumps your CMS to JSON or markdown. From there, you import into Sanity, Payload, Notion, or commit the markdown to your repo. Nothing is lost."
 }
 },
 {
 "@type": "Question",
 "name": "Will my SEO survive the migration?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Yes, if done correctly. Keep every URL identical where possible, 301 redirect anything that has to change, and don't ship until your sitemap matches your Webflow sitemap. Most sites see a small ranking lift from the speed improvement on Cloudflare's edge network."
 }
 },
 {
 "@type": "Question",
 "name": "Is Cloudflare Pages really free?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Yes. Cloudflare Pages free plan includes unlimited static requests, unlimited bandwidth, 500 builds per month, and 100,000 Worker invocations per day. For a typical small-to-medium B2B marketing site, you will not hit any of those caps."
 }
 },
 {
 "@type": "Question",
 "name": "What if I want to switch back to Webflow?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "You can. Your Webflow project sits archived on the free Workspace plan. Spin up a new Site Plan, re-publish, point DNS back. About 30 minutes of work. There is no lock-in in either direction."
 }
 },
 {
 "@type": "Question",
 "name": "How long does the migration take?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Solo, evenings plus a weekend: 10 to 14 days. With Eject Done-with-You support: 5 business days. Done-for-You: 3 business days, hands-off."
 }
 },
 {
 "@type": "Question",
 "name": "How much does the migration cost?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "The migration is $49 (DIY tool), $299 (Done-with-You), or $1,499 (Done-for-You). After that, hosting is free on Cloudflare Pages, plus your CMS layer which is typically free on Sanity's starter tier. Compared to Webflow's $111 monthly average, payback is 4 to 14 months."
 }
 },
 {
 "@type": "Question",
 "name": "What about my forms?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Forms become 40 lines of code in a Next.js route handler plus a Resend account, free for 3,000 emails per month. Spam protection via Cloudflare Turnstile is also free and does not show CAPTCHA puzzles. Submissions can be emailed, posted to Slack, or written to a database."
 }
 }
 ]
}
</script>
