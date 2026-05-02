# Eject — 90-Day Launch Runbook

Day-by-day, week-by-week. Each item is a check-box. Estimated time per item in parens. Goal: $5K+ MRR + 20+ paying customers by day 90.

---

## Week 0 — Pre-launch (do before "Day 1")

- [ ] **Lock the name + domain.** Eject is the working name. Verify `eject.dev` is available; fall back to `geteject.com` or `ejectfrom.com`. (1h)
- [ ] **Buy the domain.** $12. (5min)
- [ ] **Create the GitHub org + repo.** `Eject/eject` (or under personal account initially). Push the codebase. (15min)
- [ ] **Set up Cloudflare account + Pages project.** Connect to GitHub. Auto-deploys on push to `main`. (30min)
- [ ] **Wire DNS.** Cloudflare nameservers + apex + `www` + Pages. (30min)
- [ ] **Stripe account + 3 products** (DIY $49, DwY $299, DFY $1,499). Test mode first. (1h)
- [ ] **Resend account + verified domain.** For form intake + outbound. (30min)
- [ ] **GitHub App registration** (for the editor's per-customer repo access). Defer to week 6 if time-pressed. (2h)
- [ ] **Anthropic API key.** Spend cap at $200/mo until validated. (10min)
- [ ] **Notion or Airtable lead table.** Columns: name, email, site_url, platform, tier, status, notes. (30min)
- [ ] **Calendar link** for paid Loom audits (Cal.com free tier; embed on `/migrate` for tier=dfy). (30min)

---

## Day 1 — Validation

- [ ] **Comment on Reddit thread #1**: r/Framer "Framer just killed my agency margins" — use the prepared draft from `docs/playbooks/community-engagement.md`. (30min)
- [ ] **Comment on Reddit thread #2**: r/Framer "Searching for Framer Alternatives." (15min)
- [ ] **Run `pnpm audit` on 50 prospects** seeded from PublicWWW Framer + Webflow searches. Review the JSONL output. (1h)
- [ ] **Send the first 10 personalized cold emails** (Framer sequence F1, hand-picked from highest-signal audit results). (1h)
- [ ] **Ship Day-1 announcement tweet** from `docs/playbooks/launch-pack.md` Twitter section. (5min)
- [ ] **DM 5 named prospects from r/webflow "Considering moving away" thread** with a free-Loom-audit offer. (30min)

**End-of-day check**: 3 Loom audit requests received? If yes, proceed to Day 2. If 0, the targeting is wrong — do not double down on volume; fix the list.

---

## Days 2–7 — First customer

- [ ] **Day 2**: respond to inbound. Record + send 3 Loom audits. (2h)
- [ ] **Day 3**: comment on the remaining 5 Reddit/Forum threads, spread across the day. (1.5h)
- [ ] **Day 4**: send the **F2 follow-up email** to the Day-1 cohort. Send 50 fresh **W1** Webflow emails. (1.5h)
- [ ] **Day 5**: ship the **first SEO post live**: `/blog/webflow-to-nextjs`. Submit to Google Search Console. (30min)
- [ ] **Day 6**: ship the **second SEO post**: `/blog/framer-to-nextjs` (write or commission). (4h)
- [ ] **Day 7**: **first Done-with-You sale**, ideally from a Reddit or cold-email lead. Migrate the site live in a Zoom session. Record the session for a case-study video.

**End-of-week check**: 1 paying customer + 5 audit requests = green light. 0 paying = re-examine pricing or positioning before scaling outbound.

---

## Days 8–14 — Tooling reliability

- [ ] **Run `pnpm crawl` + `pnpm rebuild`** end-to-end on 5 real Framer sites. Document failure modes. (1d)
- [ ] **Improve the rebuilder prompt** based on the worst output. Re-run. (4h)
- [ ] **Day 10**: send **F3 + W2** follow-ups. (1h)
- [ ] **Day 12**: scrape next 200 prospects. Send 100 cold emails (50 Framer + 50 Webflow). (3h)
- [ ] **Day 14**: ship **third SEO post**: `/blog/wix-to-nextjs`. Sparse SERP — easiest to crack. (4h)

**Capacity rule**: do NOT take a Done-for-You order until the rebuilder ships 8/10 pages cleanly without manual fixes.

---

## Weeks 3–4 — Editor MVP + first DFY

- [ ] **Editor v0**: chat → file edit → git commit (CLI works; web UI is week 6). Use `scripts/editor.ts` as the foundation. (2-3d)
- [ ] **First DFY ($1,499) sale**, even if at half-price for a case-study trade. Document everything. (3-5d)
- [ ] **Cold email volume to 1,000/wk.** Track per-platform conversion in `data/audits/` + `data/sends/`. (ongoing)
- [ ] **Fourth + fifth SEO post**: `/blog/webflow-too-expensive` + `/blog/squarespace-to-nextjs`. (1d)
- [ ] **YouTube creator outreach**: DM 10 creators in the design/no-code space. Pitch a sponsored video for $1,500. (2h)

**End-of-month check**: $3-5K revenue closed, 8-12 paying customers across tiers, 1 named DFY case study published.

---

## Weeks 5–8 — Scale-prep

- [ ] **Editor sandbox** (per-customer Cloudflare Container or Fly Machine). (1w)
- [ ] **Editor preview deploy + rollback** (one-click git revert). (3d)
- [ ] **Editor billing flow** (Stripe subscription + usage cap). (3d)
- [ ] **First paid Editor MRR customer** ($79 Hobby). (target: end of week 6)
- [ ] **Show HN launch** (use the prepared post in `launch-pack.md`). Time it for a Tuesday morning. (2h)
- [ ] **6th–8th SEO posts**: `/blog/framer-export-limitations`, `/blog/webflow-vs-self-hosting`, `/blog/cancel-webflow-subscription`. (2d total)
- [ ] **First IndieHackers transparency post**: 0 to $X MRR in 6 weeks. Use the `launch-pack.md` template. (1h)
- [ ] **YouTube creator partnership ships**. (creator-led)

**End-of-month check**: $8-12K MRR run-rate (one-time + retainer combined), 20+ customers, repeatable delivery process.

---

## Weeks 9–12 — Compounding

- [ ] **Cold email volume to 2,000/wk** with sender-domain rotation. (ongoing)
- [ ] **First case-study micro-site**: `eject.dev/case-studies/<customer>` with before/after Lighthouse, before/after cost, customer quote. (1d)
- [ ] **First $5K+ DFY sale** (B2B SaaS tier — see ICP C in business plan). (3d delivery)
- [ ] **9th–12th SEO posts** + start programmatic SEO: `framer-vs-{webflow,wix,squarespace,nextjs}` and `webflow-{industry}-template-migration`. Aim for 50+ landing pages by month 6. (1w setup, ongoing)
- [ ] **Onboard first part-time migration ops contractor** (20h/wk @ $30-50/hr). Document the playbook in `docs/operations.md`. (3d hiring + onboarding)
- [ ] **Product Hunt launch** with launch-pack assets. (1d)

**End-of-quarter check**: $15-25K MRR, 30+ customers, contractor delivering 4-6 migrations/wk, top 5 winnable SEO queries on page 1.

---

## Decision gates (hard rules)

- **Day 14 — paid customers**: < 3 paying = pivot pricing or positioning. Don't keep buying ads with broken offer.
- **Day 30 — outbound conversion**: < 0.3% paid conversion on cold email = list is wrong. Switch from PublicWWW seeds to BuiltWith + Apollo.
- **Day 60 — editor reliability**: > 1 in 20 chat-edits breaks the build = ship the editor as **paid manual review** ($149/mo "Pro" only) until it's fixed. Don't ship a flaky editor as Hobby.
- **Day 90 — capacity**: > 6 active migrations in any week = hire the contractor. Solo Neal caps at ~6/week.

---

## What good looks like at day 90

- 25+ paying customers
- $8-15K MRR (editor retainers)
- $30-60K migration revenue closed (one-time)
- 12+ SEO posts ranking in top 30 for migration-intent queries
- 1 YouTube partnership shipped, 1 HN front page placement, 1 IH transparency post with real numbers
- 3 published case studies with Lighthouse + cost screenshots
- Ops playbook documented end-to-end (anyone could run a migration)
- 1 acquisition or partnership inquiry (Vercel, Cloudflare, Sanity, Payload, Builder.io)
- Decision: hire to scale, OR cap at lifestyle-business ($300-500K/yr)

---

## Files referenced in this runbook

- `docs/playbooks/cold-email.md` — outbound sequences + KPI targets + list-building spec
- `docs/playbooks/community-engagement.md` — 7 Reddit/Forum drafts + 3 YouTube comments + 3 Twitter posts + upvote-earning rules
- `docs/playbooks/launch-pack.md` — HN post + Product Hunt + Twitter thread + LinkedIn + IndieHackers + case-study template + press list
- `docs/research/competitor-and-demand-research.md` — 40 competitors mapped + SEO keyword universe + named demand-signal threads
- `scripts/crawl.ts` — Playwright site crawler
- `scripts/rebuild.ts` — Claude-based AI rebuilder
- `scripts/audit.ts` — outbound prospect personalization
- `scripts/editor.ts` — chat editor CLI prototype
