---
title: Website Migration Service — Underlying Research
compiled: 2026-05-01
project: "[[website-migration-service]]"
sources: [3 parallel research agents — competitor scan, SEO keyword analysis, demand-signal hunt]
---

# Research substrate for [[website-migration-service]]

This file preserves the raw output of three parallel research passes that informed the v1 business plan in [[website-migration-service]]. Keep for citation-checking and as a search target when the plan is updated.

---

## Part 1 — Competitor Landscape (40 competitors, 6 buckets)

### Master competitor table

| # | Name | Category | From → To | Pricing | Signal |
|---|---|---|---|---|---|
| 1 | Framer official export | Platform-native | Framer → static HTML | Pro $30/mo + React Export plugin $50-250/mo | Defensive feature |
| 2 | Webflow official export | Platform-native | Webflow → HTML zip | Workspace $19+/mo gated | CMS/forms/search break on export |
| 3 | Locofy.ai | AI converter | Figma → React/Next.js/Vue/HTML/Flutter/RN | Free PAYG → $399/yr+ | $7.25M raised, ~11 employees, Accel |
| 4 | Anima | AI converter | Figma → React/Vue/Tailwind/shadcn/Next.js | Free 5/day → $500/mo Enterprise | Established Figma plugin base |
| 5 | Kombai | AI converter | Figma → React + Tailwind/MUI | Free limited; Pro pricing private | Active dev community |
| 6 | Builder.io Visual Copilot | AI converter + visual CMS | Figma → React/Next.js/Vue/Angular/Svelte/Qwik | Free → Pro PAYG → Enterprise | $62.2M raised (Greylock + M12), 63 employees, $7.6M ARR ('23) |
| 7 | Webstudio | OSS visual builder | Build new (paste from Webflow) → static HTML | Free Hobby; $20/mo Pro; OSS self-host | Top recommendation in r/Framer migration threads |
| 8 | Plasmic | Visual builder + codegen | Build/edit → React/Next.js/Gatsby/Remix | Free → paid (private) | YC-backed |
| 9 | Pinegrow | Desktop builder | Build → static/WP/Tailwind | $12/mo or $99/yr or $149 perpetual | Long-running indie |
| 10 | TeleportHQ | Visual builder + codegen | Build/Figma → React/Next.js/Vue/Nuxt/Angular/HTML | Free publish; $9/editor/mo | AppSumo-tier marketing |
| 11 | Udesly Nexus | Plugin/converter | Webflow → Shopify/WP/JAMstack/Ghost | Free convert; $15.99/mo license; $199 templates | ~3K customers historically |
| 12 | WeWeb | Visual builder + codegen | Build → Vue.js SPA | $16/mo Essential | Active in no-code |
| 13 | unframer (OSS CLI) | OSS converter | Framer components → React (.js) for Next/Remix/Vite/Astro | Free MIT-ish | 210+ GH stars |
| 14 | React Export plugin | Framer marketplace | Framer → React | $50/mo hobby / $250/mo commercial | Same author as unframer |
| 15 | Framer Export (letaiworkforme.com) | Productized one-shot | Framer → static zip | $14.99 one-time | Indie/founder-built; recent IH attention |
| 16 | ConvertFramer | DIY tool + DFY service | Framer → static / React+Next / human migration | Free → Automated (private) → Production 7-10 days | Active blog SEO |
| 17 | BrowserCat Migrate | API-driven | Webflow/Wix/Squarespace/Framer → Astro/Next.js/static/GitHub | Credit-based (not on landing) | Real product with real eng content |
| 18 | MigrateLab | DFY agency | Webflow → Next.js/Astro/Payload/Sanity | $1.5K starter / $3.5K growth / $5-10K scale | "Every week", 50+ migrations since '23 |
| 19 | Lucky Media | DFY agency | Webflow → Astro | Custom $5K+ | Official Astro Partner |
| 20 | Flow Ninja | Webflow agency (reverse) | WP/Wix/Squarespace → Webflow | $30K min, $45K Transform, $6K/mo retainer 12mo | 51 Clutch reviews |
| 21 | Edgar Allan | Webflow agency | Design → Webflow | Custom mid-six-figure | ~40 employees, 800+ projects |
| 22-26 | Fiverr top-rated sellers | Marketplace gigs | Various | $80-$287; $500-$2K full | Top-Rated badges |
| 27 | v0 by Vercel | AI coding agent | Prompt/Figma → React+shadcn/ui+Next.js | Free $5/mo → $20/mo Premium → $30/user Team | Vercel-owned, massive distribution |
| 28 | Lovable | AI app builder | Prompt → full-stack React+Supabase | $20/mo Starter; GH export | One of fastest-growing AI builders 2026 |
| 29 | Bolt.new (StackBlitz) | AI app builder | Prompt → full-stack web app | Free 1M tokens; $20/mo for 10M | StackBlitz brand; OSS Bolt.diy fork |
| 30 | Bolt DIY | OSS self-hosted | Prompt → app | Free OSS + your compute | OSS community |
| 31 | AI Website Cloner Template (JCodesMore) | OSS Claude/Cursor skill | Any URL → Next.js | Free + AI tokens | **~13,000 stars in 6 weeks** — best signal in dataset |
| 32 | ToStatic | Free Chrome ext | Framer/Wix/Webflow/Squarespace/Notion → static zip | Free 1 project / 5 page exports / 3 daily; paid tiers | PH traction |
| 33 | ExFlow | Browser exporter | Webflow/Squarespace/Framer → ZIP/FTP/S3/Git | $5.99-15.99/mo; free tier | Indie freemium |
| 34 | NoCodeXport | Free web tool | Webflow → static HTML | $97/site or $197 lifetime | Niche utility |
| 35 | josh-may/webflow-to-nextjs | OSS | Webflow → Next.js | Free MIT-ish | Single-author OSS |
| 36 | persephonepunch/starter-next | OSS template | Webflow design components → Next.js | Free | Tiny repo |
| 37 | Astro WP migration | Official guide | WordPress → Astro | Free | Astro is ascendant (50K+ stars) |
| 38 | Eleventy `@11ty/import` | Official OSS migrator | WordPress → Eleventy markdown | Free | Eleventy widely loved |
| 39 | Hugo migration tools | OSS collection | Various CMS → Hugo markdown | Free | Hugo: 75K+ stars |
| 40 | FocusReactive / Sanity partners | DFY agencies (headless) | Webflow → Next.js+Sanity/Payload | Custom mid-five-figure | Ramp.com case study |

### Six structural buckets

- **A. Platform-native exporters**: half-broken on purpose; subscription tax to leave
- **B. AI Figma → code**: assume Figma is source-of-truth, not live URL
- **C. DIY static scrapers**: dead static HTML; no editor path
- **D. Visual builders w/ code export**: build-new only, no URL ingest
- **E. DFY agencies/freelancers**: $80-50K spread; gap in $300-1,500
- **F. AI coding agents (adjacent)**: positioned as "build new", productization gap for non-coders

### White space (3 gaps)

1. **$99-$799 productized DFY band** — empty
2. **"Cancel-your-subscription" framing** with explicit cost math — owned by no one
3. **Chat-driven editor on real code** — single biggest unmet need

### Threats (likely order of risk)

1. Vercel (v0)
2. Builder.io Visual Copilot
3. Lovable
4. AI Website Cloner Template author productizing
5. Anima pivoting from Figma-source to URL-source
6. MigrateLab + ConvertFramer combining
7. Webflow / Framer themselves cutting export prices

---

## Part 2 — SEO Keyword Roadmap (84 queries, 15 winnable)

### Top 15 winnable queries (the content roadmap)

| Rank | Query | Volume | Difficulty | Why |
|---|---|---|---|---|
| 1 | webflow to nextjs | M | M | Highest commercial intent. 3 vendors monetizing — proof of demand. |
| 2 | framer to nextjs | M | M | Framer's *zero* official export means the searcher arrives pre-frustrated |
| 3 | convert framer to code | M | M | Generic "to code" captures stack-agnostic searchers |
| 4 | webflow too expensive | M | M | Top-of-funnel anger; cost calculator captures them |
| 5 | wix to nextjs | L | L | Wix lock-in is worst; SERP wide open |
| 6 | framer alternative self-hosted | L | L | Highest-intent qualifier |
| 7 | vibe coded website / replace webflow with cursor | L | L | Emerging term, no incumbent |
| 8 | webflow vs framer vs nextjs | L | L | Triple-comparison nobody owns |
| 9 | webflow vs self hosting | L | L | Direct comparison; SERP empty |
| 10 | how much does webflow really cost / hidden costs | L | L | Pair with calculator → backlink magnet |
| 11 | can you export framer code / framer export limitations | M | L | Framer help page literally says "no" — write the canonical answer |
| 12 | webflow lock in | L | L | One viral essay carries you for years |
| 13 | host webflow site for free | L | L | "Or just rebuild on Next.js + Cloudflare" |
| 14 | squarespace to nextjs | L | L | Sparse SERP, easy to crack |
| 15 | leave webflow / cancel webflow subscription | L-M | M | Bottom-of-funnel transactional |

Volume: L<100/mo, M 100-1K/mo, H 1K-10K/mo, XH 10K+/mo (US, ordinal estimates without paid tools).

### Content angles for top 5

1. **webflow to nextjs**: interactive 36-month TCO calculator + 14-day day-by-day playbook with screenshots
2. **framer to nextjs**: "There is no export — here's the rebuild loop with Cursor/Claude Code" + embedded screencast
3. **convert framer to code**: tool comparison matrix (ConvertFramer vs Unframer vs DIY vs Service)
4. **webflow too expensive**: 3-year TCO calculator with shareable URL hash — viral piece
5. **wix to nextjs**: free Wix-to-Next.js scraper as lead magnet + lock-in story

### Reddit/community distribution targets

High-priority threads (active or recent, ICP density high):
- HN: "WTF Is Wrong with Webflow?" (id=41005904)
- HN: "Will it ever be possible to export the code (Framer playbook)?" (id=41436883)
- HN: "Webflow has zero lock-in" counter-take (id=27318176)
- HN: Show HN — Webflow-Exporter (id=38931527)
- HN: Show HN — Copy-Paste from Webflow into Webstudio (id=41220775)
- Webflow Forum: "Given up on webflow hosting" (t/38906)
- Webflow Forum: "Has Webflow become too expensive to be viable?" (t/326706)
- Webflow Forum: "The High Cost of WebFlow" (t/232093)
- Indie Hackers: "Any alternatives to Webflow CMS?"
- Indie Hackers: "Why I chose to avoid Webflow"

Framer-specific:
- framer.community/c/support/expensive
- framer.community/c/support/is-framer-s-pricing-a-joke
- framer.community/c/support/self-hosting
- framer.community/c/developers/framer-to-react-code
- framer.community/c/support/framer-s-cms-10-000-items-limit

### Notable signals

- **Framer's official help page literally says you cannot self-host.** Cite this URL in every Framer piece: framer.com/help/articles/can-i-export-my-website-to-html-and-self-host-it/
- **Webflow pricing changes documented as "more confusing in 2025."** Bandwidth overages auto-upgrade plan ($25 → $170/mo reported). Forms cost $1 per 100 submissions on free plan. CMS caps at 2,000 items.
- **Vibe-coding is a real keyword tide.** YouTube "We replaced our Webflow site with vibe coding" + Modulify "Vibe Coding Explained: Why It's Replacing No-Code" — narrative is 12-18 months old, growing.
- **Webstudio is the closest competitor in positioning** (open-source, self-host anywhere). Differentiator: "we give you raw Next.js, not another runtime."
- **Webflow DevLink** is a half-measure that disappoints power users — angle: "Why DevLink isn't enough."

---

## Part 3 — Demand Signals + Channel Map

### Reddit r/Framer — top quotes (last 12 months)

- **"Why is Framer so expensive?"** — 45 upvotes, 81 comments — *"Paying a relatively high monthly fee just to keep a site live feels excessive."*
- **"Can we address Framer's new pricing?"** — 113 upvotes, 58 comments, Oct 2025 — *"Framer pretty much killed itself in a time where I was already considering dropping it for my agency."*
- **"Framer nailed the UI, but it priced itself out of the market."** — 69 upvotes, 62 comments — *"Webflow: $59/month. Framer: $256/month for the same use case. 4x cost."*
- **"Searching for Framer Alternatives after recent Price Changes"** — 42 upvotes — *"15 clients on framer right now... costs will increase 400%. Lose more than half my clients."*
- **"Framer just killed my agency margins. Alternatives?"** — 23 upvotes — *"My clients are on Scale now and I'm eating the cost since I quoted them before the hike."*
- **"Framer is amazing… but the vendor lock-in is killing me."** — 24 upvotes — describes Neal's product: *"I'd happily pay extra to keep it in my stack long-term if they loosened the walls just a bit."*
- **"I found a way to cut framer costs to almost $0 - unframer, react export plugin"** — 34 upvotes — OP describes Neal's exact business model
- **"I'm not paying $30 extra just for robots.txt and redirects."** — 67 upvotes
- **"Looking for a cheaper framer alternative"** — 15 upvotes, 31 comments

### Reddit r/webflow

- **"Considering moving away from Webflow"** — 25 upvotes, 57 comments — comment chain has 6+ active migrators; MigrateLab founder pitched in this thread
- **"Why does Webflow make hosting so EXPENSIVE and DIFFICULT?"** — 20 upvotes
- **"Webflow charged $1,189 for bandwidth"** — 69 upvotes — *"$440/month for a one-pager. Considering switching from webflow to wordpress."*
- **"Client Seats and Pricing Update: Webflow just made pricing so much worse"** — 56 upvotes — *"Removing my remaining three sites off this platform."*
- **"Another webflow outage like every few months"** — 35 upvotes
- **"Where Is Webflow Headed Long Term? Can Webflow Survive AI Era?"** — 17 upvotes, 47 comments

### Counter-signal (defines the wedge)

**r/nextjs "Built our marketing site in Next.js… but starting to regret it as a growth team"** — 49 upvotes, 78 comments. OP is a marketer who got moved off Framer/Webflow onto bare Next.js. Deployments now go through engineering. Bare Next.js fails marketing teams without an editor. **The chat-based editor is what closes this loop.**

### HN

- **"WTF Is Wrong with Webflow?"** — Failory founder's $468 → $15,000 viral tweet — *"They're forcing me to pay $15,000/year, up from $468!"*
- **"Framer still worth in 2026? $30/M for a simple website is mad"**
- **"Webflow Down for >31 Hours"** — *"After switching to native development, we massively increased conversion rates"* (from a $10M/mo operator)
- **"Show HN: Open-sourced Webflow for your own app" (Onlook)** — 227 points — proves developer audience appetite for visual-editing-on-real-code

### Webflow Forum

- **"The High Cost of WebFlow"** — *"clients asking why they would pay $29/mo for a website when WordPress is free"*
- **"Will Webflow's 2025 Pricing Changes Push Freelancers Out?"** — Graham Barr: *"Utter greed."*; Hans Gijsbers: *"Webflow is leaving small users out in the cold."*
- **"Has Webflow become too expensive to be viable?"** — *"Webflow is too expensive for clients and I lose jobs because of it."*

### YouTube — demand through views

| Title | Views |
|---|---|
| Designers Are Leaving Webflow… Here's Why | 234K |
| Did Framer Just Kill Figma + Relume + Webflow? | 79K |
| Figma to Webflow using Claude MCP | 30K |
| Framer Just Got WAY Too Expensive 💸 | 18K |
| Migrating Your Website to Webflow + FREE CHECKLIST | 15K |
| FRAMER IS DEAD - (framer pricing update goes wrong) | 11K |
| WHEN to USE (and AVOID) Webflow in 2025 | 8.5K |
| Webflow and Framer have an AI Problem | 5.9K |
| Easily Migrate ANY Webflow Site To Code (Claude Code & Vercel) | 226 (3 wks ago — supply hasn't caught up) |

### Existing competitors / commercial validation

| Player | Offer | Price | Volume signal |
|---|---|---|---|
| MigrateLab | Webflow→Next.js DFY | $5K-25K typical | "Every week", 50+ since 2023 |
| Shadow Digital | Webflow migrations (mostly into) | $35K-60K, 8-12 weeks | 60+ projects in 5 years |
| NoCodeXport | Self-serve site export | $97/site, $197 lifetime | active product |
| unframer (OSS) | Framer→React component | free | 214 GH stars |
| FramerExport | Framer→code | $14.99/site | competing on price |
| Webstudio | OSS Webflow alt | free OSS / hosted | top recommendation in every Reddit migration thread |

Multiple paid offerings = validated WTP. None combine **(a)** DFY migration + **(b)** AI-chat-based ongoing editing.

### Marketing channel map (1-5 scoring)

| Channel | Reach | Cost | Speed | Scale | Neal-fit | Verdict |
|---|---|---|---|---|---|---|
| SEO blog | 5 | 5 | 1 | 5 | 4 | **WORK** — 6-12mo payoff, but the moat |
| YouTube | 5 | 5 | 2 | 5 | 3 | **HIGHEST TRUST CHANNEL** — partner with creator |
| Reddit organic | 5 | 5 | 5 | 2 | 4 | **WORK if patient** — best week-1 channel |
| Twitter X build-in-public | 4 | 5 | 3 | 4 | 3 | Slow ramp |
| IndieHackers | 3 | 5 | 4 | 2 | 4 | Worthwhile but small |
| Webflow/Framer forums | 5 | 5 | 5 | 2 | 4 | **WORK** — highest-intent free channel |
| Cold email Webflow operators | 5 | 4 | 4 | 4 | 5 | **WORK — Neal's strength** |
| Cold email Framer operators | 5 | 4 | 4 | 4 | 5 | **WORK — strongest 30-day channel** |
| Product Hunt | 3 | 5 | 4 | 1 | 3 | One spike |
| HN Show | 4 | 5 | 4 | 2 | 4 | **WORTH ONE BIG SHOT** |
| Affiliate via Vercel/Cloudflare creators | 4 | 4 | 2 | 5 | 3 | Slow but compounds |
| Google Ads migration intent | 4 | 2 | 5 | 4 | 4 | $5K test, $300-800 CAC |
| Reddit ads | 3 | 3 | 4 | 4 | 3 | Yes; skip Meta |
| Partnerships with web designers | 5 | 4 | 3 | 4 | 4 | **VERY HIGH FIT** |

### Three sharpened ICPs

**A. Squeezed Agency Owner (highest urgency)** — 1-5 person agency, $200K-1M revenue, 10-50 client sites. Margin literally negative after Oct 2025 Framer pricing. Pays $1.5K-5K/site + $99-299/mo retainer. Marks up 2-3x to client. 15 sites = $22-75K migration TCV + $18-54K/yr ARR.

**B. Founder Burned by Pricing Hike** — indie/bootstrapped, content-heavy site. Just got an enterprise quote/overage bill/outage. Pays $3K-8K turnkey. High LTV.

**C. B2B SaaS w/ Dev Team** — Series A-B SaaS, has Next.js eng but marketing site on Webflow. Trigger: Lighthouse <80 / AEO requires SSR / CMS limits. Pays $15-50K + $500-2K/mo retainer.

### Distribution week-1 punchlist (specific URLs)

1. r/Framer "Framer just killed my agency margins" — direct ICP A
2. r/Framer "Searching for Framer Alternatives after recent Price Changes" — OP has 15 client sites churning
3. r/webflow "Considering moving away from Webflow" — 6 active migrators in comments
4. r/Framer "Looking for a cheaper framer alternative" — easy first comment
5. r/Framer "Framer is amazing… but the vendor lock-in is killing me" — describes the product
6. Webflow Forum "The High Cost of WebFlow"
7. Webflow Forum "Will Webflow's 2025 Pricing Changes Push Freelancers Out?" — named freelancers (Graham Barr, Hans Gijsbers) → public LinkedIn outreach
8. YouTube comments under "Framer Just Got WAY Too Expensive" (18K), "FRAMER IS DEAD" (11K), "Designers Are Leaving Webflow" (234K)
9. Reply to Nico Cerdeira's $15K Webflow tweet (Failory; ICP B audience)
10. Scrape 500 each of `*.framer.website` and Webflow-badge sites via PublicWWW; Apollo-enrich; send 3-step sequence with computed personalized 3-year TCO

### Key findings

- Demand is loud + current. Framer's Oct 2025 + Webflow's late-2024 pricing is still bleeding in real-time.
- Existing migration agencies prove WTP at $5-60K/migration. Neal differentiates, doesn't compete on "we move you."
- **Wedge is the AI-chatbot editor** — r/nextjs counter-signal proves bare Next.js fails growth teams.
- YouTube + SEO have 6-12mo payoff but huge long tail — almost no high-quality "leaving Framer/Webflow" content from a credible operator yet.
- Cold email + Reddit/Forum are week-1 wedge — Neal's Z Cyber outreach skills transfer 1:1.
- Pricing the market accepts: agencies $1.5-5K/site + $99-299/mo; founders $3-8K turnkey; B2B SaaS $15-50K + retainer.
- Counter-positioning headlines from real pain language: *"Keep editing your site like Framer. Pay like Vercel."* / *"Stop paying $300/mo to host a static page."* / *"Your Framer site, owned, in 7 days."*
