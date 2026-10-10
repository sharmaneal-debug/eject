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

See `scripts/README.md` for full usage.

```sh
pnpm crawl https://example.com           # Playwright snapshot → data/snapshots/<host>/
pnpm rebuild data/snapshots/<host>/      # Claude → Next.js project in out/<host>/
pnpm site-audit https://prospect.com     # platform + Lighthouse + cost estimate
pnpm editor ./out/<host>/                # optional CLI editor (needs ANTHROPIC_API_KEY)
pnpm orders                              # list orders, scores, cost-to-serve
pnpm deliver <orderId>                   # write the customer repo (no model call)
```

## Pricing

Checkout reads `lib/pricing.ts`. Simple sites only: up to about 10 pages, 1 form. Past that is a refer-out or a priced add-on.

| Offer | Price | What ships |
|---|---|---|
| Automated | $99 one-time | Automated migration of a simple site. The customer edits afterwards by chatting with their own agent (`AGENTS.md`). |
| Done for you | $199 one-time | The same cap, done by hand. 2 revision rounds and a 30-minute handoff. |

There is no editor subscription. Stripe stays in test mode.

## How to run end to end locally in test mode

No card and no live key. The mock path never talks to Stripe.

```sh
pnpm install
pnpm test
EJECT_STRIPE_MODE=mock pnpm dev
```

1. Open `http://localhost:3000/checkout?tier=automated` (or `tier=done_for_you`).
2. The mock page posts to `/api/checkout/mock-complete`. That marks the order paid and issues a `tok_` access token. Nothing is charged.
3. Open the intake link from the success page and submit a public `https` URL (not localhost).
4. The order is scored: eligibility, migration-time estimate, and cost-to-serve. Eligible simple sites get a repo under `out/orders/<orderId>/` with `AGENTS.md`, `EDITING.md`, and `scripts/chat-edit.mjs`.
5. `pnpm orders` lists the order. `pnpm deliver <orderId>` writes that repo again. Add `--rebuild` only when `ANTHROPIC_API_KEY` is set; otherwise the model is not called.
6. The kit (`/kit?token=…`) opens after the score says the site is eligible.

To use Stripe's own test checkout instead of the mock:

```sh
# test secret only — sk_test_… — never sk_live_
pnpm setup-stripe
```

Put the printed names in `.env.local` (gitignored). Required names, values stay out of git:

- `STRIPE_SECRET_KEY` (`sk_test_` or `rk_test_` only)
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_AUTOMATED` (legacy fallback: `STRIPE_PRICE_EXPRESS`)
- `STRIPE_PRICE_DONE_FOR_YOU` (legacy fallback: `STRIPE_PRICE_CONCIERGE`)

Without those price ids, test checkout still starts: the session uses inline `price_data` at the offer amount. Forward webhooks with the Stripe CLI to `POST /api/stripe/webhook`. Live-mode events are rejected. The success page also reconciles the Checkout Session, so a local run works if the webhook is not forwarded.

`EJECT_STRIPE_MODE=mock` skips Stripe entirely.

### Order store

`ORDERS_STORE` selects `file` (default), `kv`, `blob`, or `postgres`.

| Name | Used when |
|---|---|
| `ORDERS_DIR` | File store directory. Default `data/orders` (gitignored). |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Vercel KV / Upstash. Alternate pair: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`. |
| `BLOB_READ_WRITE_TOKEN` | One private JSON document. |
| `POSTGRES_URL` or `DATABASE_URL` | Tables created on first use. |

On Vercel, the file store falls back to `/tmp` and is not durable. Set KV, Blob, or Postgres before real orders.

### Other env names

| Name | Role |
|---|---|
| `RESEND_API_KEY` | Send mail. If unset, send is skipped. |
| `RESEND_FROM` | Required to actually send. If unset, send is skipped. There is no `onboarding@resend.dev` fallback. |
| `LEAD_NOTIFICATION_TO` | Internal paid-order notice. Defaults to the site contact address. |
| `LEADS_WEBHOOK_URL` | Optional extra POST. Leads are always appended to the order store. |
| `OPS_ACCESS_TOKEN` | Gates `/ops`. |
| `ANTHROPIC_API_KEY` | Optional. Enables `pnpm rebuild`, `pnpm editor`, and `pnpm deliver --rebuild`. |
| `NEXT_PUBLIC_SITE_URL` | Absolute origin used in emails when the request host is unavailable. |

Still needs a secret or a decision before this takes a real test payment in a deployed environment: a Stripe test account and webhook secret (or stay on mock); a verified `RESEND_FROM`; a durable order store on Vercel. The app does not issue Stripe refunds. Ineligible sites are marked `refund_recommended` or `refer_out` / `add_on` for a person to handle. Marketing pages outside checkout (blog, how-it-works, FAQ, migrate) may still mention older prices; checkout, the pricing config, and delivery use $99 and $199.

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
