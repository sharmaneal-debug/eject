# Eject — Real unit economics

Last updated: 2026-05-03. Numbers are for **test/sandbox usage today**. Re-run when prices or stack change.

## TL;DR

| Tier | Price | Cash margin | Notes |
|---|---|---|---|
| **Express** | $49 | **$45–$47** (≈94%) | Pure cash margin. The bottleneck is Anthropic API. |
| **Concierge** | $299 | **$285–$289** before labor (≈97%) | Real cost is your time, not cash. |

If Concierge takes ≥3 hours of your time at $100/hr opportunity cost, you're working for ~$30/hr net. Tooling has to drive Concierge to <90 min for it to be worth running personally vs. a contractor.

The fixed cost to keep Eject alive is **~$2.50/mo** (just the `eject.co` domain amortized). Everything else is free tier.

---

## Variable cost per migration

### Stripe fees

Stripe charges **2.9% + $0.30** for US card transactions. No monthly fee. No setup fee.

| Tier | Gross | Stripe fee | Net to you |
|---|---|---|---|
| Express ($49) | $49.00 | $1.72 | **$47.28** |
| Concierge ($299) | $299.00 | $8.97 | **$290.03** |

International cards: +1.5%. Roughly $1.45 more per Concierge sale. Not material.

### Anthropic API (the rebuild step)

The rebuilder sends each captured page to Claude Sonnet to regenerate it as Next.js + Tailwind. Costs per page (Sonnet 4.5 list pricing: $3/M input, $15/M output):

| Captured HTML size | Input tokens | Output tokens | Cost per page |
|---|---|---|---|
| Small page (10 KB) | ~3,000 | ~1,500 | $0.03 |
| Medium page (40 KB, our cap) | ~10,500 | ~3,000 | $0.08 |
| Large page (40 KB, dense components) | ~10,500 | ~6,000 | $0.12 |

Multiply by page count to get the total. With prompt caching enabled (we send the same system prompt every page), the system prompt cost drops ~85% on subsequent pages. Caching is in the SDK but not yet wired in our `scripts/rebuild.ts` — TODO worth $0.10–0.30 per migration.

**Realistic per-migration totals (without caching):**

| Site size | Pages | API cost |
|---|---|---|
| Tiny (1-page Framer landing) | 1 | $0.08 |
| Small (5 pages, blog-less) | 5 | $0.40 |
| Typical small business | 8 | $0.65 |
| Medium (with blog) | 15 | $1.20 |
| Large (50-page directory) | 50 | $4.00 |

**At $49 Express, even a 50-page site is profitable at ~92% margin.** The tail of giant sites (200+ pages) caps at ~$15 in API cost; below the $49 price by 3x.

### PageSpeed / Lighthouse (the audit step)

Google PageSpeed Insights API is **free** with no key required for low volume (~50 calls/day). Above that you need an API key (also free). We use this in `scripts/audit.ts` for the cold-email personalization workflow, not in the customer-facing scan.

### Customer-facing scan (`/api/scan`)

Pure `fetch()` from a Cloudflare/Vercel edge function. No external paid APIs called. **Cost: $0** per scan. The compute is free tier.

### Resend (kickoff emails)

Free tier: 3,000 emails/month, 100/day, 1 verified domain. You'll send 1–2 emails per customer (kickoff, status). Even at 100 sales/month, you're at 200 emails — well under the cap.

**Cost: $0** until you exceed free tier (1,500+ customers/month).

### Hosting

Cloudflare Pages free tier covers Eject's own marketing site. Free SSL, free CDN, unlimited bandwidth, 500 builds/month, 20k files.

**Cost: $0** until you hit 500 builds/month or 100k function requests/day.

---

## Putting it together: per-customer P&L

### Express ($49)

| Line | Amount |
|---|---|
| Revenue | +$49.00 |
| Stripe fee | -$1.72 |
| Anthropic API (typical 8-page site) | -$0.65 |
| Anthropic API (worst-case 50-page site) | -$4.00 |
| Resend (1 kickoff email) | $0 |
| Hosting (Cloudflare free) | $0 |
| **Net** | **$43.28 to $46.63** |
| **Margin** | **88% to 95%** |

Your time on Express should be **near zero** — the whole point is that the pipeline is automated (crawl → rebuild → preview link → customer reviews). Ideally you spend 5 minutes per Express customer reviewing the output before sending the preview link.

### Concierge ($299)

| Line | Amount |
|---|---|
| Revenue | +$299.00 |
| Stripe fee | -$8.97 |
| Anthropic API | -$0.65 to -$4.00 |
| Resend | $0 |
| Hosting | $0 |
| **Cash net** | **$286.03 to $289.38** |
| **Cash margin** | **96% to 97%** |

But Concierge is hand-polished. Time per customer matters:

| Hours spent | Implied $/hr at $100/hr opportunity cost |
|---|---|
| 1 hour | $186/hr — great |
| 2 hours | $93/hr — fine |
| 3 hours | $62/hr — meh |
| 5 hours | $37/hr — you're losing |

Tooling target: keep Concierge **under 2 hours per customer**. The Express pipeline does most of the work; Concierge adds ~30 min of human polish + 30 min of DNS/handoff.

---

## Fixed monthly costs

| Item | Monthly | Annual |
|---|---|---|
| Domain `eject.co` | $2.50 | $30 |
| Cloudflare Pages | $0 | $0 |
| Resend (free tier) | $0 | $0 |
| Stripe account | $0 | $0 |
| GitHub | $0 | $0 |
| Anthropic API | $0 base; usage-based | $0 base |
| **Total** | **$2.50** | **$30** |

You break even on the domain after **one Express customer per year**.

---

## Break-even analysis

| Scenario | Customers needed |
|---|---|
| Cover the $30/yr domain | 1 Express |
| Pay yourself $1,000/mo | 21–24 Express OR 4 Concierge |
| Pay yourself $5,000/mo | 105–115 Express OR 20 Concierge (40 hrs/mo) |
| Pay yourself $10,000/mo | 210–230 Express OR 40 Concierge (80 hrs/mo) |

At 40 Concierge/mo: 80 hours of human work per month for $10K. That's about a 50%-time job at $250/hr effective rate. Reasonable.

At 210 Express/mo: ~$0.04 per customer in API cost = $8.40/mo total. Trivial.

---

## Where the math could break

1. **Anthropic raises prices.** Sonnet pricing has been stable but subject to change. A 3x price hike still keeps Express at 80% margin. A 10x hike forces a price increase to $99 or moving to a cheaper model (Haiku at $0.80/M input, $4/M output — about 5x cheaper).

2. **Sites bigger than expected.** A 200-page programmatic SEO site costs ~$16 in API. Still profitable at $49 but margin drops to 65%. **Mitigation:** add a page-count surcharge ("$49 up to 25 pages, +$1/page after"), or use Haiku for batch rebuilds.

3. **Stripe disputes/refunds.** Stripe charges $15 per disputed chargeback. At our refund-friendly stance (14-day full refund, no questions), the math gets ugly if dispute rate >5%. **Mitigation:** track refund rate; if >10%, tighten the preview-and-approve loop.

4. **Resend free tier exhausted.** 3,000 emails/mo = 1,500 customers (assuming 2 emails each). Beyond that, Resend Pro is $20/mo for 50K emails. Still negligible per customer (<$0.001).

5. **Cloudflare Pages free tier exhausted.** 100K function invocations/day on Eject's own marketing site. We'd need significant traffic (30k+ visitors/day with calculator usage) to hit this. Cloudflare Pro is $20/mo and removes the cap entirely.

---

## Pricing sensitivity

Assuming current cost structure, you could drop Express to **$29** and still maintain 80% margin on typical sites. You could push it to **$79** and still be the cheapest done-for-you tier in the market (Fiverr starts at ~$80, MigrateLab at $1,500+).

The right move for the first 50 customers: **stay at $49.** It's the impulse-buy threshold, undercuts every alternative, and gets you to revenue + testimonials fast. Raise to $79 once you have 10+ case studies.

For Concierge, **$299 is the floor** for a hand-polished migration with domain transfer. Industry is $1,500–$50K. You could push to $499 once you have proof and stop over-delivering. Don't go below $299; the Stripe fee + your time eats everything.

---

## What's NOT counted

- **Marketing/CAC.** Cold email (Apollo/PublicWWW) is not free. If you do paid ads (Google, Reddit) those are real customer-acquisition costs. Plan: assume CAC of $30–60 per customer in year 1, dropping to $10–20 at scale via SEO and word-of-mouth.
- **Your time on outbound.** Cold-email playbook in `docs/playbooks/cold-email.md` is hours of work to set up + run weekly. Not counted here.
- **Ongoing customer support.** Express promises 7 days of email support; Concierge promises 30 days. Most customers won't use much, but a 5% churn-into-support rate at 30 min per ticket adds up. **Plan:** keep an FAQ + screen recordings; customer support stays under 30 min/week until ~50 customers.

---

## Honest takeaway

**The numbers work.** Even with worst-case assumptions (50-page site, international card, Stripe dispute, Resend Pro), Express margin stays above 80% and Concierge above 95% cash margin. The actual constraint is **your time on Concierge** — the pricing only makes sense if you can hit ≤2 hours per customer.

If you can't, the right move is either:
- Raise Concierge to $499–$799 to compensate for the time
- Hire a contractor at $30–50/hr to handle the manual polish step (you'd net $200/Concierge)
- Steer customers toward Express more aggressively (it's the high-margin SKU)
