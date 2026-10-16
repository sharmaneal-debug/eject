# Go live

Checkout stays closed, and no live charge can start, until the variables below are set on the host. This file lists names only. Do not commit values. This change does not set Vercel env vars and does not change the Stripe dashboard.

`pnpm setup-stripe` still refuses a live secret. Checkout can charge the inline amount without `STRIPE_PRICE_*`. Create live prices in the Stripe dashboard yourself when you want them.

## Stays off until you set variables

- `CHECKOUT_OPEN` is not the exact string `true`: buy buttons stay on the early-access list. Checkout does not create a session.
- A live secret and live webhook events are refused unless `EJECT_STRIPE_MODE` is `live` and `CHECKOUT_OPEN` is `true`. A test secret keeps working without those two.
- Mail is skipped unless `RESEND_API_KEY` and `RESEND_FROM` are both set.
- `/api/cron/deliver-orders` does nothing unless `CRON_SECRET` is set. A wrong bearer is rejected.
- On Vercel, a paid automated order is queued. It is handed to GitHub Actions only when `EJECT_GITHUB_TOKEN` and `GITHUB_REPOSITORY` are set. Until then the queue waits and `/ops` shows the reason.

## Why the crawl does not run inside Vercel

A Vercel function does not have room for this pipeline:

- Playwright's Chromium build is larger than a normal serverless bundle, and it is not installed in the default Node function.
- Hobby functions stop at 10 seconds. Pro defaults to 60 seconds and can be raised (300 seconds, or longer with Fluid). `scripts/crawl.ts` plus `scripts/static-move.ts` plus an optional model rebuild is a multi-minute job that writes a directory. `/tmp` is discarded when the function ends.
- The daily cron (`30 15 * * *`) matches the Hobby rule that a cron runs at most once a day. It is the retry sweeper, not the first attempt.

The closest path that finishes the real crawl is GitHub Actions. The paid webhook (and the cron, for retries) sends `workflow_dispatch` to `.github/workflows/deliver-order.yml`. That job has 30 minutes, installs Chromium, runs the Playwright crawl, runs static-move, runs the model only when LLM credentials are set and the estimate is at or under `EJECT_REBUILD_SPEND_CAP_USD`, zips the site, and emails the customer from `RESEND_FROM` with a notice to `LEAD_NOTIFICATION_TO`. Three failures alert that same address. The workflow needs the KV and Resend names below as GitHub Actions secrets so it can read the order.

Locally, and in the end-to-end test, the same queue runs in-process: HTTP crawl, static package, optional single model call under the cap, Resend. Set `EJECT_DELIVER_RUNNER=inprocess` only if you explicitly want that shorter path on a host.

`/ops` (header `x-ops-token` or `?key=`, value of `OPS_ACCESS_TOKEN`) lists the delivery queue. On Vercel with no KV or Upstash pair it shows a warning that orders would sit in `/tmp`.

## Names to set on Vercel

- CHECKOUT_OPEN
- EJECT_STRIPE_MODE
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- KV_REST_API_URL
- KV_REST_API_TOKEN
- RESEND_API_KEY
- RESEND_FROM
- LEAD_NOTIFICATION_TO
- CRON_SECRET
- EJECT_GITHUB_TOKEN
- GITHUB_REPOSITORY
- OPS_ACCESS_TOKEN
- NEXT_PUBLIC_SITE_URL

Upstash names, if you use that pair instead of the KV_ names:

- UPSTASH_REDIS_REST_URL
- UPSTASH_REDIS_REST_TOKEN

Optional. Empty means test checkout uses an inline amount, the model stays off, and the GitHub ref stays `main`:

- STRIPE_PRICE_AUTOMATED
- STRIPE_PRICE_DONE_FOR_YOU
- STRIPE_PRICE_EXPRESS
- STRIPE_PRICE_CONCIERGE
- EJECT_REBUILD_SPEND_CAP_USD
- LLM_PROVIDER
- LLM_BASE_URL
- LLM_API_KEY
- LLM_MODEL
- ANTHROPIC_API_KEY
- EJECT_GITHUB_REF
- EJECT_DELIVER_RUNNER

## Names to set as GitHub Actions secrets

Same store and mail as Vercel, or the workflow cannot see the order or send mail:

- KV_REST_API_URL
- KV_REST_API_TOKEN
- UPSTASH_REDIS_REST_URL
- UPSTASH_REDIS_REST_TOKEN
- RESEND_API_KEY
- RESEND_FROM
- LEAD_NOTIFICATION_TO
- EJECT_REBUILD_SPEND_CAP_USD
- LLM_PROVIDER
- LLM_BASE_URL
- LLM_API_KEY
- LLM_MODEL
- ANTHROPIC_API_KEY

`EJECT_GITHUB_TOKEN` is only for the Vercel function that dispatches the workflow. It is not a workflow secret.
