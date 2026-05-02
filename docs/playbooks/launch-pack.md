---
title: Eject — Launch Asset Pack
project: "[[website-migration-service]]"
compiled: 2026-05-02
sources: [website-migration-service-research-2026-05-01.md]
audience: technical / quasi-technical (founders, indie hackers, growth eng)
tone: irreverent, educational, anti-corporate, contrarian-not-snarky
---

# Eject — Launch Asset Pack

A complete kit for the public launch of **Eject**: a productized service that migrates non-technical site owners off Framer / Webflow / Wix onto a self-hosted Next.js codebase on Cloudflare Pages, plus an AI chatbot editor that maintains the migrated codebase.

**One-line:** *Eject from Webflow. Own your site. Pay $5 a year.*

**Pricing:** DIY $49 · DwY $299 · DFY $1,499 · Editor MRR $79–$149/mo

---

## 1. Hacker News "Show HN" Launch Post

### Title (primary)

**Show HN: Eject – migrate your Framer/Webflow site to Next.js, edit it with chat**

### Alternate title variants

1. **Show HN: A $1,499 service that gets you off Webflow forever (hosting cost: $5/yr)**
2. **Show HN: Eject – the AI editor that lets non-coders own a Next.js codebase**

### Body

Hi HN — I built Eject because last October Framer rolled out a pricing change that broke client contracts mid-quote. The r/Framer thread complaining about it hit 113 upvotes in a day. Webflow did the same thing in late 2024 with their Workspace overhaul. Every few quarters, a hosted page-builder hikes its bill, the upgrade gets bundled into the editor you already pay for, and there is no opt-out short of rebuilding from scratch.

Eject does that rebuild for you. We crawl your live site, regenerate it as a clean Next.js codebase with Tailwind and shadcn/ui, hand you the GitHub repo, and deploy it to Cloudflare Pages. Three tiers: $49 if you want to run the CLI yourself, $299 if you want us to set it up alongside you, $1,499 if you want a finished migration and a hand-off call. After that, hosting on Cloudflare's free tier is genuinely $0, the domain is ~$5/yr, and there is no monthly subscription pointed at your homepage.

The technically interesting bit is that bare Next.js is the wrong product for the people who need this most. Marketers and founders won't open a PR to change a hero headline. So the wedge isn't the migration — it's a chat-driven editor that sits on the repo. You type "make the headline bigger and add a testimonial from Sarah at Acme," it writes the diff, runs a preview build, and ships on confirm. The model is constrained to a small whitelist of operations (text edits, image swaps, section reordering, component prop tweaks) so it can't melt your routing or ruin your Tailwind config. That part is $79–$149/mo and is what makes this not just another static-export tool.

Honestly, the failure modes are real. Sites that are 80% animation rely on Framer's runtime — we can rebuild the static structure but motion has to be re-authored, and we tell people that on the intake form. CMS-heavy Webflow sites with 200+ collection items need an actual content migration step, not a scrape; we charge extra and it takes longer. And the editor confidently regresses on edge-case Tailwind class collisions about 1 in 30 edits, which is why every change ships behind a preview URL and a one-click rollback. We are not pretending it's magic. The pitch is: own the code, pay platform-tax once, and use a chatbot for the 95% of edits that are boring text changes.

What I'd love feedback on: (1) Is the chat-editor scope right, or should it ship with a visual mode from day one? (2) Pricing — $1,499 DFY feels low for the value but high for the impulse buy; the people who hate Webflow most are the people who don't want to think about it. (3) For people who've migrated off page-builders before, what broke that I'm not anticipating?

Site: [eject.dev]   |   Demo: [eject.dev/demo]   |   Pricing: [eject.dev/pricing]

### Pinned founder top-comment (post immediately after submitting)

> Founder here — happy to take the obvious objections head-on:
>
> **"This is just a static scraper with a chatbot."** No — static scrapers give you dead HTML you can't edit. We output a real Next.js project with named components, typed props, and a Tailwind config that matches the source design system. The repo is yours, the editor is optional, and you can fork it and walk away from us.
>
> **"Why not just use v0 / Lovable / Bolt?"** Those tools are for *building new*. None of them ingest a live URL and produce a faithful component tree of an existing site. The 13K-star "AI Website Cloner Template" repo proved the URL-to-Next.js use case is real, but it's a developer skill, not a product. We are productizing it for people who don't want to install a CLI, paste an Anthropic key, and debug.
>
> **"Webflow has CMS, forms, e-commerce. You don't."** Correct, and that's the trade. We replace CMS with a Git-backed markdown collection (or Sanity if you want), forms with a one-line Cloudflare Workers handler, and e-commerce we just refuse — if you sell things, stay on Shopify. Eject is for marketing sites and personal sites, which is 80% of what's on Framer and Webflow.
>
> **"$5 a year is misleading."** Domain only. Cloudflare Pages free tier is genuinely free for the workloads we're targeting (under 100K requests/day, 500 builds/month). If you exceed that you're a real business and $20/mo Pro is fine.
>
> **"What's the long-term moat?"** It's the editor, not the migration. Migration is the wedge that gets a non-technical user a clean codebase. The editor is the recurring product. If we don't build the editor, the people we migrate just go back to Webflow in 6 months because they need to change a phone number and don't want to learn Git.

---

## 2. Product Hunt Launch Kit

### Tagline (under 60 chars)

> **Migrate off Framer/Webflow. Own a Next.js repo. Edit by chat.**

(58 chars including spaces)

Alternates if the above flags as too long after platform formatting:
- **Eject from Webflow. Own your site. $5/yr hosting.** (52)
- **The Webflow exit kit: Next.js repo + AI chat editor.** (54)

### Description (1–2 paragraphs)

Eject takes your live site on Framer, Webflow, or Wix and rebuilds it as a clean Next.js codebase with Tailwind and shadcn/ui. You get the GitHub repo, deployed to Cloudflare Pages, with no monthly platform tax pointed at your homepage. Hosting cost: $0 on the free tier, ~$5/yr for the domain.

The catch with owning your own code is normally that *you* have to maintain it. Eject ships with an AI chat editor that handles 95% of the edits a marketing site actually needs — text changes, image swaps, new testimonials, section reordering — and runs every change through a preview URL with one-click rollback. Built for founders, marketers, and indie operators who are tired of subscription creep but don't want to live in their codebase.

### 5 bullet feature points

- **One-shot migration**: paste your URL, get a Next.js + Tailwind + shadcn repo back, faithful to the source design.
- **Chat editor**: tell it "swap the hero image and update the testimonial" — it writes the diff, builds a preview, ships on confirm.
- **You own the code**: GitHub repo, MIT-style license to your own work, fork us and walk away anytime.
- **Hosting that doesn't gouge you**: Cloudflare Pages free tier covers the vast majority of marketing sites. Real cost: the domain.
- **Three tiers, honest pricing**: $49 DIY (CLI), $299 done-with-you, $1,499 done-for-you. Editor is $79–$149/mo if you want it.

### Maker comment (pin first)

> Hey PH — I'm Neal, the maker. Quick origin story: my last client signed a Framer contract in September 2025. Framer changed pricing in October. The site went from $30/mo to roughly $1,000/yr in surprise overage. The client asked me, in good faith, "can we just… leave?" The honest answer was "yes, but you'll spend three weeks rebuilding it." That was Eject's prompt.
>
> The hard part was never the migration. There are static scrapers from $0 to $15. The hard part is what happens *after* — non-technical owners need to edit their site, and bare Next.js sends them straight back to Webflow inside a quarter. So the actual product is the editor, and the migration is the wedge that gets you onto our editor with a real codebase you own.
>
> I priced it deliberately under the $1.5K–$50K agency band, deliberately above the $0–$15 scraper band. There was nothing in between. If this resonates, the most useful thing you can do is tell me what edits you wish your site let you make in plain English — that's the editor's roadmap. Replying to every comment today.

### 6 first-comment replies (most-likely PH community questions)

**Q1: "How is this different from v0 or Lovable?"**

> v0 and Lovable are *generation* tools — prompt → new app. They don't ingest your existing live site and produce a faithful copy. Eject's pipeline starts with a real URL crawl, parses the rendered DOM + computed styles, and outputs a component tree that matches what's already shipped. Different problem, different output. (And we use shadcn/ui under the hood, which is the same primitive layer v0 outputs to — so if you migrate with us and later want to keep building with v0, the codebases are compatible.)

**Q2: "What about Webflow CMS items / dynamic content?"**

> CMS-heavy sites are a paid add-on, not the default flow. We migrate up to 50 collection items into a Git-backed markdown collection on the $299 tier, and up to 500 + a Sanity setup on the $1,499 tier. If you have 5,000 blog posts, talk to us — we'll quote it, but it'll be more than $1,499. We're transparent that this isn't a one-click thing for content sites.

**Q3: "What do I do when the AI editor breaks something?"**

> Every edit ships behind a preview URL on a feature branch. You see the change before main updates. One-click rollback if it's wrong. The editor is constrained to a whitelist of safe operations — it cannot touch routing, the Tailwind config, or your `package.json`. We deliberately gave it less power than Cursor or Claude Code so it can't paint itself into a corner. If you want full agentic control, you have the repo — go nuts.

**Q4: "Why Cloudflare Pages and not Vercel?"**

> Vercel's free tier has a soft "no commercial use" clause that gets enforced unevenly. Cloudflare Pages' free tier is genuinely free for commercial sites at the volumes we're targeting (100K requests/day, 500 builds/month). It also has cleaner egress and no surprise function-invocation pricing. We can deploy to Vercel if you ask — it's just one config — but the default is Cloudflare for cost honesty.

**Q5: "Do I need to know Git?"**

> No. The chat editor handles commits, branches, and deploys behind the scenes — you just see "Preview ready, approve?" If you eventually *want* to learn Git and code, the repo is there. We've had three early-access users go from "I don't know what GitHub is" to merging their own PRs in about six weeks. That's a feature, not the goal.

**Q6: "What's stopping Webflow from making export better and killing this?"**

> Two things. (1) They actively don't want to — every "export" feature they've shipped in five years is intentionally crippled (no CMS, no forms, no search, no templates as components). It's a retention moat. (2) Even if they shipped a perfect export tomorrow, you'd still need an editor that works on the exported codebase. Migration is the wedge; the editor is the product. Webflow can't ship that without cannibalizing their own SaaS.

---

## 3. Twitter / X Launch Thread (12 tweets)

### Tweet 1 — Hook (primary)

> A founder I know just got a $1,000/yr surprise bill from Framer because of one pricing change.
>
> Their site is six pages of static marketing copy.
>
> Today I'm shipping Eject — the tool that gets them out, onto a codebase they own, paying $5/yr for a domain.
>
> Thread ↓

### Tweet 1 — Alt hook A (cost angle)

> Webflow on a small business plan: $384/yr.
>
> A custom domain on Cloudflare: $5/yr.
>
> The difference is a hosted editor and a chatbot. We rebuilt both, open-sourced the migrator, and call it Eject.

### Tweet 1 — Alt hook B (ownership angle)

> If your business depends on a website you can't deploy without paying a third party, you don't own a website. You rent one.
>
> Eject ships today. Migrate off Framer/Webflow. Own the Next.js codebase. Edit it with chat. ↓

### Tweet 2 — What it does

> Paste your live URL. Eject crawls it, rebuilds it as a clean Next.js + Tailwind + shadcn/ui project, and hands you the GitHub repo deployed on Cloudflare Pages.
>
> Three tiers: $49 DIY, $299 done-with-you, $1,499 done-for-you. No retainer.

### Tweet 3 — The migration in action (gif/video slot)

> Here's the migration running on a real Webflow site. 4 minutes from URL to live preview on Cloudflare.
>
> [60-second demo gif: paste URL → spinner → side-by-side before/after → green checkmarks]

### Tweet 4 — The actual wedge (editor)

> Here's the part that matters: bare Next.js is useless to a non-technical owner. They go back to Webflow inside a quarter because they need to change a phone number.
>
> So Eject ships with a chat editor that runs on the repo:

### Tweet 5 — Editor demo (gif/video slot)

> Type: "Make the headline shorter and swap the hero image for the new product shot."
>
> Editor: writes the diff, runs a preview build, shows you the result. Ship on confirm.
>
> [60-second editor demo gif]

### Tweet 6 — What's NOT in the editor

> Deliberately constrained. The editor can do:
>
> – Text edits, image swaps
> – Section reordering, testimonial CRUD
> – Component prop tweaks, Tailwind class changes
>
> It cannot touch routing, your Tailwind config, or package.json. By design. So it can't paint your site into a corner.

### Tweet 7 — Pricing breakdown vs Webflow

> Webflow Site Plan (Basic): $14/mo = $168/yr
> Webflow CMS plan: $23/mo = $276/yr
> Webflow Business: $39/mo = $468/yr
>
> Eject DFY: $1,499 once.
> Cloudflare Pages: $0.
> Domain: $5/yr.
> Editor (optional): $79–$149/mo.
>
> Year 1 break-even vs Webflow Business at month 32.

### Tweet 8 — What's hard / honest

> Honesty section:
>
> – Animation-heavy Framer sites need motion re-authored. We tell you upfront.
> – CMS-heavy sites with 500+ items are a separate quote.
> – The editor regresses ~1 in 30 edits on weird Tailwind cases. Every edit ships behind a preview + rollback.
>
> Not magic. Useful.

### Tweet 9 — Who it's for

> If you are:
>
> – A founder paying Webflow $50+/mo for a marketing site
> – A solopreneur whose Framer bill keeps creeping
> – A growth team that wants A/B tests + real Git history
>
> Eject is for you. Stay on Webflow if you sell physical product or run a real CMS — that's still its job.

### Tweet 10 — First customer slot

> First customer testimonial slot — replacing this tweet at launch with a real quote from {{firstCustomerHandle}}, who migrated their {{industry}} site in {{X days}} and is now paying $5/yr instead of {{$Y/mo}}.

### Tweet 11 — The bigger pitch

> Page-builders are the SaaS playbook applied to your homepage. They charge a subscription pointed at content you wrote.
>
> Owning the code costs less, breaks less, and travels with you. The only reason it hasn't won is that nobody made it easy. We did.

### Tweet 12 — CTA + link

> Eject is live now.
>
> $49 DIY · $299 DwY · $1,499 DFY
> Editor $79/mo
>
> See a 4-minute migration of your own site, free, no signup: eject.dev/preview
>
> Or talk to me directly: dms open.
>
> {{handle}}

---

## 4. LinkedIn Post (200–300 words)

> Last quarter, a founder I admire posted that her marketing-site bill had jumped 32x in twelve months. Same site. Same six pages. Just a series of pricing notes from her hosted page-builder, each individually defensible, each one quietly compounding.
>
> She is not a developer. She is exactly the audience these tools were built to serve. And the math had stopped working.
>
> When I asked what she'd actually want, the answer was almost embarrassingly simple: I want to own my site. I want to edit it without learning Git. And I want my hosting bill to not surprise me.
>
> So we built Eject.
>
> Eject takes a live site on Framer, Webflow, or Wix, rebuilds it as a clean Next.js codebase with Tailwind and shadcn/ui, deploys it to Cloudflare Pages, and hands you the keys to the GitHub repo. Hosting on the free tier is genuinely free. The domain costs about $5 a year. That is the entire bill.
>
> The part I'm most proud of is the chat editor. Bare Next.js is the wrong product for someone who isn't a developer — they need to be able to say "swap the hero image and update the testimonial from Sarah" and have it work. So we built that. Constrained, safe, every change behind a preview URL with one-click rollback.
>
> Three tiers — $49, $299, $1,499 — and an optional editor at $79–$149 a month. Built for founders and operators who are tired of paying rent on a homepage they wrote themselves.
>
> If that's you, I'd love to migrate your site this week. Comment "eject" or DM me.

---

## 5. IndieHackers Transparency Post

### Title

**From 0 to ${{mrrAtWeek6}} MRR in {{N}} weeks selling a Webflow exit kit — full numbers, what worked, what didn't**

### Body (~750 words)

I shipped Eject {{N}} weeks ago. It's a productized service that migrates non-technical site owners off Framer/Webflow/Wix onto a self-hosted Next.js codebase, plus an AI chat editor that maintains the codebase. Pricing is $49 DIY, $299 done-with-you, $1,499 done-for-you, with an editor subscription at $79–$149/mo.

Here are the actual numbers, in the order I'd want to see them if I were reading this for my own launch.

**The headline**

- Week 0 (launch day): {{launchSignups}} signups, {{launchRevenue}} in revenue
- Week 1: {{week1MRR}} MRR, {{week1OneTime}} in one-time DFY revenue
- Week 6: **{{mrrAtWeek6}} MRR**, {{totalOneTime}} cumulative one-time revenue, {{paidMigrations}} completed migrations
- Cash position: {{cashOnHand}} after refunds and infra
- Profit: {{week6Profit}} (margins are good — infra is Cloudflare + a few API bills)

**Outbound**

- Cold emails sent: {{coldEmailCount}}
- Reply rate: {{replyRate}}% (qualified replies, not "unsubscribe")
- Demos booked from cold: {{demosFromCold}}
- Closed from cold: {{closedFromCold}} migrations at avg {{avgDealSize}}
- What worked: subject line "Your Webflow bill last quarter" — {{bestSubjectReplyRate}}% reply rate
- What didn't: anything mentioning "AI" in the subject line. Below 1% reply.

**Inbound**

- HN Show post: {{hnPoints}} points, {{hnComments}} comments, {{hnSignupsFromPost}} signups
- Product Hunt: #{{phRank}} of the day, {{phSignupsFromPost}} signups, {{phRevenue}} attributed revenue
- Twitter launch thread: {{twitterImpressions}} impressions, {{twitterSignupsFromThread}} signups
- LinkedIn post: {{linkedInImpressions}} impressions, {{linkedInSignupsFromPost}} signups, {{linkedInDemos}} demos booked from comments
- IndieHackers (this post — fill in after publish): {{ihViews}} views, {{ihSignupsFromPost}} signups

**First customer**

- First paid customer: {{firstCustomerDate}} ({{daysFromLaunchToFirstCustomer}} days from public launch)
- How they found us: {{firstCustomerSource}}
- They were paying: {{firstCustomerOldBill}}/mo on {{firstCustomerOldPlatform}}
- They now pay: $5/yr for the domain + Editor at $79/mo
- Migration time: {{firstCustomerMigrationDays}} days from intake to live
- Their quote: "{{firstCustomerQuote}}"

**Conversion funnel**

- Landing page → email signup: {{lpToEmailRate}}%
- Email signup → demo booked: {{emailToDemoRate}}%
- Demo → DwY/DFY paid: {{demoToPaidRate}}%
- DIY/DwY → Editor subscription attach: {{editorAttachRate}}% — this number is the most important one for the long-term thesis. If it stays above 40% we have a real business; below 25% we're just an agency with a fancy intake form.

**What worked (in order of ROI)**

1. **The HN top-comment with founder objections preempted.** Spent two hours writing it. Drove ~{{hnTopCommentDrivenSignups}} of the {{hnSignupsFromPost}} HN signups by itself.
2. **Free 4-minute migration preview, no signup required.** Removed the friction between "curious" and "I see what this does." Conversion to email after the preview is {{previewToEmailRate}}%.
3. **The "your bill last quarter" cold email subject.** Specific to a real pain. Generic AI/migration subject lines did nothing.
4. **Pricing transparency on the landing page.** No "contact us" tier. Counter-intuitively, the $1,499 tier closes more than the $299 tier — non-technical buyers want it handled.

**What didn't work**

1. **Reddit posts in r/webflow and r/Framer.** Mod-flagged within an hour, even with disclosure. Don't bother — go to the threads where users are already complaining and reply, don't post.
2. **A paid ads test on Google.** {{googleAdsSpend}} spent, {{googleAdsClicks}} clicks, {{googleAdsConversions}} conversions. CAC was {{googleAdsCAC}} against an LTV that doesn't justify it yet. Killed after week {{googleAdsKilledWeek}}.
3. **Twitter ads.** {{twitterAdsResult}}. Same story.
4. **The DIY $49 tier as standalone product.** It exists, but DIYers are the worst converters to the editor — they bought the migration, they don't want help. Pivoting to position $49 mostly as a try-before-DwY upgrade path.
5. **A "free migration" lead magnet.** Drove tire-kickers, not buyers. The free *preview* (no GitHub access, just a link to a non-editable Cloudflare Pages deploy) is way better as a wedge.

**What I'd do differently if launching again**

- Ship the editor first, the migration second. The migration is the wedge but the editor is what people pay for. I underestimated this.
- Start the waitlist 6 weeks before launch, not 2. The HN/PH spike is a one-shot — most signups need to be primed.
- Have 3 case studies pre-recorded before launch day. I had 1.

**What's next**

- Get to {{mrrTarget3Months}} MRR by month 3 — math says we need {{customerCountTarget}} editor subs.
- Build the Wix migration path (currently best on Framer/Webflow — Wix is messier and worth a separate v2).
- Open-source the migration core. The editor stays proprietary.

Happy to answer anything in the comments. Real numbers, no spin.

---

## 6. First-Customer Case Study Template

### Title pattern

**How {{customerName}} migrated their {{industry}} site off {{oldPlatform}} and now pays {{newCost}} instead of {{oldCost}}**

### Sections

#### Who they are

{{customerName}} is the {{role}} of {{companyName}}, a {{stageOrSize}} {{industry}} business based in {{city}}. They've been running their marketing site on {{oldPlatform}} since {{startYear}}, primarily because {{originalReasonForChoosingPlatform}}. The site has {{pageCount}} pages, {{cmsItemCount}} CMS items if any, and gets roughly {{monthlyTraffic}} unique visitors per month.

(Cross-link: [[wiki/people/{{customerSlug}}]], [[wiki/companies/{{companyCompanySlug}}]])

#### What they were paying before

{{customerName}} was on {{oldPlatform}}'s {{oldPlanName}} plan at {{oldCost}}/{{billingPeriod}}, plus {{addOnList}} for an effective annual cost of **{{annualOldCost}}**. The trigger for migration was {{specificTrigger}} — typically a pricing change, a feature breakage, or an inability to make a specific edit without paying for an upgraded tier.

Quote: "{{customerQuoteAboutOldPain}}"

#### What we migrated

Eject {{tierUsed}} ({{tierName}}, {{tierPrice}}). Migration covered:

- {{pageCount}} pages, faithful to the source design at the breakpoints they cared about
- {{cmsItemMigrationDetails}} (e.g. "47 blog posts moved into a Git-backed markdown collection")
- {{formMigrationDetails}} (e.g. "contact form repointed to a Cloudflare Workers handler that emails them")
- {{specialNotes}} (e.g. "we re-authored the hero animation in Framer Motion since the source was running on Framer's proprietary runtime")

Migration timeline: **{{migrationStartDate}} → {{liveDate}}** ({{businessDaysToLive}} business days).

[Before/after screenshot slot — paste a side-by-side here]

#### What they pay now

- Cloudflare Pages: $0/mo (free tier)
- Domain renewal: ~$5/yr
- Eject Editor subscription: {{editorTierPrice}}/mo (optional; {{editorAttached}})
- One-time migration: {{tierPrice}}

**New annual cost: {{annualNewCost}}**
**Annual savings vs old: {{annualSavings}} ({{percentSavings}}%)**
**Break-even on the migration vs continuing to pay {{oldPlatform}}: month {{breakEvenMonth}}**

#### The quote

> "{{customerQuoteAboutEject}}"
>
> — {{customerName}}, {{role}} at {{companyName}}

#### What surprised them

Pull one specific thing the customer didn't expect — usually one of:

- "I didn't realize how fast the site got. We went from {{oldLighthouseScore}} to {{newLighthouseScore}} on Lighthouse."
- "The chat editor is the thing my team actually uses. I haven't opened the GitHub repo in three weeks."
- "I expected to lose the {{specificFeature}} but you rebuilt it in a way that's actually cleaner."

#### What's next for them

{{customerName}} is now {{whatTheyreDoingNext}} — typically launching new pages, A/B testing copy through the editor, or absorbing additional sites onto Eject's stack.

#### About Eject

One-line product description, link to pricing, link to demo. (Standard footer, reused across every case study.)

---

## 7. Three Alternate Brand Taglines

Beyond *"Eject from Webflow. Own your site. Pay $5 a year."* — try these in different audience tests:

1. **(Cost angle)** "The website you wrote, billed like a domain — not like a SaaS."
2. **(Speed angle)** "From hosted page-builder to your own Next.js codebase in an afternoon."
3. **(Craft angle)** "A real codebase for people who don't want to live in one."

A fourth, more contrarian, for the Twitter/HN crowd:
4. **(Ownership angle)** "You don't own a website. You rent one. Let's fix that."

---

## 8. Press List — Outlets / Newsletters Where This Story Belongs

| # | Outlet | Why it fits | 1-sentence pitch hook |
|---|---|---|---|
| 1 | **TLDR Newsletter** (Dan Ni) | Massive engineer audience; loves "X startup is killing Y SaaS" angles. | "The first productized service that migrates Framer/Webflow sites to a self-hosted Next.js codebase — and ships an AI chat editor so non-coders can actually maintain it." |
| 2 | **The Pragmatic Engineer** (Gergely Orosz) | Covers tooling-economics shifts; the page-builder-to-code pipeline is exactly his lane. | "Page-builders are the SaaS playbook applied to homepages — here's a teardown of what it costs (and what it costs to leave)." |
| 3 | **Indie Hackers Feature** (Channing Allen) | Transparency + numbers + indie founder = their bullseye. | "0 to ${{X}} MRR in {{N}} weeks selling a tool that gets people off Webflow forever — full numbers and what didn't work." |
| 4 | **Hacker News** (organic Show HN, no submission help) | The HN audience has been complaining about Webflow/Framer pricing in threads for two years; the post writes itself. | (See section 1 above — Show HN post is the pitch.) |
| 5 | **Bytes Newsletter** (Tyler McGinnis / ui.dev) | React/Next.js audience; the migration pipeline + editor is interesting tech. | "How we built a chat editor that ships safe diffs to a real Next.js repo without ever letting an LLM touch the routing config." |
| 6 | **Console.dev** (newsletter for devs reviewing developer tools) | Curated dev-tool reviews; loves OSS-with-a-paid-layer stories. | "We open-sourced the migration core and kept the editor proprietary — here's why that works as a business model." |
| 7 | **Theo Browne (t3.gg)** YouTube + newsletter | Loud Next.js opinions, exactly the right audience, will roast or champion us — both are fine. | "We rebuilt 40+ Webflow sites as Next.js + shadcn/ui and we have opinions about why it's a better default for marketing sites." |
| 8 | **Fireship** YouTube ("This Week in JavaScript") | The 100-second video format will pick up the "$5/yr vs $300/mo" angle in a heartbeat. | "There's a service that takes your Webflow site, rebuilds it as Next.js, deploys it to Cloudflare for free, and lets you edit it with a chatbot — in 100 seconds." |
| 9 | **Smashing Magazine** | Web-design + craft audience; the visual-fidelity migration is a real engineering writeup. | "Building a faithful URL → Next.js + Tailwind migrator: the parsing pipeline, the design-token extraction, and the trade-offs we made." |
| 10 | **Lenny's Newsletter** | PM/founder audience; the pricing/ownership thesis is a Lenny's-style essay. | "Why every SaaS playbook is converging on subscription-on-content-you-wrote — and what it would take to reverse it." |
| 11 | **r/webdev + r/SideProject (organic)** | High-signal communities; SideProject is supportive, webdev is where exit-from-Webflow conversations already happen. | (Just a "Show /r/sideproject" post in their preferred format — no PR pitch needed.) |
| 12 | **The Newsletter Operator** (Matt McGarry) and **Marketing Examined** (Alex Garcia) | Marketing-ops audience; their readers run sites on Webflow and feel the bill. | "A migration kit + AI editor for marketers who want to own their site stack but won't open a PR — pricing math vs Webflow inside." |

**Outreach sequencing:** HN + Product Hunt on launch day (don't tell journalists in advance — it's a Show HN, not a PR launch). Send TLDR / Pragmatic Engineer / Bytes / Console / Lenny's the next day with the HN traction as the proof. Theo and Fireship via DM with a 60-second demo gif, no formal pitch.

---

## Appendix — Reusable Snippets

### Elevator pitch (30 sec)

> Eject is a migration service that moves your Framer, Webflow, or Wix site onto a self-hosted Next.js codebase you own. We deploy it to Cloudflare Pages where hosting is free, hand you the GitHub repo, and ship a chat editor so you can actually maintain it without learning Git. $1,499 once, optional $79/mo for the editor, $5/yr for the domain. That's the whole bill.

### Bumper sticker (5 sec)

> Migrate off Webflow. Own your site. Pay $5 a year.

### Investor / partner one-liner (15 sec)

> The wedge is migration off page-builders. The product is the AI chat editor that keeps non-technical owners from going back. Pricing band ($299–$1,499 productized) is empty in market — agencies start at $1.5K, scrapers stop at $15.

---

*End of launch asset pack. Cross-references: [[website-migration-service]], [[website-migration-service-research-2026-05-01]].*
