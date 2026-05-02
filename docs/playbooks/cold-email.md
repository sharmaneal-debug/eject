# Cold Email Playbook

**Pitch:** Eject from Webflow. Own your site. Pay $5 a year.
**SKUs:** DIY Guided $49 / Done-with-You $299 / Done-for-You $1,499 / Editor $79–149/mo
**Stack we ship:** Next.js + Cloudflare Pages (free tier) + optional AI editor
**ICP:** solo agency owners + indie founders paying $19–$80/mo on Framer/Webflow/Wix

---

## 1. Framer outbound sequence (3 emails)

Framer hit founders with a pricing change in Oct 2025. The pain is fresh. Lead with the math.

### Email F1 — Day 0

**Subject:** `{{site_url}} is now $440/month?`

Hey {{first_name}},

Saw {{site_url}} is on Framer. Their Oct pricing change means a one-pager with a custom domain now runs ~$440/mo on the agency tier. That's $5,280 a year for HTML.

Ran your site through Lighthouse: **{{lighthouse_score}}/100 performance**. CMS items: **{{cms_item_count}}**.

Same site, rebuilt as a Next.js codebase you own, deployed on Cloudflare Pages: **$5/year**. Domain only. Hosting is free.

We do this as a productized service. $1,499 done-for-you, 7-day turnaround. You keep your design. You stop renting.

Want me to record a 5-min Loom showing exactly what we'd ship for {{site_url}}?

— {{sender_first_name}}, Eject

---

### Email F2 — Day 4

**Subject:** `the {{annual_cost_estimate}} math on {{site_url}}`

{{first_name}} — quick follow-up.

You're paying Framer **${{monthly_cost}}/mo** for {{site_url}}. That's **${{annual_cost_estimate}}/year**.

Over 5 years: **${{five_year_cost}}**.

What you're actually getting: a CDN, a form handler, and a CMS with {{cms_item_count}} entries.

Cloudflare Pages gives you the CDN free. Resend gives you forms free up to 3k/mo. The CMS is markdown files in your repo — git-tracked, AI-editable.

We migrate you for $1,499 once. You break even in {{breakeven_months}} months.

5-min Loom? I'll show you the rebuilt site before you decide.

— {{sender_first_name}}

---

### Email F3 — Day 10

**Subject:** `last note on {{site_url}}`

{{first_name}},

Not going to spam you. Last email.

If you'd rather not pay Framer **${{annual_cost_estimate}}/year** to host a site they could deplatform tomorrow — reply "loom" and I'll send the audit.

If Framer's working for you, ignore this. No hard feelings.

— {{sender_first_name}}, Eject
eject.dev

---

## 2. Webflow outbound sequence (3 emails)

Webflow's pain is pricing confusion, not export. Hammer the per-seat / per-site / Workspace tax stack.

### Email W1 — Day 0

**Subject:** `{{site_url}} → {{annual_cost_estimate}}/yr in Webflow fees`

Hey {{first_name}},

{{site_url}} is on Webflow's **{{webflow_plan}}** plan. With Workspace + CMS + per-seat, you're at **${{annual_cost_estimate}}/year**.

Reddit summed it up better than I can: *"I'm not paying $30 extra just for robots.txt and redirects."*

I ran your site:
- Lighthouse: **{{lighthouse_score}}/100**
- CMS collections: **{{cms_collection_count}}**
- Total CMS items: **{{cms_item_count}}**

Migrating to a Next.js codebase on Cloudflare Pages costs you **$5/year** (just the domain). Same design, faster, yours forever.

We do this as a fixed-price service: $1,499 done-for-you, 7 days. CMS migrates 1:1 to MDX or Sanity (your call).

Want a 5-min Loom showing the rebuild for {{site_url}}?

— {{sender_first_name}}, Eject

---

### Email W2 — Day 4

**Subject:** `the Workspace tax on {{site_url}}`

{{first_name}} — quick math follow-up.

Your Webflow stack on {{site_url}}:
- Site plan: **${{site_plan_cost}}/mo**
- Workspace seat(s): **${{workspace_cost}}/mo**
- CMS items hit: **{{cms_usage_pct}}%** of plan limit (next tier: +${{next_tier_delta}}/mo)

Total: **${{annual_cost_estimate}}/yr** and rising every time you add a blog post.

After ejecting, your costs:
- Domain: $12/yr
- Hosting (Cloudflare Pages): $0
- Forms (Resend free tier): $0
- CMS (markdown in repo): $0

**Break-even on the $1,499 migration: {{breakeven_months}} months.**

If editing is the worry — we ship an optional AI editor ($79/mo) that lets you update the site in plain English. Cancel anytime, site keeps working.

Loom audit?

— {{sender_first_name}}

---

### Email W3 — Day 10

**Subject:** `closing the loop on {{site_url}}`

{{first_name}},

Last one.

You're paying **${{annual_cost_estimate}}/yr** to rent a site you designed yourself. That's the whole pitch. We can fix it for $1,499 once.

Reply "loom" for the audit. Ignore if you're good.

— {{sender_first_name}}
eject.dev

---

## 3. Wix outbound sequence (3 emails)

Wix is the most locked-in. There's no export. Angle: you don't even know what you're paying for.

### Email X1 — Day 0

**Subject:** `{{site_url}}: zero export, zero leverage`

Hey {{first_name}},

{{site_url}} is on Wix. Quick reality check most Wix users don't know:

**You can't export your site.** No HTML, no CSS, no content dump. If Wix raises prices or shuts your account, you rebuild from scratch.

Your current spend: **${{annual_cost_estimate}}/yr** on Wix Premium + extras. Performance score: **{{lighthouse_score}}/100** (Wix sites average 38).

We rebuild {{site_url}} as a Next.js codebase you own. Hosted on Cloudflare Pages free tier. Total cost after migration: **$5/year**.

$1,499 done-for-you. 10-day turnaround (Wix takes longer because we have to manually re-extract your content — no API).

Want a 5-min Loom? I'll show you what the rebuilt site looks like + your real Lighthouse score.

— {{sender_first_name}}, Eject

---

### Email X2 — Day 4

**Subject:** `what happens to {{site_url}} if Wix dies?`

{{first_name}},

Hypothetical: Wix doubles prices next month. What's your move?

- Export your site? **Not possible.**
- Migrate the design? **No code access.**
- Keep your SEO? **Only if you stay.**

That's the trap. You're paying **${{annual_cost_estimate}}/yr** for a site you can never leave without losing.

We've migrated **{{wix_migrations_count}}** Wix sites this quarter. Process:
1. We manually rebuild the design in Next.js (pixel-matched)
2. Scrape + restructure your content into MDX
3. Set up 301 redirects so SEO survives
4. Hand you the GitHub repo

You go from locked-in to fully owned. **$1,499 once, $5/yr after.**

Loom audit?

— {{sender_first_name}}

---

### Email X3 — Day 10

**Subject:** `{{site_url}} — final note`

{{first_name}},

Won't keep emailing.

If "I can never leave Wix without losing my site" sounds bad to you, reply "loom" and I'll record the audit.

If it doesn't bother you, all good — delete this.

— {{sender_first_name}}
eject.dev

---

## 4. Loom Audit Follow-Up

**Subject:** `re: {{site_url}} — Loom incoming (24h)`

{{first_name}},

Thanks for replying. Here's exactly what I'll send within 24 hours:

A **5-minute Loom** walking through:

1. **Your real Lighthouse score** for {{site_url}} (performance, SEO, accessibility) — screenshotted from web.dev
2. **Your real annual cost** on {{platform}} — itemized: plan + seats + addons + CMS overages = **${{annual_cost_estimate}}/yr**
3. **A side-by-side preview** — your current site next to a rough Next.js rebuild on a Cloudflare Pages preview URL
4. **The exact migration plan** — what we'd build, how the CMS maps over, how SEO is preserved (301 redirects + canonical URLs)
5. **The math** — break-even is **{{breakeven_months}} months**, 5-year savings is **${{five_year_savings}}**

No pitch deck, no sales call. Just the audit.

After you watch it, three options:
- **DIY Guided ($49)** — we send you the codebase template + a checklist, you migrate yourself
- **Done-with-You ($299)** — we pair on a 90-min call and ship together
- **Done-for-You ($1,499)** — we handle the whole thing, 7-day turnaround

Or none of the above. Watching the Loom doesn't commit you to anything.

Loom drops in your inbox tomorrow. Anything specific you want me to cover?

— {{sender_first_name}}
eject.dev

---

## 5. Reply objection handlers

### "I'm not technical / I don't want to manage code"

You don't have to. The Done-for-You SKU ($1,499) means we ship the whole thing — you never open a terminal. For ongoing edits, the Editor add-on ($79/mo) lets you update the site by typing "change the headline to X" in a chatbox. If you cancel the Editor, the site keeps running on Cloudflare for free. Worst case you're back where you started, minus the Webflow bill.

### "I love Webflow's editor — I'd lose that"

Fair. The Webflow visual editor is genuinely good. The trade is: you keep paying ${{annual_cost_estimate}}/yr forever, OR you pay $1,499 once + optional $79/mo for our AI editor that handles 90% of the same edits via plain English. Most customers find the AI editor faster for content changes; we're honest that for major redesigns you'd hire a designer either way. Want a Loom comparing both editing flows?

### "Won't this break my SEO?"

Opposite — it usually improves. We set up 301 redirects from every existing URL to its new equivalent (Google explicitly supports this), keep canonical tags identical, and migrate meta tags 1:1. Next.js sites typically score 30-50 points higher on Lighthouse than Webflow/Framer/Wix, which directly helps Core Web Vitals rankings. We've never had a customer lose traffic post-migration; most see a lift within 60 days.

### "How long does it take?"

Done-for-You is **7 days** for Framer/Webflow (we have CMS API access), **10 days** for Wix (manual content extraction). DIY Guided is as fast as you want — most people finish in a weekend. Done-with-You is one 90-minute pairing call plus 2-3 days of handoff. We don't take on a project unless we can hit the SLA.

### "What if I want to change it later?"

You own the GitHub repo outright. Hire any Next.js dev, run it through Cursor, use our AI editor, or fork it yourself — there's no lock-in because there's no us in the loop after handoff. This is the entire point. Cloudflare Pages is the hosting, and that's free + portable too. If Cloudflare ever raised prices, you'd move to Vercel or Netlify in 10 minutes.

### "Why not just use v0 / Lovable / Cursor?"

You can. v0 generates components, Lovable/Bolt scaffold apps, Cursor edits code. None of them migrate your existing site, preserve your CMS, set up redirects, or hand you a deployed Cloudflare Pages site with a working domain. We're the migration layer, not the codegen layer — we use Cursor + AI tooling internally to ship faster. If you're already a dev who knows what you're doing, buy the $49 DIY Guided SKU and skip us.

### "What's the catch?"

Two real ones. **One:** if you make major design changes monthly, the AI editor at $79/mo costs less than Webflow but isn't free — and a designer is still cheaper for full redesigns. **Two:** Cloudflare Pages free tier has limits (500 builds/mo, 100k requests/day on workers). 99% of solo-founder sites never hit them, but if you're doing 1M+ pageviews/month we'd put you on the $5/mo Pages tier instead. That's it. No upsell trap, no "starter" plan that breaks at scale.

---

## 6. List-building spec

Output: a CSV at `data/prospects/{{date}}.csv` with columns:
`site_url, platform, owner_email, owner_name, monthly_cost_estimate, annual_cost_estimate, lighthouse_score, cms_item_count, last_updated, signal_strength`.

### Source 1: PublicWWW — Framer

```
"framer.website" -site:framer.com
"https://framerusercontent.com"
'<meta name="generator" content="Framer"'
"framer.app/static"
```

### Source 2: PublicWWW — Webflow

```
'<meta content="Webflow" name="generator"'
"webflow.io" -site:webflow.com
"wf-form-"
"data-wf-page"
"wf-collection-list"   # signals CMS usage
```

`wf-collection-list` is the highest-value subset — these are sites paying for CMS, $23+/mo minimum.

### Source 3: PublicWWW — Wix

```
"static.parastorage.com"
'<meta name="generator" content="Wix.com Website Builder"'
"_wixCIDX"
```

### Source 4: BuiltWith

- Filter: technology = Framer / Webflow / Wix
- Filter: traffic rank between 100k–10M
- Filter: contact email present

### Enrichment per row

1. Verify platform via `<meta generator>` + asset CDN check
2. Lighthouse score via PageSpeed Insights API
3. CMS item count via DOM inspection (Webflow: `wf-collection-list-wrapper`, Framer: `[data-framer-name]`)
4. Plan estimate (heuristic): custom domain + features detected
5. Owner email via Apollo → Hunter → contact-page scrape fallback
6. Signal strength score (0–10): low Lighthouse + high cost + recent updates + ICP fit

Drop rows where `signal_strength < 5` or `monthly_cost_estimate < $19`.

Run weekly. Cap 50 sends/day per sender domain. Warm domains 14 days before scaling.

---

## 7. Pre-send personalization checklist

Block sending unless all 5 pass:

1. **Site URL is in the subject line.** Non-negotiable.
2. **Lighthouse score < 90.** If site already scores high, skip.
3. **Annual cost ≥ $200.** Below that, math doesn't work; downsell to DIY $49.
4. **Owner first name verified.** No fallbacks like "there" / "friend."
5. **Loom screenshot attached** for high-signal prospects (signal ≥ 8). Pre-record before sending; 3–4× reply rate.

---

## 8. KPI dashboard

| Metric | Target | Kill threshold |
|---|---|---|
| Open rate | ≥ 45% | < 25% |
| Reply rate | ≥ 6% | < 2% |
| Positive reply rate | ≥ 3% | < 1% |
| Loom-sent rate | ≥ 90% | n/a |
| Demo-booked rate | ≥ 30% | < 15% |
| Paid conversion rate | ≥ 25% | < 10% |
| Revenue per 1k sends | ≥ $400 | < $150 |
| Unsub rate | < 1.5% | > 3% |
| Spam rate | < 0.1% | > 0.3% |

### Funnel benchmark (per 1k sends)

```
1,000 sends
→ 450 opens (45%)
→ 60 replies (6%)
→ 30 positive replies (3%)
→ 27 Looms sent
→ 9 demos booked
→ 2-3 paid customers
≈ $3,000-$4,500 revenue per 1k
```

### Kill rules

- Sequence-level: < 2% reply after 500 sends → kill, fix list first.
- Subject-level: < 25% open after 200 sends → A/B test, auto-promote winner.
- Step-level: D4 reply rate < 30% of D0 → rewrite or remove.
- Domain-level: > 0.3% spam in 7d → pause sender, warm fresh domain.
