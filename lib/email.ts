// Resend email client. Optional at build time so the site renders without keys.
// Free tier: 3,000 emails/month, 100/day, 1 verified domain.
// Setup steps in docs/setup-resend.md.

import { siteConfig } from "./site";

type SendArgs = {
 to: string;
 subject: string;
 html: string;
 text: string;
 // Optional: customer name for personalization in the From line.
 customerName?: string;
};

export async function sendEmail(args: SendArgs): Promise<{ ok: boolean; id?: string; error?: string }> {
 const apiKey = process.env.RESEND_API_KEY;
 if (!apiKey) {
 console.warn("[email] RESEND_API_KEY not set; skipping send to", args.to);
 return { ok: false, error: "resend not configured" };
 }
 // Default to Resend's verified onboarding sender if you haven't verified your
 // own domain yet. Once ejectfrom.com is verified in Resend, set RESEND_FROM in env.
 const from = process.env.RESEND_FROM || "Eject <onboarding@resend.dev>";

 try {
 const res = await fetch("https://api.resend.com/emails", {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 Authorization: `Bearer ${apiKey}`,
 },
 body: JSON.stringify({
 from,
 to: [args.to],
 subject: args.subject,
 html: args.html,
 text: args.text,
 reply_to: siteConfig.email,
 }),
 });
 if (!res.ok) {
 const body = await res.text();
 return { ok: false, error: `resend ${res.status}: ${body.slice(0, 200)}` };
 }
 const data = (await res.json()) as { id?: string };
 return { ok: true, id: data.id };
 } catch (err) {
 return { ok: false, error: (err as Error).message };
 }
}

// ---------- Templates ----------

export function paidLeadNotification(opts: {
  name: string;
  email: string;
  tier: "express" | "concierge";
  siteUrl: string;
  amount: number;
  stripeSessionId?: string;
}) {
  const subject = `New Eject message · ${opts.email}`;
  const text = `New message.

Email:   ${opts.email}
Site:    ${opts.siteUrl || "(none)"}

Eject
${siteConfig.url}
`;
  const html = `<!doctype html>
<html><body style="font-family: ui-sans-serif, system-ui, sans-serif; line-height: 1.6; color: #0B0B0F; max-width: 560px; margin: 0 auto; padding: 24px;">
<p style="font-size: 18px; font-weight: 600;">New message</p>
<p>Email: <a href="mailto:${escape(opts.email)}">${escape(opts.email)}</a></p>
<p>Site: ${escape(opts.siteUrl || "(none)")}</p>
</body></html>`;
  return { subject, text, html, replyTo: opts.email };
}

export async function sendPaidLeadNotification(args: {
  name: string;
  email: string;
  tier: "express" | "concierge";
  siteUrl: string;
  amount: number;
  stripeSessionId?: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "resend not configured" };
  const tpl = paidLeadNotification(args);
  const internalRecipient = process.env.LEAD_NOTIFICATION_TO || siteConfig.email;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "Eject <onboarding@resend.dev>",
        to: [internalRecipient],
        subject: tpl.subject,
        html: tpl.html,
        text: tpl.text,
        reply_to: tpl.replyTo,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `resend ${res.status}: ${body.slice(0, 200)}` };
    }
    const data = (await res.json()) as { id?: string };
    return { ok: true, id: data.id };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export function expressKickoffEmail(opts: { name: string; siteUrl: string }) {
 const subject = "Eject";
 const text = `Launching soon.

Email hi@ejectfrom.com if you need us.
${opts.siteUrl ? `Site: ${opts.siteUrl}` : ""}

${siteConfig.url}
`;
 const html = `<!doctype html>
<html><body style="font-family: ui-sans-serif, system-ui, sans-serif; line-height: 1.6; color: #0B0B0F; max-width: 560px; margin: 0 auto; padding: 24px;">
 <p style="font-size: 18px;">Launching soon.</p>
 <p>Email <a href="mailto:hi@ejectfrom.com" style="color: #0066FF;">hi@ejectfrom.com</a> if you need us.</p>
</body></html>`;

 return { subject, text, html };
}

export function conciergeKickoffEmail(opts: { name: string; siteUrl: string }) {
 const subject = "Eject";
 const text = `Launching soon.

Email hi@ejectfrom.com if you need us.
${opts.siteUrl ? `Site: ${opts.siteUrl}` : ""}

${siteConfig.url}
`;
 const html = `<!doctype html>
<html><body style="font-family: ui-sans-serif, system-ui, sans-serif; line-height: 1.6; color: #0B0B0F; max-width: 560px; margin: 0 auto; padding: 24px;">
 <p style="font-size: 18px;">Launching soon.</p>
 <p>Email <a href="mailto:hi@ejectfrom.com" style="color: #0066FF;">hi@ejectfrom.com</a> if you need us.</p>
</body></html>`;

 return { subject, text, html };
}

function escape(s: string) {
 return String(s ?? "").replace(/[&<>"']/g, (c) => {
 return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!;
 });
}
