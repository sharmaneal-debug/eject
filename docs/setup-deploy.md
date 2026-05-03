# Deploying Eject

The repo is already configured for **Cloudflare Pages** via `@cloudflare/next-on-pages`. Vercel works as a fallback if you'd rather skip the Cloudflare step.

## Option A — Cloudflare Pages (recommended)

Free tier: unlimited bandwidth, 500 builds/month, 100K function invocations/day. No card required.

### 1. Connect the GitHub repo

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) and sign in (or sign up — free).
2. **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Authorize Cloudflare to read your GitHub.
4. Pick the `sharmaneal-debug/eject` repo.

### 2. Build settings

When Cloudflare asks for build settings, paste these exactly:

| Setting | Value |
|---|---|
| Framework preset | None |
| Build command | `npx @cloudflare/next-on-pages` |
| Build output directory | `.vercel/output/static` |
| Root directory | (blank) |
| Node version | 20 |

Then under **Environment variables** → **Add variable** for each:

```
STRIPE_SECRET_KEY=sk_test_…   (paste from your .env.local)
STRIPE_PUBLISHABLE_KEY=pk_test_…
STRIPE_PRICE_EXPRESS=price_1TT5zeEvFNp7ngVQjHGd0jOi
STRIPE_PRICE_CONCIERGE=price_1TT5zfEvFNp7ngVQEzTcQTQR
RESEND_API_KEY=                (add once you've signed up — see docs/setup-resend.md)
RESEND_FROM=                   (leave blank for now)
NEXT_PUBLIC_SITE_URL=https://eject.pages.dev
```

Under **Settings** → **Functions** → **Compatibility flags** → add `nodejs_compat` (the `wrangler.toml` in the repo also declares this, but the dashboard sometimes needs it set explicitly).

### 3. Deploy

Click **Save and Deploy**. First build takes ~3 minutes. Cloudflare gives you a `eject.pages.dev` URL.

### 4. (Later) Custom domain

When `eject.co` is registered:

1. **Custom domains** → **Set up a custom domain** → enter `eject.co`.
2. Cloudflare gives you 2 DNS records (or transfers nameservers if your registrar is also Cloudflare).
3. Update `NEXT_PUBLIC_SITE_URL=https://eject.co` and re-deploy.

### 5. Auto-deploy on push

Already wired. Every push to `main` on the GitHub repo triggers a new Cloudflare Pages deploy.

---

## Option B — Vercel (alternative, also free)

Vercel is the original Next.js host. Native support, zero config, slightly stricter free-tier bandwidth limits than Cloudflare (100GB/mo vs unlimited).

### 1. Connect

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. **Add New** → **Project** → import `sharmaneal-debug/eject`.

### 2. Settings

Vercel auto-detects Next.js. No config needed. Just paste the same environment variables:

```
STRIPE_SECRET_KEY=sk_test_…
STRIPE_PUBLISHABLE_KEY=pk_test_…
STRIPE_PRICE_EXPRESS=price_1TT5zeEvFNp7ngVQjHGd0jOi
STRIPE_PRICE_CONCIERGE=price_1TT5zfEvFNp7ngVQEzTcQTQR
RESEND_API_KEY=
RESEND_FROM=
NEXT_PUBLIC_SITE_URL=https://eject.vercel.app
```

### 3. Deploy

Click **Deploy**. ~90 seconds. URL: `eject.vercel.app`.

---

## Verifying the deploy

Once live, smoke-test in this order:

1. **Homepage loads** — visit the deployed URL. Hero, calculator, AI Kit section all render.
2. **Scan API works** — paste any Webflow/Framer URL into the hero. You should see the platform detected, page count, cost in 1–2 seconds.
3. **Checkout works** — click any pricing tier → fills the checkout form → click "Continue to payment" → redirects to Stripe Checkout.
4. **Test card** — use `4242 4242 4242 4242`, any future expiry, any CVC, any zip. Stripe shows the success URL.
5. **Kickoff email lands** (only if `RESEND_API_KEY` is set) — check the inbox of the email you used at checkout. Email arrives within ~30s.

If any step fails, check the deploy logs:
- Cloudflare: **Workers & Pages** → **eject** → **Deployment** → **View build log** + **Functions** → **Real-time logs**
- Vercel: project → **Deployments** → latest → **Function Logs**

## Cost reality check

| Component | Free tier | When you'd hit it |
|---|---|---|
| Cloudflare Pages | Unlimited bandwidth, 500 builds/mo, 100K function invocations/day | 100K+ daily site visitors, OR pushing >16x/day |
| Vercel Hobby | 100 GB bandwidth/mo, 100 builds/day | ~30K daily visitors |
| Stripe | 2.9% + 30¢ per transaction. No monthly fee. | Always |
| Resend | 3K emails/mo, 100/day | 1.5K customers/mo |
| Anthropic API | Pay-as-you-go | $0.65 per typical migration |

For the first 1,000 customers, **everything stays free** except Anthropic API and Stripe transaction fees. See `docs/unit-economics.md` for the full breakdown.

## When something breaks

The most common deploy failure: missing environment variable. The error in the deploy log will say `STRIPE_PRICE_EXPRESS is not set` or similar. Add it in the dashboard, redeploy.

The second most common: Cloudflare Pages timeouts during build. Workaround: pin the build to Node 20 (already done in the build settings above).
