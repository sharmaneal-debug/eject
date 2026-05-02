# Decision log

Open architectural decisions to lock down before week 4. Resolve top-down.

| # | Decision | Recommendation | Why | Status |
|---|---|---|---|---|
| 1 | Name + domain | **Eject** at `eject.dev` (fallback `geteject.com`, `ejectfrom.com`) | "Eject" is action-led, single-syllable, evokes ownership and exit. Memorable. | open |
| 2 | Editor: build vs fork | **Fork [JCodesMore/ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template)** as a starting point, then own | 13K stars, MIT-ish, proves URL-to-Next.js virality. Saves 3 weeks. | open |
| 3 | GitHub App vs OAuth | **GitHub App** — bypass deploy-key friction, finer scopes | More secure, but 1-2 weeks of marketplace listing setup | open |
| 4 | Default destination: Cloudflare Pages vs Vercel | **Cloudflare Pages default; Vercel as paid upgrade** | Cloudflare delivers the "$5/yr" headline. Vercel has stronger Next.js DX. | open |
| 5 | Default CMS layer | **Markdown in repo (default), Sanity (option), Payload (option)** | Markdown = simplest. Don't add a database for trivial sites. | open |
| 6 | Pricing test | A/B: DIY $49 vs $99, DwY $299 vs $499, DFY $1,499 vs $1,999 | Need real conversion data before locking | open |
| 7 | Payment timing | DIY/DwY full upfront. DFY 50% deposit + 50% on delivery | Front-load risk to customer = stronger commitment | open |
| 8 | Refund policy | "If you're not editing your new site within 14 days, full refund" | CAC accelerator at low refund-rate cost | open |
| 9 | Legal: scrape consent | **Customer signs consent in intake form before crawl** | They have right to migrate own site; we have written permission | open |
| 10 | Brand voice | **Irreverent + educational** (Cloudflare-style, NOT Webflow-style) | The audience is tired of Webflow's enterprise-y comms | open |

## How to use this file

When you make a call, change `Status` to `decided: <date>` and add a one-line rationale. Don't delete; track the trail. The wrong decision today is fixable; the un-made decision blocks shipping.
