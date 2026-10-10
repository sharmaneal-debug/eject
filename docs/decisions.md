# Decision log

Open architectural decisions to lock down before week 4. Resolve top-down.

| # | Decision | Recommendation | Why | Status |
|---|---|---|---|---|
| 1 | Name + domain | **Eject** at `eject.dev` (fallback `geteject.com`, `ejectfrom.com`) | "Eject" is action-led, single-syllable, evokes ownership and exit. Memorable. | open |
| 2 | Editor: build vs fork | **Fork [JCodesMore/ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template)** as a starting point, then own | 13K stars, MIT-ish, proves URL-to-Next.js virality. Saves 3 weeks. | open |
| 3 | GitHub App vs OAuth | **GitHub App** — bypass deploy-key friction, finer scopes | More secure, but 1-2 weeks of marketplace listing setup | open |
| 4 | Default destination: Cloudflare Pages vs Vercel | **Cloudflare Pages default; Vercel as paid upgrade** | Cloudflare delivers the "$5/yr" headline. Vercel has stronger Next.js DX. | open |
| 5 | Default CMS layer | **Markdown in repo (default), Sanity (option), Payload (option)** | Markdown = simplest. Don't add a database for trivial sites. | open |
| 6 | Pricing | **Automated $99** (tier id `express`) and **Done for you $199** (tier id `concierge`). Display names and amounts live in `lib/site.ts` | Neal, 2026-10-10. Checkout ids stay `express` / `concierge` so Stripe price env vars do not move | decided: 2026-10-10 |
| 7 | Payment timing | DIY/DwY full upfront. DFY 50% deposit + 50% on delivery | Front-load risk to customer = stronger commitment | open |
| 8 | Refund policy | "If you're not editing your new site within 14 days, full refund" | CAC accelerator at low refund-rate cost | open |
| 9 | Legal: scrape consent | **Customer signs consent in intake form before crawl** | They have right to migrate own site; we have written permission | open |
| 10 | Brand voice | **Irreverent + educational** (Cloudflare-style, NOT Webflow-style) | The audience is tired of Webflow's enterprise-y comms | open |
| 11 | Scope | **Simple marketing, portfolio, and landing sites only** | Stores, heavy CMS, and member areas stay out. The $99 offer is an automated migration of a simple site, reviewed before DNS. It is not a CMS extract and not a preview before payment | decided: 2026-10-10 |
| 12 | Renewal watch storage | **Vercel Blob private JSON, file fallback for local dev** | Durable on Vercel without a second database. Memory fallback must report `persisted: false` | decided: 2026-10-10 |
| 13 | Done-for-you cap | **About 10 pages, 1 form, 2 revision rounds, 30-minute handoff** | Beyond the cap is a referral or a priced add-on. The add-on is not a SKU yet | decided: 2026-10-10 |
| 14 | Positioning | **Lead with easy editing** | After the move, the customer edits by chatting with their own AI. Editing guide and agent instructions ship with both offers | decided: 2026-10-10 |

## How to use this file

When you make a call, change `Status` to `decided: <date>` and add a one-line rationale. Don't delete; track the trail. The wrong decision today is fixable; the un-made decision blocks shipping.
