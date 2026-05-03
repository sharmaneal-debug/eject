# Setting up Resend (free, no card)

This is **separate from any Resend account you have for Ztek or other projects**. Eject gets its own Resend account so the sending domain, API keys, and quotas are isolated.

## 1. Sign up

Go to [resend.com](https://resend.com) and sign up with whatever email you want associated with Eject (e.g., a personal Gmail or `hi@eject.co` once you have it). **Use a different email than your Ztek Resend** so they're cleanly separated.

Free tier: 3,000 emails/month, 100/day, 1 verified domain. No credit card required.

## 2. Get an API key

After signup → **API Keys** → **Create API Key** → name it "Eject" → copy the `re_…` key.

## 3. Drop it in `.env.local`

```
RESEND_API_KEY=re_...
RESEND_FROM=
```

Leave `RESEND_FROM` blank for now. Until your domain is verified, we'll send from Resend's default address (`onboarding@resend.dev`). That sender is verified by Resend so emails go through; the `Reply-To` header is set to `hi@eject.co` so customer replies still come to you.

## 4. (Later) Verify your domain

Once `eject.co` is registered:

1. In Resend → **Domains** → **Add Domain** → `eject.co`
2. Resend gives you 3 DNS records (SPF, DKIM, DMARC). Add them at your registrar.
3. Wait 5–30 min for verification.
4. Set `RESEND_FROM=Eject <hi@eject.co>` in `.env.local` and `.env.production`.
5. Now your emails come from `hi@eject.co` instead of `onboarding@resend.dev`. Better deliverability and customer trust.

## 5. Test it

With `RESEND_API_KEY` set in `.env.local`, restart `pnpm dev`. Then either:

- Run a Stripe test checkout end to end (test card `4242 4242 4242 4242`). After payment, the success page calls `/api/checkout/finalize`, which verifies the Stripe session is paid and sends the kickoff email.
- Or hit the API directly:

```bash
curl -X POST http://localhost:3000/api/checkout/finalize \
  -H 'Content-Type: application/json' \
  -d '{"sessionId":"cs_test_..."}'
```

A successful response: `{"ok":true,"sent":true,"tier":"express","email":"jo***@example.com"}`

The email will land in the inbox of whatever email you used at Stripe checkout. Check spam if you don't see it within 30 seconds.

## What we send

Two templates, in `lib/email.ts`:

- **Express kickoff** — sent after a $49 Express payment. Sets expectations for the 24–48 hour preview link, mentions the AI editing kit, asks them to reply with context.
- **Concierge kickoff** — sent after a $299 Concierge payment. Promises a personal reply within 24h asking for context, then a 7-day timeline.

Edit copy/tone in `lib/email.ts`. Both templates have plain-text and HTML versions.

## Cost

Resend free tier: $0/mo until you exceed 3,000 emails/month. At 1,500 customers/month (assuming 2 emails each), you're at 3,000 — exactly the cap. Above that, Resend Pro is $20/mo for 50,000 emails. Per-email cost: $0.0004. Negligible.
