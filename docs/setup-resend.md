# Setting up Resend (no new account, no new bill)

You already have a personal Resend account for Z-Cyber. We're reusing it. **Don't create a new account, don't touch the Laniakea/VedasAI Resend.**

Resend's free tier (3,000 emails/month, 100/day) covers many domains on a single account. Eject piggybacks on your existing Z-Cyber Resend; the 3K/month is shared, but Eject will use ~50–500 emails/month for the foreseeable future.

## 1. Add `eject.co` as a verified domain on your Z-Cyber Resend account

Once `eject.co` is registered:

1. Go to [resend.com](https://resend.com) → log into your **personal Z-Cyber account**.
2. **Domains** → **Add Domain** → `eject.co`.
3. Resend gives you 3 DNS records (SPF, DKIM, DMARC). Add them at your registrar.
4. Wait 5–30 min for verification. The Domains list shows ✓ when ready.

**Why a separate domain instead of just sending from your existing one:** customers seeing `from: hi@z-cyber.com` for an Eject migration is confusing. Branded sending domains also have higher deliverability.

## 2. Drop the Resend API key into Vercel

Use your existing Z-Cyber Resend API key. If you don't have it handy:

1. Resend → **API Keys** → either reuse an existing key or create one named "Eject".
2. Copy the `re_…` value.
3. In Vercel: project → **Settings** → **Environment Variables** → add:
   ```
   RESEND_API_KEY=re_…
   RESEND_FROM=Eject <hi@eject.co>
   ```
   (Leave `RESEND_FROM` blank until the domain is verified. Until then, mail sends from `onboarding@resend.dev` with `Reply-To: hi@eject.co`.)

## 3. Forward `hi@eject.co` → `neal@laniakea.design` (free)

Resend only sends. We need a way to *receive* customer replies without setting up a real mailbox. **Cloudflare Email Routing** does this for free.

If `eject.co` is registered through Cloudflare Registrar (recommended), this is built in. If through another registrar, point the nameservers at Cloudflare first.

1. Cloudflare dashboard → pick `eject.co` → **Email** → **Email Routing**.
2. Click **Get started**. Cloudflare auto-adds the MX + TXT records.
3. **Routes** → **Create address** → `hi@eject.co` → **Send to** → `neal@laniakea.design` → save.
4. Add a wildcard rule too: `*@eject.co` → `neal@laniakea.design`. Catches typos like `info@eject.co`, `support@eject.co`.
5. Verify your destination email (`neal@laniakea.design`) by clicking the link Cloudflare sends.

That's it. Customer hits "reply" on a kickoff email → goes to `hi@eject.co` → Cloudflare forwards instantly → lands in your Laniakea inbox. No new mailbox, no Gmail forwarding rules to maintain.

## 4. Test it

With `RESEND_API_KEY` set:

```bash
# Run a Stripe test checkout end-to-end (test card 4242 4242 4242 4242).
# After payment, /checkout/success calls /api/checkout/finalize, which sends
# the kickoff email via Resend.
```

Check the inbox of the email you used at Stripe checkout. If you reply to that email, it should land in `neal@laniakea.design` within seconds (assuming step 3 is done).

## What we send

Two templates in `lib/email.ts`:

- **Express kickoff** — sets expectations for the 24–48 hour preview link.
- **Concierge kickoff** — promises a personal email within 24h.

Both are plain-text + HTML. Edit copy/tone in that file.

The `Reply-To` header is set to `siteConfig.email` (which is `hi@eject.co`). With Cloudflare Email Routing pointing `hi@eject.co` to `neal@laniakea.design`, you handle support from your Laniakea inbox without exposing it to customers.

## Cost

$0/month. Resend's free tier (3K emails/mo, 100/day) covers this for the first ~1,500 customers/month. Cloudflare Email Routing is free with no limit. Domain verification is free. Total new monthly Resend bill: $0.
