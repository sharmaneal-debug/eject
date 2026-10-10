# Renewal watch storage

Renewal subscriptions and captured leads are JSON documents, not a database.

**Production choice: Vercel Blob.** When `BLOB_READ_WRITE_TOKEN` is set, each collection is one private blob:

- `eject/renewal-subscriptions.json`
- `eject/leads.json`
- `eject/events.json`

Blob is durable across Vercel instances. The app uses `@vercel/blob` with `access: "private"`, a stable pathname, and overwrite. The token is an environment variable. It is never written into the repo.

**Fallback:** if the token is absent, the same JSON is written under `DURABLE_STORE_DIR` or `.data/` in the project. That is for local development and tests. If that directory is not writable, the process keeps the JSON in memory and the API responds with `persisted: false`. Memory is not durable. Do not treat a memory write as a saved subscription.

Reminders run from `GET /api/cron/renewal-reminders` (daily, 14:00 UTC, `vercel.json`). The route sends nothing unless both `CRON_SECRET` and `RESEND_API_KEY` are set. Missing `RESEND_API_KEY` is a no-op inside `sendEmail` as well. The sender is `RESEND_FROM`, otherwise `Eject <onboarding@resend.dev>`.

Unsubscribe is a token link to `/renewal-watch/unsubscribe`. Confirming it sets `status` to `unsubscribed`. The cron skips those rows.
