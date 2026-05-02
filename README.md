# Eject

> Eject from Webflow. Own your site. Pay $5 a year.

A productized service that migrates your Framer / Webflow / Wix / Squarespace site to a clean Next.js codebase you own — deployed on Cloudflare Pages free tier. Optional AI chatbot editor for ongoing edits.

This repository is two things:

1. **The marketing site** at `eject.dev` (Next.js 15 App Router + Tailwind). Pages, pricing, cost calculator, blog, intake form.
2. **The migration tooling** in `scripts/` — Playwright crawler, Claude-driven rebuilder, prospect auditor, chat editor prototype.

The full business plan is in `~/Knowledge/wiki/projects/website-migration-service.md` (Neal's vault). Underlying competitor + SEO + demand research is in `docs/research/`.

## Repo layout

```
app/                        Next.js routes
  page.tsx                  Home (hero + cost calculator + comparison + pricing + FAQ)
  pricing/                  Pricing page
  how-it-works/             Eight-step pipeline explainer
  calculator/               Standalone calculator page
  migrate/                  Intake form (default)
    [platform]/             Per-platform landing (webflow, framer, wix, squarespace)
  blog/                     Markdown-backed blog
    [slug]/                 Dynamic post page (renders content/blog/<slug>.md)
  about/                    About page
  api/intake/               Lead capture endpoint
  sitemap.ts, robots.ts
components/                 Reusable UI (hero, cost-calculator, pricing, faq, intake-form, ...)
content/blog/               Markdown blog posts (frontmatter + body)
docs/
  playbooks/                Cold-email, community-engagement, launch-pack, 90-day runbook
  research/                 Competitor scan + SEO keyword roadmap + demand signals
lib/                        site config, posts loader, cn() helper
scripts/                    Playwright crawler, AI rebuilder, audit script, chat editor
```

## Local development

```sh
pnpm install
pnpm dev                    # http://localhost:3000
pnpm typecheck
pnpm build
```

## Migration tooling

Three scripts. See `scripts/README.md` for full usage.

```sh
pnpm crawl https://example.com           # Playwright snapshot → data/snapshots/<host>/
pnpm rebuild data/snapshots/<host>/      # Claude → Next.js project in out/<host>/
pnpm audit https://prospect.com          # platform + Lighthouse + cost estimate
pnpm editor ./out/<host>/                # chat-driven editor CLI prototype
```

## Pricing

| Tier | Price | What ships |
|---|---|---|
| DIY Guided | $49 | URL → repo + deploy guide |
| Done-with-You | $299 | We migrate, you launch on a 30-min Zoom |
| Done-for-You | $1,499 | Hand-off, wired, editor pre-trained |
| Editor — Hobby | $79/mo | Up to 50 chat-edits/mo + preview deploys |
| Editor — Pro | $149/mo | Unlimited edits + monthly Lighthouse/SEO report |

## Marketing playbooks (in `docs/`)

- **`cold-email.md`** — three platform-specific 3-step sequences, objection handlers, list-building spec, KPI dashboard targets
- **`community-engagement.md`** — 7 Reddit/forum reply drafts ready to paste, 3 YouTube comments, 3 Twitter starters, upvote-earning rules
- **`launch-pack.md`** — Show HN post, Product Hunt kit, 12-tweet thread, LinkedIn post, IH transparency template, case-study template, press list
- **`runbook-90-day.md`** — day-by-day for week 1, week-by-week thereafter, with hard decision gates at days 14/30/60/90

## Tech stack

- Next.js 15 + TypeScript + Tailwind (marketing site)
- Cloudflare Pages free tier (hosting; both ours and our customers')
- Playwright (crawler)
- Anthropic Claude SDK (rebuilder + editor)
- Resend (transactional email)
- Stripe Checkout (billing)
- gray-matter + react-markdown (blog)

## Deploy (this site)

Connect this repo to Cloudflare Pages. Build command: `pnpm build`. Build output: `.vercel/output` for Next.js with the `@cloudflare/next-on-pages` adapter, or use Vercel directly. Both work zero-config.

## Status

Day 0. The marketing site renders, the calculator math is real, the migration tooling runs end-to-end on a happy-path Framer site. The chat editor is a CLI prototype. The hosted editor + GitHub App + sandbox build verification are the week 6–8 milestones (see `docs/playbooks/runbook-90-day.md`).
