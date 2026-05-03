# Eject — buildout plan

Ordered top to bottom. Each phase has a "what" and a "why now." Strikethrough as you ship.

---

## Phase 0 — Switch to Vercel + production keys (today, 30 min total)

These four block everything downstream.

- [ ] **Sign up for Vercel** with your GitHub account (2 min). Import `sharmaneal-debug/eject`. Paste env vars from `.env.local`. Deploy. → `eject.vercel.app`. Walk-through: `docs/setup-deploy.md`.
- [ ] **Reuse your Laniakea Resend account** (5 min — no new account, no new bill). Add `eject.co` as a second verified domain alongside VedasAI. Use the existing `re_…` API key. Set up Cloudflare Email Routing to forward `hi@eject.co` → `neal@laniakea.design` so customer replies land in your existing inbox. Walk-through: `docs/setup-resend.md`.
- [ ] **Roll the live Stripe key** (`sk_live_…`) you posted in chat earlier (3 min). Stripe dashboard → API keys → Roll. Old key keeps working for 1 hour. Replace nowhere — we're using test keys for everything. The leaked key is the security issue, not the test ones.
- [ ] **Buy `eject.co`** (~$30, 5 min). Cloudflare Registrar is the cheapest renewal-fair option ($9.99 first year, $9.77/yr after). Or Porkbun ($12.71/yr). Skip GoDaddy.

**Why now:** the site can't take a real customer until Stripe + Resend + a real domain are wired. Everything else is downstream of these.

---

## Phase 1 — Make it production-ready (this week, ~6 hours total)

Site has to be ready for the first real customer. Stripe live mode requires several of these legally.

### Site polish

- [ ] **Custom favicon** (15 min). Use a square mark with the `>` glyph or your own design. Put `favicon.ico` + `apple-touch-icon.png` + `icon.svg` in `app/`. Resources: [favicon.io](https://favicon.io).
- [ ] **OG images per page** (45 min). Right now we have no OG image. Use `next/og` to render one programmatically per page (title + tagline overlay). Templates at [vercel.com/templates/next.js/og-image-generation](https://vercel.com/templates/next.js/og-image-generation).
- [ ] **Logo upgrade** (1 hr). Replace the placeholder `>` square. Either commission ($50 on Fiverr) or generate via Vercel `og` style. Drop in `components/header.tsx` + `components/footer.tsx`.
- [ ] **Privacy Policy page** (15 min) at `/privacy`. Required by Stripe before live mode. Use [getterms.io](https://getterms.io) free generator → paste output into a new page.
- [ ] **Terms of Service page** (15 min) at `/terms`. Same generator. Same urgency: required by Stripe.
- [ ] **Footer links** to `/privacy` + `/terms` (5 min).
- [ ] **Refund policy page** (10 min) at `/refunds`. We have a 14-day refund promise. Codify it.

### Lead capture / data layer

- [ ] **Pick a lead store: Notion DB or Supabase free tier** (30 min decide + setup). Notion is faster. Supabase is more "real database." Recommendation: Notion DB for the first 100 customers, migrate to Supabase when you need real queries.
- [ ] **Wire `/api/intake`** to write every scan + every checkout to the lead store (1 hr). Currently a stub that only logs.
- [ ] **Wire `/api/checkout/finalize`** to write the paid customer into the lead store (15 min).
- [ ] **Slack webhook for new leads** (15 min). Free Slack workspace → incoming webhook → `process.env.SLACK_WEBHOOK_URL`. Get a ping every time someone scans, every time someone pays.

### Payments hardening

- [ ] **Stripe webhook** for `checkout.session.completed` (1 hr). Right now we rely on the user landing on `/checkout/success` to fire the kickoff email. A webhook is more robust: even if the user closes the tab, we still get notified and can send the email. Stripe CLI to test locally.
- [ ] **Switch Stripe to live mode** when ready (5 min). Replace `sk_test_…` with `sk_live_…` in Vercel env. Re-run `pnpm setup-stripe` with the live key to create live products + prices. Update `STRIPE_PRICE_*` in env.
- [ ] **Decline-handling UX** (15 min). What happens when a card is declined? Right now Stripe handles it; verify the back-to-our-site flow works.

### Trust + analytics

- [ ] **PostHog analytics** (30 min). You already use it. Free 1M events/mo. Track: scan completed, checkout started, checkout paid, plus per-page views. Add to `app/layout.tsx`.
- [ ] **Plausible / Vercel Analytics** alternative (10 min) if you want simpler page-view stats. Vercel Analytics is one toggle in the dashboard.
- [ ] **Sentry error tracking** (free tier, 30 min). Catches client-side and server-side errors. Don't ship to production without this; you'll fly blind on bugs.

### Robustness

- [ ] **Rate-limit `/api/scan`** (30 min). Cap at 10 scans per IP per hour. Otherwise someone can scrape Google for URLs and DoS your Anthropic budget. Use Upstash Redis free tier or Vercel KV.
- [ ] **Handle scan API timeouts gracefully** (15 min). If the target site is slow / unreachable, return a friendly message ("we couldn't reach that URL") instead of a 500.
- [ ] **Form validation on intake + checkout** (30 min). Email regex, URL regex, name length cap. Use [zod](https://zod.dev) — already a common dep.
- [ ] **Real test of the rebuilder** (1–2 hr). Run `pnpm crawl https://your-test-framer-site.com` then `pnpm rebuild data/snapshots/...` end-to-end. Verify the output Next.js project actually runs. **This is the biggest unknown right now.** Until we do this, we don't know if Express delivers what we promise.

---

## Phase 2 — SEO foundation (this week, ~8 hours)

The 15-keyword roadmap from `docs/research/competitor-and-demand-research.md` is the playbook. We've shipped 1 of 15 posts.

### On-page SEO

- [ ] **Schema.org JSON-LD on every page** (1 hr).
  - Homepage: `Organization` + `Service` schema
  - Blog posts: `Article` + `FAQPage` (the existing post already has FAQ schema in the content; needs to render in the `<head>`)
  - Pricing: `Product` schema
  - FAQ page: `FAQPage`
- [ ] **Per-page `<title>` + `<meta description>` audit** (30 min). Each page should have a unique, keyword-targeted title under 60 chars and description under 160 chars.
- [ ] **Internal linking pass** (1 hr). Every page links to 3+ others. Hero CTAs, footer, in-content. Most-undervalued SEO move.
- [ ] **External authoritative links** in blog posts (30 min). Cite Cloudflare docs, Webflow help center (the lock-in admission!), Anthropic docs. Boosts credibility + sometimes earns reciprocal links.
- [ ] **Image alt text everywhere** (15 min).
- [ ] **Lighthouse audit** (30 min). Should be 95+ on Performance, Accessibility, Best Practices, SEO. If not, fix.

### Content

- [ ] **Blog post #2: "Framer to Next.js: The Honest Migration Guide"** (3 hr write + edit). Target: `framer to nextjs`. Same template as the Webflow post. Embed the cost calculator. Cite the Framer help page that admits "you cannot self-host."
- [ ] **Blog post #3: "Wix to Next.js: Yes, It's Possible"** (3 hr). Target: `wix to nextjs`. SERP is wide open. Lock-in story is the strongest of any platform.
- [ ] **Blog post #4: "Webflow Is Too Expensive — Here's the Real Math"** (3 hr). Target: `webflow too expensive`. Pair article with cost calculator. **Highest viral potential** of any piece in the roadmap.
- [ ] **Blog post #5: "How to Edit Your Website with ChatGPT (No Coding)"** (3 hr). Target: `edit website with chatgpt` + the emerging "vibe coded website" cluster. Showcase the AI editing kit.

### Programmatic SEO scaffolding

- [ ] **Comparison page template** at `/vs/[competitor]` (1 hr to build, then 15 min per page). Initial pages: `/vs/migratelab`, `/vs/convertframer`, `/vs/webstudio`, `/vs/framer-export-plugin`. Honest comparison: them vs us, by feature.
- [ ] **Industry/template landing pages** at `/migrate/[platform]/[industry]` (2 hr scaffold, 15 min/page). E.g., `/migrate/webflow/restaurant`, `/migrate/framer/agency`. Bulk-generate 20+ via a script that reads from a YAML file.
- [ ] **Free downloadable lead magnet** (2 hr). PDF: "The Honest Cost of Webflow in 2026." Scrape what's already in the post + add interactive worksheets. Gate behind email. Sends prospects into a drip sequence.

### Crawl + indexing

- [ ] **Submit sitemap to Google Search Console** (10 min). Add `eject.co` as a property. Paste sitemap URL.
- [ ] **Submit to Bing Webmaster Tools** (5 min). Same.
- [ ] **Robots.txt + ai.txt** (10 min). Allow Google + Bing + ChatGPT crawler. Block scrapers we don't want indexing the cost calculator results.

---

## Phase 3 — First customer pipeline (week 2, ~10 hours)

You have everything to run outbound. The playbooks are written. Time to execute.

### Outbound

- [ ] **Cold email infrastructure** (3 hr setup). Use the playbook in `docs/playbooks/cold-email.md`. Stack:
  - **List building**: Apollo (you have it) for company + person enrichment, plus PublicWWW queries to find Webflow/Framer subdomains
  - **Sender**: Resend or a dedicated cold-email tool like Smartlead ($30/mo) for warmup + deliverability
  - **Send**: Gmail aliases or a separate domain (`outreach@eject.co`)
  - **Tracking**: open rates + reply rates in your tool
- [ ] **First 50 cold emails** (2 hr). Pick the highest-signal prospects from your audit script. Hand-write the first 10 to test the angle. Automate the next 40.
- [ ] **Reddit / Forum engagement** (1 hr/day for a week). The 7 prepared replies are in `docs/playbooks/community-engagement.md`. Spread across days. Lead with help; the soft pitch is one line at the end.
- [ ] **LinkedIn announcement post** (30 min). You have a personal audience. Tell them what you built. Use the LinkedIn template in `docs/playbooks/launch-pack.md`.
- [ ] **Newsletter signup capture** (30 min). Add a tiny email-capture box at the bottom of every blog post + at the homepage. Use Resend Audiences (free).

### Customer experience

- [ ] **Run a real test migration** (3 hr). Pick one of your own sites or a friend's site. Run `pnpm crawl` then `pnpm rebuild`. Verify the output works. **Document everything that breaks** — that becomes your week-3 product roadmap.
- [ ] **Build the "preview link" delivery** (3 hr). After payment, the rebuilder runs and outputs a Next.js project. We need to actually deploy it as a preview to Cloudflare Pages or Vercel and email the customer the URL. This is the heart of Express — has to be smooth.
- [ ] **Customer support inbox** (15 min). `hi@eject.co` forwards to your real email until volume justifies a Helpscout / Plain account.

---

## Phase 4 — Launch moments (week 3-4, ~12 hours)

Public moments to drive traffic + first non-outbound customers.

- [ ] **Product Hunt launch** (3 hr prep, 1 day live). Use kit in `docs/playbooks/launch-pack.md`. Schedule for a Tuesday. Pre-warm 20+ supporters.
- [ ] **Show HN** (1 hr to write, 1 day to monitor). Use the prepared post in launch-pack. Title is critical. Pin the founder objection-handler reply within 30 seconds of submission.
- [ ] **IndieHackers transparency post** (2 hr). "0 to $X MRR in N weeks" template ready in launch-pack. Fill with real numbers.
- [ ] **YouTube creator partnership** (4 hr to find + brief). Find 2–3 design / no-code YouTubers with 5–50K subs. Pitch a sponsored video at $1,500–$3,000. They show your tool migrating a real site.
- [ ] **Twitter build-in-public cadence** (15 min/day). 3 prepared starter posts in launch-pack. Post when you ship something real.

---

## Phase 5 — Iterate (ongoing)

- [ ] **Weekly content** — 1 blog post per week minimum. Stay on the keyword roadmap. Don't drift into shower-thoughts content.
- [ ] **Customer testimonials + case studies** — every shipped Concierge customer becomes a 1-page case study (`/case-studies/[slug]`) with before/after Lighthouse + cost screenshots + a real quote.
- [ ] **A/B test the pricing page** — the moment you have 100 visitors/week. Test $49 vs $79 Express, $299 vs $499 Concierge.
- [ ] **Refund + dispute SOPs** — write them down before you have a dispute. Keep refund rate < 5%.
- [ ] **Weekly retro** — every Friday, 15 min. What converted? What didn't? One thing to change next week.

---

## What I'll do without bothering you

If you give me the green light, I can ship Phase 1 robustness items (privacy/terms pages, rate limiting, schema markup, OG images, lead-store wiring once you pick Notion vs Supabase) end-to-end. None of these need your input beyond the choice of lead-store.

I can also ship Phase 2 SEO content — the next 4 blog posts. Each takes ~3 hr of writing + editing. Same SEO depth as the existing post.

The things I genuinely need from you:
- Resend API key (after signup)
- Lead store choice: Notion DB or Supabase
- Which YouTube creators to pitch (you know the design world better than I do)
- Sign-off on the next 4 blog post titles before I write 12 hours of content

Tell me which Phase 1 items you want me to take vs. handle yourself, and I start now.
