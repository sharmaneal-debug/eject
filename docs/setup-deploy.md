# Deploying Eject

Eject deploys to **Vercel** (free Hobby tier, no card required, native Next.js support).

## 3-minute setup

### 1. Connect the GitHub repo

1. Go to [vercel.com](https://vercel.com) → **Sign in with GitHub** (use the same account that owns `sharmaneal-debug/eject`).
2. Dashboard → **Add New** → **Project** → import `sharmaneal-debug/eject`.
3. Vercel auto-detects Next.js. **Don't change any framework settings.**

### 2. Environment variables

Before clicking Deploy, expand **Environment Variables** and paste these (copy from your local `~/code/eject/.env.local`):

```
STRIPE_SECRET_KEY=sk_test_…
STRIPE_PUBLISHABLE_KEY=pk_test_…
STRIPE_PRICE_EXPRESS=price_1TT5zeEvFNp7ngVQjHGd0jOi
STRIPE_PRICE_CONCIERGE=price_1TT5zfEvFNp7ngVQEzTcQTQR
RESEND_API_KEY=                      (paste once you've signed up — see docs/setup-resend.md)
RESEND_FROM=                         (leave blank for now)
NEXT_PUBLIC_SITE_URL=https://eject.vercel.app
```

Tick all three environments (Production, Preview, Development) for each.

### 3. Deploy

Click **Deploy**. ~90 seconds. Live at `https://eject.vercel.app` (or whatever Vercel auto-names it; you can rename in **Project Settings** → **Domains**).

### 4. (Once you have it) Custom domain

When `ejectfrom.com` is registered:

1. Vercel project → **Settings** → **Domains** → **Add** → `ejectfrom.com`.
2. Vercel gives you 2 DNS records (A + CNAME, or just nameserver delegation if your registrar supports it).
3. Add the records at your registrar (Namecheap, Cloudflare Registrar, etc.).
4. Wait 5–30 min for DNS propagation. Vercel auto-issues SSL.
5. Update `NEXT_PUBLIC_SITE_URL=https://ejectfrom.com` in Vercel env vars and redeploy.

### 5. Auto-deploy on push

Already wired. Every push to `main` triggers a Vercel deploy. Branch pushes get preview URLs.

---

## Verifying the deploy

Once live:

1. **Homepage loads** — visit the deployed URL.
2. **Scan API works** — paste a Webflow / Framer URL. Platform detected, page count, cost in 1–2 seconds.
3. **Checkout works** — pick a tier → fill the form → continue to payment. Test card `4242 4242 4242 4242`, any future date, any CVC.
4. **Success page renders** at `/checkout/success?session_id=…`.
5. **Kickoff email lands** (if `RESEND_API_KEY` is set). Check the inbox of the email used at checkout. Within ~30s.

If anything fails, check **Project** → **Deployments** → latest → **Function Logs**.

## Cost reality check

Vercel Hobby tier:
- 100 GB bandwidth / month
- 100 builds / day
- Custom domain free
- No credit card required

You'll hit Hobby limits at roughly 30K daily site visitors, which is a great problem to have. Vercel Pro is $20/mo if you outgrow it. See `docs/unit-economics.md` for the full cost picture per customer.
