// Lead capture: posts to a Google Sheets webhook (Apps Script web app).
// Setup walkthrough: docs/setup-leads.md
//
// One env var: LEADS_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
//
// We POST a single JSON payload with `event` + `data`. The Apps Script picks
// the right sheet tab based on `event` and appends a row.
//
// All calls are fire-and-forget: if the webhook is missing or fails, the
// caller still succeeds. Lead capture is best-effort. We don't want a Sheets
// outage blocking checkout or scans.

import { siteConfig } from "./site";

export type LeadEvent =
 | "scan_completed"
 | "intake_submitted"
 | "checkout_started"
 | "checkout_paid"
 | "newsletter_signup";

export type LeadPayload = {
 event: LeadEvent;
 data: Record<string, unknown>;
 source?: string;
 ts?: string;
};

export async function logLead(payload: LeadPayload): Promise<void> {
 const url = process.env.LEADS_WEBHOOK_URL;
 if (!url) {
 // Not configured yet. Log locally so we can see it in Vercel function logs.
 console.log("[leads]", JSON.stringify(payload));
 return;
 }

 const body: LeadPayload = {
...payload,
 source: payload.source ?? siteConfig.url,
 ts: payload.ts ?? new Date().toISOString(),
 };

 try {
 // Apps Script web apps reject preflight unless we use a "simple" request.
 // text/plain content-type avoids the OPTIONS round-trip; the Apps Script
 // parses the body as JSON regardless.
 await fetch(url, {
 method: "POST",
 headers: { "Content-Type": "text/plain;charset=utf-8" },
 body: JSON.stringify(body),
 // Cap the budget so a slow Sheets webhook doesn't slow down our APIs.
 signal: AbortSignal.timeout(3500),
 });
 } catch (err) {
 console.warn("[leads] failed:", (err as Error).message);
 }
}
