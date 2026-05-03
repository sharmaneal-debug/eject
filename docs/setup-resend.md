# Setting up Resend (no new account, no new bill)

You already have a Resend account on your Laniakea workspace (currently used by VedasAI). We're reusing it. **Don't create a new account.**

A single Resend account can hold many verified domains. Eject piggybacks on the Laniakea Resend by adding `ejectfrom.com` as a second sending domain. The 3,000-emails/month free tier is shared across the whole account, but Eject will use ~50–500 emails/month for the foreseeable future, well under whatever VedasAI uses.

**Heads up on inbound:** Resend only *sends* email. Customer replies don't go to your Resend account. We handle inbound separately via Cloudflare Email Routing (step 3 below) — that's what actually puts replies in your `neal@laniakea.design` inbox.

## 1. Add `ejectfrom.com` as a verified sending domain

Once `ejectfrom.com` is registered:

1. Go to [resend.com](https://resend.com) → log into your **Laniakea Resend account**.
2. **Domains** → **Add Domain** → `ejectfrom.com`.
3. Resend gives you 3 DNS records (SPF, DKIM, DMARC). Add them at your registrar (or in Cloudflare DNS if `ejectfrom.com` is on Cloudflare).
4. Wait 5–30 min for verification. The Domains list shows ✓ when ready.

VedasAI's existing domain stays untouched — separate domains on the same account don't interfere.

## 2. Drop the API key into Vercel

Use the same Resend API key you already use for VedasAI, or create a new key tagged "Eject" inside the same account if you want to track usage by project.

1. Resend → **API Keys** → either reuse, or **Create API Key** → name "Eject" → copy the `re_…` value.
2. In Vercel: project → **Settings** → **Environment Variables** → add:
   ```
   RESEND_API_KEY=re_…
   RESEND_FROM=Eject <hi@ejectfrom.com>
   ```
   Leave `RESEND_FROM` blank until `ejectfrom.com` shows ✓ in Resend Domains. Until then, mail sends from `onboarding@resend.dev` with `Reply-To: hi@ejectfrom.com`.

## 3. Forward `hi@ejectfrom.com` → `neal@laniakea.design` (free)

Resend doesn't receive email. We use Cloudflare Email Routing (free) to forward incoming mail to your Laniakea inbox.

If `ejectfrom.com` is registered through Cloudflare Registrar, this is built in. If through another registrar, point the nameservers at Cloudflare first.

1. Cloudflare dashboard → pick `ejectfrom.com` → **Email** → **Email Routing**.
2. Click **Get started**. Cloudflare auto-adds the MX + TXT records.
3. **Routes** → **Create address** → `hi@ejectfrom.com` → **Send to** → `neal@laniakea.design` → save.
4. Add a wildcard rule: `*@ejectfrom.com` → `neal@laniakea.design`. Catches typos like `info@`, `support@`.
5. Verify your destination email by clicking the link Cloudflare sends to `neal@laniakea.design`.

That's it. Customer hits "reply" on a kickoff email → goes to `hi@ejectfrom.com` → Cloudflare forwards instantly → lands in your Laniakea inbox. No new mailbox to monitor.

## 4. Why this clean separation

After this is set up:

| Concern | Where it lives |
|---|---|
| Eject sends emails | Laniakea Resend account, `ejectfrom.com` domain |
| VedasAI sends emails | Laniakea Resend account, VedasAI's domain |
| Eject inbound (replies) | Cloudflare Email Routing → `neal@laniakea.design` |
| Eject monthly bill | $0 (free tier) |
| Risk of confusing the two | None — different `from:` addresses, separate Resend domain analytics |

Resend's dashboard breaks out send volume by domain, so you can see "Eject sent 142 emails this month, VedasAI sent 1,200" without crossing the streams.

## 5. Test it

With `RESEND_API_KEY` set in Vercel:

- Run a Stripe test checkout (test card `4242 4242 4242 4242`) on the deployed site.
- After payment, `/checkout/success` calls `/api/checkout/finalize`, which sends the kickoff email via Resend.
- Check the inbox of the email you used at Stripe checkout. Email arrives within ~30s.
- Reply to that email. It should land in `neal@laniakea.design` within seconds.

## Cost

$0/month. Resend's free tier (3K emails/mo, 100/day) covers this for the first ~1,500 customers/month. Cloudflare Email Routing is free with no limit. Domain verification is free. **Total new bill: $0.**
