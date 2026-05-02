# Community engagement playbook (Reddit / Forums / YouTube)

Lead with help, never with pitch. The first 80% of every reply is a substantive technical answer that would be useful even if Eject didn't exist. Product mention is one sentence at the bottom.

**Hard rules:**
- No homepage links in comment bodies.
- DM is the path; never CTA in-thread.
- No emojis.
- Spread comments over 7-10 days. Posting all 7 in 24h triggers shadowban heuristics.
- Build account history with non-promotional helpful comments between targeted ones.

---

## Reddit + Forum reply drafts

### 1. r/Framer — "Framer just killed my agency margins. Alternatives?"
URL: https://reddit.com/r/Framer/comments/1s7p43u

The painful part of this isn't the migration — it's that you've already absorbed the cost increase and now your only options are renegotiate, eat it, or move. Here's how I'd break it down for a 3-person shop.

First, separate the sites by traffic and CMS dependency. Marketing pages with under 50k pageviews/mo and a handful of CMS items can move in a weekend. The ones that bite are the heavy CMS sites and anything using Framer's form handling, A/B testing, or localization. List those out before you commit to anything.

For the migration target, the cheapest sustainable stack right now is Next.js or Astro on Cloudflare Pages. Cloudflare's free tier covers 100k requests/day, unlimited bandwidth, and unmetered builds. Pages + a Cloudflare R2 bucket for media + a tiny KV namespace for forms = roughly $0–5/year per site at your client volume. Compare that to Scale plan at $40+/site/month and the math gets ugly fast for Framer.

Two practical things that saved me time when I did this:

1. Don't try to preserve Framer's animations 1:1. You'll burn 80% of your time on the last 5% of motion polish. Framer Motion (the open-source library) ports cleanly to Next.js and gives you the same primitives. Rebuild intentionally, not pixel-perfect.

2. Use a headless CMS your clients already trust the UI of. Sanity Studio or Payload CMS — both have generous free tiers. Don't force clients into a tool they hate or you'll be doing edits forever.

For the client conversation: frame it as "we're moving you to a stack you own outright — same site, no vendor risk, hosting goes from $40/mo to $5/year." Most clients cheer.

FWIW I'm building a productized service exactly for this — agencies offloading the migration work so they can focus on design. Happy to do a free audit on one of your sites and show you the actual cost/time for that specific case. DM if useful.

---

### 2. r/Framer — "Searching for Framer Alternatives after recent Price Changes"
URL: https://reddit.com/r/Framer/comments/1odbsyj

15 sites is a lot but it's tractable if you stage it. The mistake people make is trying to migrate everything in parallel — you'll burn out and ship nothing. Triage first.

Sort your 15 sites into three buckets:

- **Tier 1 (5-ish sites):** clients who'd actually pay you to migrate, where the rebuild is funded. Start here.
- **Tier 2:** clients on the fence — show them the math (Framer Scale vs $5/year hosting) and let them decide. Most will say yes if you handle the work.
- **Tier 3:** clients you'd rather sunset anyway. Use this as the cleanup excuse.

For the actual stack, Next.js on Cloudflare Pages is the cheapest viable target for marketing/agency sites. Free tier handles 100k requests/day. Static pages render instantly. Forms route through Cloudflare Workers (free up to 100k req/day). Total hosting: roughly $0–5/year.

Time estimate from doing this — a basic 8-page Framer site with a CMS section is about 4-6 hours including content migration. Animation-heavy sites with custom motion components creep up to 10-12. Sites with Framer's localization or A/B testing are 15+ because you're rebuilding those layers.

A few specific gotchas:

- Framer's CMS export gives you JSON but not images — you have to scrape those separately. I wrote a small script that pulls all asset URLs from a Framer site and downloads them in one pass, happy to share.
- If clients use Framer's built-in forms, you'll need to replace with Resend + a Cloudflare Worker. About 30 minutes per form.
- SEO: Framer's auto-generated sitemap is fine but their meta tag handling is inconsistent. Audit every page's OG tags during migration.

On the client conversation — don't lead with "Framer raised prices." Lead with "I can move you to a stack you own, hosting drops to ~$5/year, and you keep me as your retainer." That reframes the whole thing.

I'm working on a productized service for exactly this scenario — happy to take one of your 15 sites and do a free audit (full migration estimate, time, cost, gotchas). DM if useful.

---

### 3. r/Framer — "Framer is amazing… but the vendor lock-in is killing me"
URL: https://reddit.com/r/Framer/comments/1onelhb

The lock-in is the actual product, unfortunately — Framer's revenue model depends on you not being able to leave. They could ship code export tomorrow technically (it's a React canvas under the hood), but they won't, because every exported site is a churned customer.

A few thoughts on living with this:

**If you want to keep Framer in the stack but reduce risk:**
- Treat Framer as the *design tool*, not the platform. Use it to prototype and design, then rebuild final production sites in Next.js. You keep Framer's design speed and own the deliverable.
- Or: keep Framer for marketing pages, but anything CMS-heavy or app-like lives in your own codebase. Subdomain split (www on Framer, app/blog on your own infra). When prices spike again, you only have to migrate the marketing layer.

**If you want full ownership:**
- Next.js + Framer Motion (the open-source library) gets you 90% of Framer's animation capabilities. The remaining 10% is the visual editor itself.
- Cloudflare Pages or Vercel for hosting. Cloudflare's free tier is wild — 100k requests/day, unlimited bandwidth.
- A headless CMS (Sanity, Payload) replaces Framer's CMS. Clients get a clean editor UI.

**The one Framer alternative that ships code export:** Plasmic. It's not 1:1 with Framer's design tools but the export-to-code workflow is real. Worth a look if you want a "Framer but you own the output" middle ground.

The honest answer though: Framer is great until your business depends on it, and then the lock-in starts to dictate your strategy. The one-time pain of moving is usually less than the ongoing pain of being held hostage to pricing changes.

I do migrations off Framer to self-hosted Next.js as a productized thing — happy to do a free audit on one of your sites and show you what it would actually take. DM if useful.

---

### 4. r/Framer — "Looking for a cheaper framer alternative"
URL: https://reddit.com/r/Framer/comments/1np681j

Cheapest sustainable option right now is Next.js (or Astro if you don't need React) deployed on Cloudflare Pages. Free tier covers 100k requests/day, unlimited bandwidth, and unlimited builds. Hosting cost for a typical marketing site: $0–5/year, where the $5 is just the domain.

Quick comparison of what people usually pick:

- **Astro** — best for content/marketing sites. Static-first, ships almost no JS by default. Easy learning curve.
- **Next.js** — better if you want React components, dynamic routes, or plan to grow into app territory. Slightly heavier.
- **Plasmic** — visual builder that exports clean code. Closest to Framer's authoring experience but with code ownership.
- **WordPress + a decent host** — boring but works. ~$5/mo on Cloudways or similar.

Things to think about before picking:

- Do you need a CMS for non-technical clients? If yes, look at Sanity or Payload (both free for small sites).
- Do you need form handling? Cloudflare Workers + Resend handles transactional email cheaply. Or use Formspree.
- How animation-heavy is the site? Framer Motion (the OSS library) ports almost everything from Framer's canvas to code.

The migration itself for a typical 5-10 page site is a 1-2 day job if you're comfortable in code, longer if you're not. The hard part is usually content/asset migration, not the build.

I do this as a service if you'd rather not DIY — happy to do a free audit and tell you what your specific site would cost/take. DM if useful.

---

### 5. r/webflow — "Considering moving away from Webflow, any recommendations?"
URL: https://reddit.com/r/webflow/comments/1sor652

The Claude/Codex angle is the real shift here — what used to take a frontend dev a week is now a one-evening job for someone willing to read code. That changes the calculus on Webflow specifically because you're paying ~$29/mo for a CMS + hosting that's now genuinely undercut by free tiers + AI assistance.

Practical stack I'd recommend for someone at your stage:

**Frontend:** Next.js (or Astro if mostly content). Both have excellent Claude/Cursor support — you can describe a section in plain English and get usable code. Tailwind makes the styling fast.

**CMS:** Sanity Studio or Payload CMS. Both free for small projects, both have clean editor UIs that non-technical clients can use. Sanity is faster to set up; Payload is more flexible.

**Hosting:** Cloudflare Pages free tier. 100k requests/day, unlimited bandwidth, free SSL, free CDN. For a typical Webflow-replacement site, you're paying $0/mo for hosting plus ~$12/year for the domain. That's it.

**Forms:** Cloudflare Worker + Resend. About 30 min to set up, $0/mo for low volume.

**The actual migration workflow:**
1. Export Webflow's CSS variables and structure for visual reference.
2. Have Claude/Cursor scaffold the Next.js project with your color/type system.
3. Rebuild section by section, pasting Webflow screenshots and asking for component matches.
4. Migrate CMS content via Webflow's CSV export → write a small script to push to Sanity/Payload.
5. Set up redirects from old URLs (don't skip this, you'll tank SEO).

Realistic time: 1-3 days for a standard 10-page marketing site if you're comfortable iterating with AI. Longer if you're learning.

The trap to avoid: trying to make the new site identical to the Webflow version pixel-by-pixel. Use the migration as an excuse to clean up the design.

FWIW I do this migration as a productized service for people who'd rather not DIY — happy to do a free audit on your site and tell you the realistic cost/time. DM if useful.

---

### 6. Webflow Forum — "The High Cost of WebFlow"
URL: https://discourse.webflow.com/t/the-high-cost-of-webflow-is-it-time-to-find-a-more-affordable-alternative/232093

The "WordPress is free" comparison from clients is fair on the surface but misleading on TCO — managed WordPress hosting that doesn't get hacked is $20-40/mo, plus plugins, plus a developer to maintain it. So the real comparison isn't Webflow vs free WordPress, it's Webflow vs the actual cost stack a client would otherwise pay.

That said, there's a real shift happening that justifies the client question. The cost floor for a hostable, secure, CMS-backed marketing site has dropped to nearly zero in the last 18 months. Specifically:

- Cloudflare Pages free tier: 100k requests/day, unlimited bandwidth, free SSL, global CDN. $0/mo.
- Headless CMS free tiers: Sanity (3 users free), Payload (self-hosted free), Contentful (small projects free).
- Static/JAMstack frameworks: Next.js, Astro, Eleventy — all free, all production-grade.
- AI-assisted development: Claude, Cursor, GitHub Copilot — what used to require a frontend developer can now be done by a thoughtful generalist in a fraction of the time.

The honest answer to give clients: Webflow is paying for *convenience and managed infrastructure*. You're not paying for a website to exist — you're paying so that you (or your team) can edit it without a developer, and so someone else handles uptime, security, and CDN. That's worth $29/mo for some clients and not for others.

Where Webflow is genuinely worth it:
- Clients who need to edit copy weekly and won't tolerate a Git-based workflow.
- Sites that lean heavily on Webflow's visual CMS for non-technical authors.
- Agencies who've standardized their delivery workflow on Webflow.

Where it's hard to justify in 2026:
- Brochure sites with 5-10 static pages and infrequent edits.
- Anything where the client is technical enough to use Sanity Studio or Payload.
- Projects where the client owns the site outright and doesn't need ongoing edits.

For the second category, self-hosted Next.js + Cloudflare Pages + a headless CMS is genuinely $0–5/year all-in. The only paid line is the domain.

I'm building a productized service for migrating exactly these kinds of sites off Webflow — happy to do a free audit on a client site if any of you want to see the actual numbers for a real case. DM if useful.

---

### 7. Webflow Forum — "Will Webflow's 2025 Pricing Changes Push Freelancers Out?"
URL: https://discourse.webflow.com/t/will-webflow-s-2025-pricing-changes-push-freelancers-out/299002

Reading through Graham's and Hans's points — the real squeeze for freelancers isn't the absolute price, it's that the per-site cost now eats into your retainer margin in a way it didn't 18 months ago. If you're charging a $50/mo retainer and Webflow is taking $29 of it, you're not running a business, you're running a Webflow reseller.

A few things that have changed the freelancer calculus this year:

**1. The skill floor for "self-hosted" dropped significantly.** With Claude/Cursor, a designer-leaning freelancer can scaffold a Next.js site from a Webflow design in 1-2 days. That wasn't true in 2023. The "I'd have to hire a dev" objection is mostly gone.

**2. Cloudflare Pages changed the hosting math.** Free tier is now 100k requests/day, unlimited bandwidth, free SSL, free CDN. For a typical small-business marketing site, hosting is genuinely $0/mo. The only line item is the domain.

**3. Headless CMS UIs caught up.** Sanity Studio and Payload CMS are now genuinely usable by non-technical clients.

**The freelancer playbook that seems to be working:**

- Keep Webflow for clients who absolutely need its editor experience and are willing to pay for it.
- Move bread-and-butter retainer clients to self-hosted Next.js + Cloudflare + Sanity. Hosting costs collapse, your margin recovers, you own the stack.
- Charge a flat migration fee ($800–2k depending on size) and pitch it as "you'll save $300-400/year on Webflow plus you own the site outright." Most clients say yes.

**Where this falls apart:** clients who edit content weekly and will hate a slightly less polished CMS. Don't migrate them — Webflow is genuinely worth the price for that use case.

The bigger picture: I think Webflow's pricing is a forcing function for freelancers to become real engineers (or partner with one). The freelancers who add a code/AI layer to their service will come out of this with healthier margins. The ones who stay pure Webflow operators will keep getting squeezed.

FWIW I'm building a productized migration service for this exact scenario — happy to do a free audit on a client site if any of you want to see the math on a real case. DM if useful.

---

## YouTube comment drafts

### A. Under "Designers Are Leaving Webflow… Here's Why" (234K views)

The hosting math is the part that doesn't get covered enough — Cloudflare Pages free tier handles 100k requests/day with unlimited bandwidth, so for a typical marketing site you're paying ~$5/year for the domain and that's the entire infrastructure cost. The reason Webflow made sense at $29/mo wasn't really hosting, it was the editor experience for non-technical clients. With Sanity Studio or Payload CMS now genuinely usable by non-devs, and Claude/Cursor making the rebuild a 1-2 day job for a designer-leaning freelancer, that calculus has flipped pretty hard in the last year. The hardest part of the migration honestly isn't the build — it's the asset/content migration and getting redirects right so you don't tank SEO. Feel free to DM me if you want a free audit on a specific site, I do this as a service and happy to walk through the numbers for your case.

### B. Under "Framer Just Got WAY Too Expensive" (18K views)

For anyone watching this and panicking — the rebuild is less scary than it sounds. Framer Motion (the open-source animation library) ports almost everything from Framer's canvas into a Next.js codebase, so you don't lose the motion polish. Cloudflare Pages free tier covers hosting at $0/mo, domain is ~$12/year, and that's basically it for a typical marketing site. A standard 8-page Framer site with a CMS section is about a 1-2 day rebuild if you're comfortable in code, longer if you're learning. The trap to avoid is trying to make the new site pixel-perfect identical — use the migration as a chance to clean up the design instead. Happy to DM and do a free audit on a site if anyone wants to see the actual cost/time math for their specific case.

### C. Under "FRAMER IS DEAD — (framer pricing update goes wrong)" (11K views)

The lock-in is genuinely the painful part — Framer doesn't ship code export and probably never will, because every exported site is a lost subscription. The good news is the rebuild target stack got really good in the last 18 months: Next.js + Framer Motion (open source) + Cloudflare Pages free tier comes out to roughly $5/year all-in for a typical marketing site, vs $40+/mo on Framer Scale. AI tooling (Claude, Cursor) makes the rebuild a 1-2 day job for someone designer-leaning who can read code. The thing nobody tells you: Framer's CMS export gives you JSON but not the images, you have to scrape those separately. Happy to DM and do a free audit on a site if you want the realistic numbers for your specific case.

---

## Twitter/X build-in-public posts

### A. Day-1 announcement
```
Building Eject: a productized service that migrates non-technical site owners off Framer/Webflow/Wix onto self-hosted Next.js on Cloudflare Pages.

Pitch: "Eject from Webflow. Own your site. Pay $5/year."

Three tiers: $49 DIY guide, $299 done-with-you, $1499 done-for-you.

Day 1.
```

### B. First-customer-shipped
```
Shipped Eject's first migration today.

Webflow site → Next.js on Cloudflare Pages.

Before: $29/mo + $0 owned.
After: $5/year + 100% owned codebase.

Took 11 hours including content migration and redirects. Client gets the same editor UX via Sanity.

This is going to be a thing.
```

### C. Cost calculator launch
```
Just shipped the Eject calculator: paste your Webflow/Framer URL, see what self-hosting it on Cloudflare Pages would actually cost.

Most sites: $5/year vs $348-960/year on the platform.

The math is the pitch.
```

---

## Upvote-earning playbook

1. **Be early — first 90 minutes is everything.** Set up alerts for "framer alternative", "webflow pricing", "leaving webflow." Aim to be in the first 5 replies.
2. **Lead with concrete numbers, never adjectives.** "Cloudflare Pages free tier: 100k requests/day, unlimited bandwidth" outperforms "Cloudflare is really cheap."
3. **Respond to other commenters, not just the OP.** Sub-reply to the most-upvoted existing comment with genuine context — Reddit's algorithm rewards thread depth.
4. **Name the trap, not just the solution.** Specific failure modes signal real experience. Generic stack recommendations signal a bot.
5. **The pitch is one sentence at the bottom, with no link.** Spend 350 words being genuinely helpful, end with "FWIW I do this as a service, happy to DM and do a free audit." DM path filters for high-intent leads anyway.
