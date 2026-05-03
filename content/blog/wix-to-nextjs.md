---
title: "Wix to Next.js: Yes, It's Possible (2026)"
slug: "wix-to-nextjs"
description: "Wix has zero code export. Most exit guides give up there. Here's the honest rebuild path. Manual content extraction, design rebuild, redirects, and free hosting forever."
date: "2026-05-03"
author: "Eject Team"
tags: ["wix", "nextjs", "migration", "cloudflare-pages", "vendor-lock-in", "seo"]
ogImage: "/og/wix-to-nextjs.png"
canonical: "https://eject.co/blog/wix-to-nextjs"
---

# Wix to Next.js: Yes, It's Possible (2026)

You typed "wix to nextjs" into Google because you already know the answer to a question Wix doesn't want you to ask: **how do I get my site out?**

You poked around the Wix help center. You found the "export" pages. You read the part where it says, very politely, that there is no way to export your site. You closed that tab. You opened a Reddit thread. Someone said "rebuild from scratch." You opened another tab. Someone tried to sell you a Wix-to-WordPress migrator that scrapes your live site like it's 2009. You closed that tab too.

You're here now. Good. We're going to take this seriously, because nobody else is.

Two truths up top. The first is that Wix is the worst lock-in in the modern website business. There is no code export. No CMS export. No "give me a zip of my site." Your content lives on their servers and only on their servers, by design. The second truth is that this doesn't actually matter. We can still get you out. It just takes more work than [Framer](https://eject.co/blog/framer-to-nextjs) or [Webflow](https://eject.co/blog/webflow-to-nextjs), and it requires you to think about the migration as a rebuild with content recovery, not a one-click export.

This post is the long version of that rescue mission. You'll get:

- [The honest 36-month cost of staying on Wix](#the-cost-math) (with 2026 plan pricing)
- [Why Wix lock-in is structurally worse than every other platform we cover](#the-lockin)
- [What you'll need to manually extract from your live site](#what-you-extract). Because there is no API
- [A 14-day rebuild playbook](#playbook) with the exact commands and screenshots you'll see
- [A decision tree for "DIY or hire someone"](#diy-or-hire) (spoiler: Wix sites lean toward "hire")
- [How you edit the new site](#chat-editor) by chatting with ChatGPT or Claude
- [An interactive cost calculator](#cost-calculator)
- [A FAQ with proper schema](#faq) so this article pulls its weight in search

Reading time: about 18 minutes. Time-to-payback after migration: usually 4 to 12 months. Let's get you out.

---

## The honest cost math {#the-cost-math}

Let's start with the part Wix's pricing page is technically correct about and emotionally misleading on: how much your site actually costs to run.

### Wix's [2026 plan pricing](https://www.wix.com/upgrade/website), unpacked

As of 2026, Wix sells four website tiers (Studio is a separate product for agencies and not what most small businesses are on):

| Plan | Monthly | What's included |
|---------------|---------|------------------------------------------------|
| Light | $17/mo | 2 GB storage, light traffic, Wix branding off |
| Core | $29/mo | Basic store, marketing tools, 50 GB bandwidth |
| Business | $36/mo | Full e-commerce, advanced marketing, 100 GB |
| Business Elite | $159/mo | Unlimited stuff, "priority" support |

These are the annual-prepay numbers. Month-to-month is roughly 25 percent more. Most small-business sites are on Core or Business.

Then there are the add-ons, which is where the bill quietly grows:

- **Email marketing.** Wix's bundled tier is fine for hobbyists. The moment you have a real list, you're paying $10–$50/mo on top.
- **Booking / scheduling.** Built-in but capped on the lower tiers; the upsell is $20–$30/mo for businesses that take appointments.
- **App Market subscriptions.** Most "free" Wix Apps are freemium. A typical small site has 3–5 paid apps at $5–$15/mo each.
- **Premium fonts, premium templates, premium stock images.** Optional. Most sites end up with at least one.

We're not making this up to scare you. Walk through the [Wix pricing page](https://www.wix.com/upgrade/website) and the [Wix App Market](https://www.wix.com/app-market) yourself. The base plan is the appetizer.

### The 36-month all-in (typical small-business site)

Imagine the site of a real small business. Say, a yoga studio with a class schedule, a contact form, a blog, and an online booking flow. They're on the Core plan. They use one paid scheduling app and one paid email-marketing add-on. They renew annually because Wix gives them a discount and the prepay locks them in for another year, which is the point.

| Line item | Monthly | 36-month |
|-------------------------------|---------|----------|
| Wix Core plan | $29 | $1,044 |
| Scheduling / booking app | $25 | $900 |
| Email marketing add-on | $20 | $720 |
| Premium template & font (one-time, amortized) | $5 | $180 |
| Annual price increase buffer (~7 percent / yr) | $10 | $360 |
| **Total** | **$89** | **$3,204** |

For a Business plan customer with e-commerce, the same math comes out near **$5,000 over 3 years**. For a Business Elite customer, you're staring at **$6,000+ just for the base plan**, before any apps.

### What the same site costs as a self-hosted Next.js app

| Line item | Monthly | 36-month |
|-------------------------------|---------|----------|
| Cloudflare Pages (hosting) | $0 | $0 |
| Cloudflare Workers (functions, free tier)| $0 | $0 |
| Domain (you already pay this on Wix too) |. |. |
| Sanity / Notion as CMS (free tier) | $0 | $0 |
| Resend (forms, 3,000/mo free) | $0 | $0 |
| Cal.com self-hosted (booking) | $0 | $0 |
| **Total** | **$0** | **$0** |

That's a **~$3,000 to $6,000 difference over 3 years** for a typical Wix site. And unlike Wix, the hosting bill doesn't go up next year because somebody at Wix headquarters held a "growth strategy" meeting.

But the numbers aren't even the strongest argument. The strongest argument is the next section.

---

## The lock-in story (this is the real one) {#the-lockin}

Here's the part Wix doesn't put on the pricing page.

**Wix has no code export. None.** Not "export-to-HTML on the Premium plan." Not "API-only for the Business tier." There is no button, no setting, no support email, no engineering escalation, no enterprise contract that gets you a copy of your own website.

To verify, go look. Wix has [a help center article](https://support.wix.com/en/article/can-i-export-my-wix-website) titled. And we are quoting them. *"Can I export my Wix website?"* The first line of the answer is: no. They have published, in plain English, the policy that your site cannot leave their servers in any standard form.

Compare that to:

- **[Webflow](https://eject.co/blog/webflow-to-nextjs)**: has a paid HTML/CSS export and a CMS API. Imperfect, but you can leave with your content.
- **[Framer](https://eject.co/blog/framer-to-nextjs)**: ships an official static export to ZIP. One button. Done.
- **Squarespace**: limited export but supports the WordPress XML format for blog posts.
- **Shopify**: full export of products, orders, customers as CSV or via API.

And then there's Wix. The structurally worst lock-in in the modern website business, by a clear margin. With **230 million users globally**, this is not a niche problem.

### Why this matters more than the monthly bill

Lock-in compounds. The longer you stay, the more it costs to leave, because the more content you've created on a platform that lets you author content but not retrieve it.

Three concrete failure modes we see all the time:

1. **The price hike.** Wix has raised prices roughly every 12–18 months for the last several years. When they do it again. And they will. You can either pay or rebuild from scratch. There is no third option. There is no "I'll port my site to a cheaper host."
2. **The feature deprecation.** Wix has, more than once, deprecated entire products (Wix Code, the original ADI, certain template families). When that happens, customers on those products are quietly migrated, sometimes losing functionality, with no opt-out.
3. **The acquisition / strategy pivot.** SaaS platforms get sold or pivot. If Wix decides tomorrow to sunset the small-business tier in favor of agency-only Wix Studio, your site becomes a hostage in a corporate roadmap meeting you weren't invited to.

The point isn't that any of these are imminent. The point is that on every other platform we cover, you have an exit. On Wix, you do not. **Your only insurance policy is to leave while the leaving is still under your control.**

This is also why "wix to nextjs" search volume is so low and the SERP is so thin. Most people who try to leave Wix get to the second paragraph of an article like this one, see the words "no export," and decide it's impossible. It isn't. It's just work. Below is the work.

---

## What you'll need to manually extract {#what-you-extract}

Because there is no Wix API for content retrieval, the migration runs in reverse: instead of *exporting from* Wix, you *scrape from* the live site you've been paying to host. Your published pages are public, so this is fine. It's your content, on your domain.

Here is the inventory you'll need to manually pull. Plan on a full afternoon for a 20-page site, longer if you have a deep blog.

### 1. Page text and structure

Open every page in Chrome. Right-click → **View Page Source** → save the HTML. Or, faster, use a free site crawler:

- **[Wget](https://www.gnu.org/software/wget/)** with `--mirror` if you're comfortable on the command line:
 ```bash
 wget --mirror --convert-links --adjust-extension --page-requisites --no-parent https://yoursite.com
 ```
- **[HTTrack](https://www.httrack.com/)** if you want a GUI.
- **[Screaming Frog SEO Spider](https://www.screamingfrog.co.uk/seo-spider/)** (free up to 500 URLs). The cleanest option, gives you a CSV of every URL, title, meta, H1, and word count.

You will get HTML that's about 80 percent useful. Wix wraps everything in deeply nested div soup, but the actual copy is in there.

![placeholder: Screaming Frog crawler showing a table of all URLs from a Wix site with status codes, titles, and word counts]

### 2. Blog posts

Wix's blog has an RSS feed at `https://yoursite.com/blog-feed.xml` (sometimes `/feed`, depending on template). That feed includes the full body of each post in HTML. Save it. That is your single most valuable artifact in the entire migration, because it's the closest thing Wix offers to a content export and most people don't know it exists.

```bash
curl -o blog-feed.xml https://yoursite.com/blog-feed.xml
```

Open it in any text editor. Each `<item>` is a post with title, body HTML, publish date, and slug. We have a [free RSS-to-markdown script](https://eject.co/tools/wix-rss-export) that converts the feed into a directory of Markdown files ready to drop into a Next.js content folder.

### 3. Images

Wix serves images from their `static.wixstatic.com` CDN with cryptic IDs. To get clean copies:

1. View source on each page, find every `wixstatic.com` URL.
2. Strip the URL parameters (the parts after the last `/`) to get the original.
3. Download with `curl` or your browser.

Or. Easier. Use the wget mirror command above, which pulls images automatically into a `static.wixstatic.com/` folder mirroring the original paths.

![placeholder: terminal output of wget mirroring a Wix site, showing it downloading 312 images and 24 HTML pages]

### 4. Forms and form submissions

Wix forms post to Wix's backend. There is no way to retrieve historical submissions in bulk. Wix only lets you view them in their dashboard or export the most recent batch as a CSV. Before cutover:

- Log into Wix → **Form Submissions** → export every form as CSV.
- Save these CSVs separately. They're your customer list.

### 5. Bookings, products, members

If you use Wix Bookings, Wix Stores, or Wix Members, you'll need to manually export each:

- **Bookings:** Wix Dashboard → Bookings → Services → export sessions and customer list as CSV.
- **Stores:** Wix Dashboard → Store Products → export products as CSV. Order history is downloadable too.
- **Members:** Wix Dashboard → Contacts → export the full contact list as CSV.

### 6. SEO meta and the sitemap

Pull `https://yoursite.com/sitemap.xml`. Save it. This is your URL inventory and your single source of truth for redirects later. Anything in this file needs to either still exist at the same URL on the new site, or 301 to its new home.

```bash
curl -o sitemap.xml https://yoursite.com/sitemap.xml
```

### 7. Custom domain and DNS

Make sure you own your domain at a real registrar (Cloudflare Registrar, Namecheap, Google Domains, etc.). If your domain was purchased through Wix, transfer it out *before* you migrate. Wix will let you transfer with a code, but it can take up to a week.

That is the complete extraction list. Note what is *not* on the list: a `package.json`, a `.zip` of your site, a JSON dump of CMS records, or anything resembling structured data. None of those exist. But after a few hours of careful scraping, you will have everything you actually need: the text, the images, the URLs, the metadata, and the customer lists.

---

## The 14-day rebuild playbook {#playbook}

Wix migrations take longer than [Framer](https://eject.co/blog/framer-to-nextjs) or [Webflow](https://eject.co/blog/webflow-to-nextjs) because of the manual content extraction in the previous section. Plan for two real weeks instead of the one weekend a Framer rebuild can take. If you only have evenings, stretch it to three weeks. That's fine.

### Day 1. Audit and inventory

Before any code, walk the site and write down what you have:

- Every page (Home, About, Services, Contact, Blog, individual posts, legal)
- Every form (Contact, Newsletter, Booking)
- Every dynamic feature (Stores, Bookings, Members, Forum, etc.)
- Every external integration (Mailchimp, Google Analytics, Calendly, Zapier)
- Every redirect or vanity URL you've set up in Wix's URL Redirect Manager

Save it as `migration-plan.md`. Doesn't need to be polished. Needs to be complete.

![placeholder: a Notion or markdown document listing all pages, forms, and features of a Wix site as a checklist]

### Day 2. Extract everything (the manual part)

Run the Screaming Frog crawl. Run the wget mirror. Save the RSS feed. Export every CSV from the Wix dashboard. Save the sitemap.

Drop everything into a fresh `/wix-archive/` directory in your migration folder. You will refer back to this dozens of times over the next two weeks. Treat it like an archaeological dig site. You're not going to be able to come back and re-extract things easily once you've cancelled your Wix subscription.

### Day 3. Convert content to markdown

Run the RSS-to-markdown converter on `blog-feed.xml`. You should now have a `/content/blog/` folder full of `.md` files, one per post, each with frontmatter (title, date, slug, etc.) and clean Markdown body.

For non-blog pages, copy the visible text out of the HTML manually into Markdown. This is annoying but takes about 15 minutes per page. Do not try to convert the Wix HTML directly. It's wrapped in 14 layers of nested div soup. Easier to highlight the page in your browser, paste into a Markdown file, and clean it up.

![placeholder: VS Code split view with a Wix page on the left and a clean Markdown version on the right]

### Day 4. Scaffold the Next.js app

```bash
npx create-next-app@latest mysite --typescript --tailwind --app
cd mysite
npm install
npm run dev
```

Open `http://localhost:3000`. You have a working Next.js 15 app on Tailwind. This took 90 seconds. The dev server has hot reload. Every change you save is reflected in the browser instantly.

![placeholder: the default Next.js homepage running on localhost:3000]

### Day 5. Set up your content layer

Pick one:

- **Markdown in `/content/`** (recommended for most Wix migrants). You already have markdown from Day 3. No external CMS required. Free forever. Edit posts by editing files.
- **[Sanity](https://www.sanity.io/)** if you have ten or more contributors and want a familiar editor UI. Free tier covers most small businesses.
- **[Notion](https://www.notion.so/) as a CMS** if your team already lives in Notion. The [Notion API](https://developers.notion.com/) is clean and free.

Most small businesses leaving Wix should start with markdown. You're a one- or two-person operation. You don't need a CMS layer. You need a `/content/blog/post-slug.md` file you can edit in any text editor or via the [chat editor](#chat-editor) we describe below.

### Day 6. Rebuild the homepage and core pages

Open your old Wix site in one browser window. Open VS Code in the other. Rebuild Home, About, Services, Contact in `app/page.tsx`, `app/about/page.tsx`, etc. Keep the copy verbatim from your live Wix site. Google ranks the words you have, not the words you'd like to have. Don't break that on day one.

For layout, paste a screenshot of each Wix section into [Cursor](https://cursor.com/), [v0.dev](https://v0.dev/), or [Claude](https://claude.ai/) and ask for a Tailwind component. You'll get to 80 percent in minutes. Polish the last 20 percent by hand.

![placeholder: side-by-side comparison of a live Wix homepage and a rebuilt Next.js version on localhost]

### Day 7. Rebuild the blog

Two routes: `app/blog/page.tsx` (the index) and `app/blog/[slug]/page.tsx` (individual posts).

If you went with markdown:

```typescript
// app/blog/[slug]/page.tsx
import fs from 'node:fs/promises'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

export default async function Post({ params }: { params: { slug: string } }) {
 const file = await fs.readFile(`content/blog/${params.slug}.md`, 'utf8')
 const { data, content } = matter(file)
 const body = await remark().use(html).process(content)
 return (
 <article className="prose mx-auto py-16">
 <h1>{data.title}</h1>
 <div dangerouslySetInnerHTML={{ __html: body.toString() }} />
 </article>
 )
}
```

That's the whole blog. About 40 lines for the index page too. Cheaper than the cheapest Wix plan, and faster on every Lighthouse metric.

### Day 8. Polish typography and visual design

Install [Tailwind Typography](https://tailwindcss.com/plus/?fp=tw-typography) (`@tailwindcss/typography`) and add `prose` to your blog body. Free, gorgeous, one class.

Pick fonts that match your Wix site. Most Wix sites use Google Fonts under the hood, so check your live page's CSS in DevTools to see what's actually loading and use the same font in `next/font/google`.

![placeholder: Lighthouse score panel showing 100/100/100/100 for the rebuilt site, vs. a typical Wix score of around 38]

While we're here: Wix sites famously score badly on Lighthouse. The community average is around **38 out of 100** on mobile, weighted heavily by Core Web Vitals. A bare-bones Next.js + Tailwind site on Cloudflare Pages typically scores **95+ out of the box**. That's a real SEO and conversion-rate improvement, not a vanity metric.

### Day 9. Forms and bookings

For contact forms, build a `/api/contact/route.ts`:

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

Add [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) on the front-end for spam filtering. Total cost: $0/mo for up to 3,000 form sends.

For bookings, install [Cal.com](https://cal.com/). Open source, self-hostable, embeds into Next.js with a single component. Free tier covers most small businesses.

### Day 10. SEO infrastructure

- Install [`next-sitemap`](https://www.npmjs.com/package/next-sitemap). Configure it to generate from your routes. Run on every build.
- Add `app/robots.ts` returning a Robots config.
- Add `generateMetadata` to every page. Pull title, description, og:image from your content.
- Add structured data: [`Organization`](https://schema.org/Organization) on the homepage, [`Article`](https://schema.org/Article) on blog posts, [`LocalBusiness`](https://schema.org/LocalBusiness) if you're a brick-and-mortar.

### Day 11. Deploy to Cloudflare Pages

Push your repo to GitHub. In the [Cloudflare dashboard](https://dash.cloudflare.com/), click **Pages → Connect to Git → select your repo**. Build command: `npm run build`. The Cloudflare [Next.js adapter](https://developers.cloudflare.com/pages/framework-guides/nextjs/) handles the rest.

First deploy is roughly 90 seconds. You now have a `*.pages.dev` URL. Click around, test every page, submit a form, verify analytics fire.

![placeholder: Cloudflare Pages dashboard showing a successful first deploy with build logs]

### Day 12. Redirects (this is critical)

Pull your saved `sitemap.xml` from Day 2. Cross-reference every URL on it against your new site's URL structure. For every URL pattern that's changing, write a 301 redirect.

If you used Wix's default URL structure (and most people do), your blog posts probably live at `/post/some-slug`. On Next.js you'll have `/blog/some-slug`. Add this redirect to `next.config.js`:

```javascript
async redirects() {
 return [
 { source: '/post/:slug', destination: '/blog/:slug', permanent: true },
 ]
}
```

Repeat for every changed URL pattern. **The single biggest source of post-migration SEO damage is missing 301s.** Take the time to get this right.

### Day 13. DNS cutover

In Cloudflare DNS, point your apex (`yourdomain.com`) and `www` to the Pages project. Cloudflare auto-issues SSL.

Don't unpublish your Wix site immediately. Keep it live on a subdomain like `legacy.yourdomain.com` for 24 hours so you have a fallback if anything breaks.

Crawl your new site with Screaming Frog. Compare the report to your pre-cutover Wix crawl. Every URL that was returning a 200 should still be a 200. Fix any 404s before turning Wix off.

![placeholder: Screaming Frog showing 0 4xx errors and a green status bar after the cutover]

### Day 14. Cancel Wix and breathe

24 hours after cutover, with no errors in your logs and traffic stable in Plausible or GA4:

1. Cancel your Wix Premium plan. (You can leave the free Wix account in place if you want archival access to the dashboard for old form submissions.)
2. Resubmit your sitemap in [Google Search Console](https://search.google.com/search-console).
3. Set up [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/) (free, privacy-friendly).
4. Pour something. You just escaped the worst lock-in in the website business.

---

## "Should I DIY or hire someone?" {#diy-or-hire}

Honest answer up front: of the four platforms we cover, **Wix is the least DIY-friendly migration**. Not because Next.js is hard. Because the source platform refuses to give you any structured data, and the manual extraction step requires patience that most small-business owners don't want to spend their evenings on.

Here's the decision tree.

### When DIY makes sense

- Your site is small (under 15 pages, under 50 blog posts)
- You're already comfortable in the terminal
- You enjoy this kind of project
- You have 30+ hours over two weeks to spend
- You're not running a real revenue stream that a one-day outage would damage

If all five are true, DIY is fine. The Eject Express tier ($49) gives you the toolkit and you do the rest.

### When you should pay someone (this is most Wix sites)

- Your site has bookings, e-commerce, or member areas
- You don't want to learn the command line
- You have more money than time
- The site generates real revenue and downtime costs you actual money
- You've tried before and got stuck on Day 2 staring at HTML soup

If you nodded at any of these, **the Concierge tier exists for you specifically**. It's $299, takes 7 days, and you don't have to touch the manual extraction step. We do the scraping, the rebuild, the redirects, and the cutover. You review and approve.

### When you should NOT migrate at all (yet)

Be honest with yourself. Wix is sometimes the right answer for now. **Don't migrate if:**

- **You sell physical products and Wix Stores is working fine.** Self-hosted e-commerce is its own deep rabbit hole. Worth it eventually, but not on your first migration.
- **Your site is a landing page that gets fewer than 100 visitors a month.** The migration savings are real but small. Spend the time on marketing instead, then migrate next year.
- **You have a multi-language site with content trees that are tightly bound to a Wix template.** Doable, but the rebuild gets longer.
- **The site is operated by 5+ non-technical people who all need to edit it daily.** The [chat editor](#chat-editor) helps, but in-house Wix expertise can be cheaper than retraining everyone.

Otherwise: keep going.

---

## The chat editor (this is what changed) {#chat-editor}

The objection that used to kill Next.js migrations from Wix is the editing workflow. "But I'm not a coder, I just want to change the headline."

Fair. And until recently, that meant either learning Markdown or paying a developer every time you wanted to edit a page. So most small businesses stayed on Wix.

That's not the world anymore. After your migration is done, you edit your site by **chatting with ChatGPT or Claude in plain English**. Eject ships every customer with a paste-in instructions kit. A small text file that tells the AI exactly how your site is structured and how to make changes safely. The workflow:

1. Open ChatGPT or Claude.
2. Paste in the kit (one paragraph, you do this once).
3. Type the change you want, plain English. *"Change the homepage headline to 'Berkeley's only organic dog bakery' and add a third service called 'Birthday cake delivery.'"*
4. The AI gives you the exact file edits.
5. Paste them in. Push. Cloudflare deploys in 30 seconds.

If something breaks: **one click rolls back** to the previous deploy. Cloudflare Pages keeps every deploy forever; rollback is instant and free.

![placeholder: a ChatGPT conversation with a paste-in instructions kit followed by a request to change the homepage headline, with the AI returning the exact code edit]

This is the part that didn't exist three years ago, and it's the reason "Wix vs. self-hosted Next.js" used to be a real tradeoff and now isn't. You get the developer-grade output (fast, free, owned, exportable) and the marketer-grade workflow (chat in English, see the change). You stop paying $89/month for the privilege of using a website builder that won't let you leave.

---

## How much will YOU save? {#cost-calculator}

The calculator below takes your current Wix setup. Plan, paid apps, team size. And shows you the 36-month delta on Eject + Cloudflare Pages.

<CostCalculatorEmbed />

**Inputs:**
- Current Wix plan (Light / Core / Business / Business Elite)
- Number of paid apps you have installed
- Whether you use Wix Bookings, Wix Stores, Wix Members
- Annual price-increase assumption (default 7 percent, the rough historical average)

**Outputs:**
- 36-month total cost on Wix (with realistic add-on and inflation projections)
- 36-month total cost on Eject + Cloudflare Pages (one-time migration + $0/mo hosting)
- Net savings, broken out line by line
- A shareable URL with your scenario pre-loaded (so you can send it to your business partner)

For most readers of this post, the number lands between $2,800 and $7,200. For Business Elite customers with three or more paid apps, it crosses $9,000.

---

## FAQ {#faq}

### Can I export my Wix site?

No. Wix has zero code export. Their [own help center](https://support.wix.com/en/article/can-i-export-my-wix-website) confirms this in plain English. There is no "give me an HTML zip," no CMS API, no enterprise tier that unlocks export. The only way to leave Wix with your content is to scrape your live site, save your blog's RSS feed, and manually export form submissions and customer lists from the dashboard. We document the full extraction in [the section above](#what-you-extract).

### Why is Wix migration harder than Webflow or Framer?

Because Wix gives you nothing. [Framer](https://eject.co/blog/framer-to-nextjs) ships an official static export. [Webflow](https://eject.co/blog/webflow-to-nextjs) has a CMS API. Wix has neither. Every other platform we cover gives you at least a partial path out. Wix is the only one where the migration starts with scraping your own public website. That's why our timeline is 14 days instead of 7, and why we lean toward recommending the Concierge tier for Wix specifically.

### Will my SEO survive the migration?

Yes, if you do it correctly. Three rules:

1. Keep every URL identical where possible. If Wix had your contact page at `/contact`, the new Next.js version should also live at `/contact`.
2. 301 redirect every URL that has to change (this most often applies to blog posts, where Wix uses `/post/slug` and most Next.js sites use `/blog/slug`).
3. Don't ship until your `next-sitemap` output covers everything from your saved Wix sitemap.

Done right, you won't see a ranking drop. Most sites see a small ranking lift because Cloudflare's edge is dramatically faster than Wix's hosting on Core Web Vitals. And Wix's average Lighthouse score is widely reported around 38, while a clean Next.js site usually scores 95+.

### Is Cloudflare Pages really free?

Yes. The [free plan](https://www.cloudflare.com/plans/developer-platform/) includes unlimited static requests, unlimited bandwidth, 500 builds per month, and 100,000 Worker invocations per day. Most Wix-scale sites would not hit any of these caps if every visit somehow tripled. Cloudflare's business model is enterprise contracts and DNS. They give the developer tier away because it costs them very little and is a long funnel into paid usage.

### What about my booking system / store / membership?

Bookings: [Cal.com](https://cal.com/) is free, open-source, embeddable, and works in any Next.js app. Stores: if you have a small product catalog, [Shopify Lite](https://www.shopify.com/lite) embeds for $9/mo. For larger catalogs, Shopify headless on Next.js is the path. Memberships: [Clerk](https://clerk.com/) free tier covers 10,000 monthly active users, with Stripe integration baked in.

### What if I want to switch back to Wix?

You can. Your old Wix site lives on the free Wix tier as an archive (just on a `wixsite.com` subdomain). Re-upgrade your plan, point DNS back, you're live again in about 30 minutes. We don't lock you in. That's the entire pitch.

### How long does the migration actually take?

Solo, evenings + a weekend: **14 days** for a typical small-business site. Add a few days if you have e-commerce or bookings. With our Concierge tier: **7 business days, hands-off**. Express tier (DIY with our toolkit): same 14-day estimate but the toolkit removes about 30 percent of the manual extraction time.

### How much does it cost?

The migration itself: **$49** (Express, you do the work with our toolkit) or **$299** (Concierge, we do everything in 7 days). After migration, your hosting is **$0/month** on Cloudflare Pages. Compared to Wix's typical $89/month all-in, payback on Concierge is between 4 and 8 months. Express pays back in under 2 months.

---

## Ready? Pick your tier. {#cta}

| Tier | Price | What you get |
|------|-------|--------------|
| **Express** | **$49 one-time** | Auto-rebuild kit, the Wix RSS-to-markdown converter, Screaming Frog crawl templates, Next.js starter, Cloudflare deploy guide, paste-in chat editor instructions. You do the work. |
| **Concierge** | **$299 one-time** | We do everything. Manual content extraction, design rebuild, redirects, cutover. 7-day delivery. You review and approve. Includes 30 days of post-launch support and the chat editor onboarded for your team. |
| **Custom** | **Talk to us** | Heavy e-commerce, multi-language, member areas, or sites with 500+ pages. We scope and quote. |

**[Start your migration →](https://eject.co/start)**

Or if you're not sure yet: [run the calculator](#cost-calculator). The number tends to make the decision for you.

If you're on a different platform, we have honest playbooks for those too: [Webflow → Next.js](https://eject.co/blog/webflow-to-nextjs) and [Framer → Next.js](https://eject.co/blog/framer-to-nextjs). The Wix one is the longest because Wix made it the longest. Not our choice.

---

<script type="application/ld+json">
{
 "@context": "https://schema.org",
 "@type": "FAQPage",
 "mainEntity": [
 {
 "@type": "Question",
 "name": "Can I export my Wix site?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "No. Wix has zero code export. No HTML zip, no CMS API, no enterprise tier that unlocks export. The only way to leave Wix with your content is to scrape your live site, save your blog's RSS feed, and manually export form submissions and customer lists from the Wix dashboard."
 }
 },
 {
 "@type": "Question",
 "name": "Why is Wix migration harder than Webflow or Framer?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Because Wix gives you no structured export. Framer ships an official static export and Webflow has a CMS API. Wix has neither, so every Wix migration begins with manually scraping the public website. That's why the typical timeline is 14 days instead of 7."
 }
 },
 {
 "@type": "Question",
 "name": "Will my SEO survive the migration from Wix to Next.js?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Yes, if done correctly. Keep every URL identical where possible, 301 redirect anything that has to change, and don't ship until your sitemap matches your old Wix sitemap. Most sites see a small ranking lift because Next.js on Cloudflare's edge is dramatically faster than Wix on Core Web Vitals."
 }
 },
 {
 "@type": "Question",
 "name": "Is Cloudflare Pages really free for a Wix-scale site?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Yes. The Cloudflare Pages free plan includes unlimited static requests, unlimited bandwidth, 500 builds per month, and 100,000 Worker invocations per day. Most Wix-scale sites would not approach these caps even at triple their current traffic."
 }
 },
 {
 "@type": "Question",
 "name": "What replaces Wix Bookings, Wix Stores, and Wix Members?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Cal.com is a free, open-source replacement for Wix Bookings that embeds in Next.js. Shopify Lite covers small product catalogs for $9 per month, and Shopify headless covers larger ones. Clerk's free tier covers 10,000 monthly active users for membership and authentication, with Stripe integration."
 }
 },
 {
 "@type": "Question",
 "name": "What if I want to switch back to Wix?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "You can. The old Wix site sits archived on the free Wix tier on a wixsite.com subdomain. Re-upgrade your plan, point DNS back, and you're live again in about 30 minutes. There's no lock-in in either direction."
 }
 },
 {
 "@type": "Question",
 "name": "How long does a Wix-to-Next.js migration take?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Solo with the Express toolkit: about 14 days of evenings and a weekend. With the Concierge tier where we do everything: 7 business days, hands-off."
 }
 },
 {
 "@type": "Question",
 "name": "How much does the migration cost?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Express is $49 one-time and you do the work with our toolkit. Concierge is $299 one-time and we do everything in 7 business days. After migration, hosting is $0 per month on Cloudflare Pages. Compared to Wix's typical $89 monthly cost with apps, Concierge pays back in 4 to 8 months."
 }
 }
 ]
}
</script>
