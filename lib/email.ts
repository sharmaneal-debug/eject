// Resend email client. Optional at build time so the site renders without keys.
// Free tier: 3,000 emails/month, 100/day, 1 verified domain.
// Setup steps in docs/setup-resend.md.

import { tierConfig, type Tier } from "./pricing";
import { siteConfig } from "./site";

type SendArgs = {
 to: string;
 subject: string;
 html: string;
 text: string;
 // Optional: customer name for personalization in the From line.
 customerName?: string;
};

/** Configured sender. Returns null when RESEND_FROM is unset so we never fall back to onboarding@resend.dev. */
export function resendFromAddress(): string | null {
  const from = process.env.RESEND_FROM?.trim();
  return from || null;
}

export async function sendEmail(args: SendArgs): Promise<{ ok: boolean; id?: string; error?: string; skipped?: boolean }> {
 const apiKey = process.env.RESEND_API_KEY;
 if (!apiKey) {
 console.warn("[email] RESEND_API_KEY not set; skipping send");
 return { ok: false, skipped: true, error: "RESEND_API_KEY not set" };
 }
 const from = resendFromAddress();
 if (!from) {
 console.warn("[email] RESEND_FROM not set; skipping send");
 return { ok: false, skipped: true, error: "RESEND_FROM not set" };
 }

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

// Internal notice for a paid order. Reply-To is the customer.
export function paidLeadNotification(opts: {
  name: string;
  email: string;
  tier: Tier;
  siteUrl: string;
  amount: number;
  stripeSessionId?: string;
}) {
  const offer = tierConfig(opts.tier);
  const money = opts.tier === "done_for_you" ? "custom" : `$${opts.amount}`;
  const subject = `Paid · ${offer.name} · ${money} · ${opts.email}`;
  const text = `New paid customer.

Tier:    ${offer.name} (${money})
Name:    ${opts.name || "(not provided)"}
Email:   ${opts.email}
Site:    ${opts.siteUrl || "(none)"}
Stripe:  ${opts.stripeSessionId || "(unknown)"}

Reply to this email and your reply goes directly to the customer.
Their kickoff email has already been sent.

Eject internal notification`;
  const html = `<!doctype html>
<html><body style="font-family: ui-sans-serif, system-ui, sans-serif; line-height: 1.6; color: #0B0B0F; max-width: 560px; margin: 0 auto; padding: 24px;">
<p style="font-size: 18px; font-weight: 600;">New paid customer</p>
<table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
<tr><td style="padding: 6px 12px; color: #5A5A66; width: 90px;">Tier</td><td style="padding: 6px 12px;"><strong>${tierConfig(opts.tier).name}</strong> (${opts.tier === "done_for_you" ? "custom" : `$${opts.amount}`})</td></tr>
<tr><td style="padding: 6px 12px; color: #5A5A66;">Name</td><td style="padding: 6px 12px;">${escape(opts.name || "(not provided)")}</td></tr>
<tr><td style="padding: 6px 12px; color: #5A5A66;">Email</td><td style="padding: 6px 12px;"><a href="mailto:${escape(opts.email)}">${escape(opts.email)}</a></td></tr>
<tr><td style="padding: 6px 12px; color: #5A5A66;">Site</td><td style="padding: 6px 12px;">${escape(opts.siteUrl || "(none)")}</td></tr>
<tr><td style="padding: 6px 12px; color: #5A5A66;">Stripe</td><td style="padding: 6px 12px; font-family: ui-monospace, Menlo, monospace; font-size: 13px; color: #5A5A66;">${escape(opts.stripeSessionId || "(unknown)")}</td></tr>
</table>
<p style="font-size: 14px; color: #5A5A66; border-top: 1px solid #E5E1D7; padding-top: 16px; margin-top: 24px;">
Reply to this email and your reply goes directly to the customer. Their kickoff email has already been sent.
</p>
</body></html>`;
  return { subject, text, html, replyTo: opts.email };
}

export async function sendPaidLeadNotification(args: {
  name: string;
  email: string;
  tier: Tier;
  siteUrl: string;
  amount: number;
  stripeSessionId?: string;
}): Promise<{ ok: boolean; id?: string; error?: string; skipped?: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = resendFromAddress();
  if (!apiKey || !from) {
    return { ok: false, skipped: true, error: !apiKey ? "RESEND_API_KEY not set" : "RESEND_FROM not set" };
  }
  const tpl = paidLeadNotification(args);
  const internalRecipient = process.env.LEAD_NOTIFICATION_TO || siteConfig.email;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from,
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

export function expressKickoffEmail(opts: { name: string; siteUrl: string; intakeUrl?: string }) {
 const offer = tierConfig("automated");
 const subject = `${opts.name || "Hi"}, your Eject ${offer.name} payment is in`;
 const next = opts.intakeUrl
  ? `Open this link to submit ${opts.siteUrl} for a simple-site score: ${opts.intakeUrl}`
  : `Reply with the site URL if we don't already have ${opts.siteUrl}.`;
 const text = `Hi ${opts.name || "there"},

Your $${offer.price} ${offer.name} payment came through. Stripe may also email a receipt. You will edit the site by chatting with your own agent. Here is what actually happens next:

1. ${next}
2. We crawl the public pages and score complexity: page count, assets, animation and JS weight, CMS, forms, commerce, and platform.
3. You get an ELIGIBLE or NOT ELIGIBLE result. Simple marketing, portfolio, and landing pages continue. Stores and heavy CMS sites are refunded or referred out. We do not issue the refund automatically; email us and a person sends it.
4. If it is eligible, you get the kit (playbook, prompts, deploy notes, editor notes) plus a content snapshot and hosting instructions. A visual rebuild and a preview link are not created automatically. Those happen when you run the kit, or when a person reviews the queued handoff.

We do not promise a PageSpeed increase.

Reply to this email if a step is unclear.

Thanks,
The Eject team
${supportLine()}
${siteConfig.url}
`;
 const html = `<!doctype html>
<html><body style="font-family: ui-sans-serif, system-ui, sans-serif; line-height: 1.6; color: #0B0B0F; max-width: 560px; margin: 0 auto; padding: 24px;">
 <p style="font-size: 18px;">Hi ${escape(opts.name) || "there"},</p>
 <p>Your <strong>$${offer.price} ${offer.name}</strong> payment came through. Stripe may also email a receipt. You will edit the site by chatting with your own agent.</p>
 <ol style="padding-left: 20px;">
 <li>${opts.intakeUrl ? `Submit the site for scoring: <a href="${escape(opts.intakeUrl)}">${escape(opts.intakeUrl)}</a>` : `Reply with the site URL for ${escape(opts.siteUrl)}.`}</li>
 <li>We crawl public pages and score complexity. Simple marketing, portfolio, and landing pages can continue.</li>
 <li>Stores and heavy CMS sites are marked NOT ELIGIBLE. Email us for a refund or a referral. The refund is not sent automatically.</li>
 <li>Eligible orders get the kit plus a content snapshot and hosting instructions. A preview link is not generated automatically.</li>
 </ol>
 <p>We do not promise a PageSpeed increase.</p>
 <p style="color: #5A5A66; font-size: 14px; margin-top: 32px;">
    Thanks,<br/>
    The Eject team<br/>
    <a href="mailto:${escape(supportLine())}" style="color: #0066FF;">${escape(supportLine())}</a> · <a href="${siteConfig.url}" style="color: #0066FF;">ejectfrom.com</a>
 </p>
</body></html>`;

 return { subject, text, html };
}

export function conciergeKickoffEmail(opts: { name: string; siteUrl: string; intakeUrl?: string }) {
 const offer = tierConfig("done_for_you");
 const subject = `${opts.name || "Hi"}, your Eject ${offer.name} payment is in`;
 const text = `Hi ${opts.name || "there"},

Your custom migration payment came through. We handle the migration for you, step by step.

What happens next:

1. ${opts.intakeUrl ? `Submit ${opts.siteUrl} here so we can score it: ${opts.intakeUrl}` : `We confirm ${opts.siteUrl} with you.`}
2. The score says ELIGIBLE or NOT ELIGIBLE. We only continue with simple marketing, portfolio, and landing pages. Stores and heavy CMS sites are refunded or referred out. Email us for the refund; it is not sent automatically.
3. If it is eligible, a person runs the migration and writes when there is something to review. A preview link is sent only after that review. It is not generated the moment you pay.
4. Hosting is coordinated with you. The repo includes AGENTS.md so you can keep editing by chatting with your own agent. There is no hosted chat app and no editor subscription.

We do not promise a PageSpeed increase.

Reply with anything you want preserved or changed.

Thanks,
The Eject team
${supportLine()}
${siteConfig.url}
`;
 const html = `<!doctype html>
<html><body style="font-family: ui-sans-serif, system-ui, sans-serif; line-height: 1.6; color: #0B0B0F; max-width: 560px; margin: 0 auto; padding: 24px;">
 <p style="font-size: 18px;">Hi ${escape(opts.name) || "there"},</p>
 <p>Your custom migration payment came through. We handle the migration for you, step by step.</p>
 <ol style="padding-left: 20px;">
 <li>${opts.intakeUrl ? `Submit the site for scoring: <a href="${escape(opts.intakeUrl)}">${escape(opts.intakeUrl)}</a>` : `We confirm <code>${escape(opts.siteUrl)}</code> with you.`}</li>
 <li>Simple marketing, portfolio, and landing pages can continue. Anything else is refunded or referred out.</li>
 <li>A preview link is sent only after a person has reviewed a rebuild. It is not automatic.</li>
 <li>Hosting changes are coordinated with you. AGENTS.md is how you edit afterwards, with your own agent.</li>
 </ol>
 <p>We do not promise a PageSpeed increase.</p>
 <p style="color: #5A5A66; font-size: 14px; margin-top: 32px;">
    Thanks,<br/>
    The Eject team<br/>
    <a href="mailto:${escape(supportLine())}" style="color: #0066FF;">${escape(supportLine())}</a> · <a href="${siteConfig.url}" style="color: #0066FF;">ejectfrom.com</a>
 </p>
</body></html>`;

 return { subject, text, html };
}

export function intakeReceivedEmail(opts: { name: string; siteUrl: string; eligible: boolean }) {
  const subject = opts.eligible
    ? `We received ${opts.siteUrl} and it looks like a simple site`
    : `We received ${opts.siteUrl}. It is outside the simple-site cap`;
  const text = `Hi ${opts.name || "there"},

We received ${opts.siteUrl} and finished the complexity score.

${opts.eligible
    ? "The result is ELIGIBLE. Simple marketing, portfolio, and landing pages can continue. A preview link is not created automatically. You will get hosting notes and editor instructions."
    : "The result is NOT ELIGIBLE. We do not migrate stores, heavy CMS sites, member areas, or sites past the cap. Email us if you want a refund. A person sends it. The app does not refund the card by itself."}

Thanks,
The Eject team
${supportLine()}
`;
  return { subject, text, html: paragraphHtml(text) };
}

export function deliveryEmail(opts: { name: string; siteUrl: string; kitUrl?: string }) {
  const subject = `Your Eject handoff for ${opts.siteUrl} is ready to review`;
  const text = `Hi ${opts.name || "there"},

The handoff for ${opts.siteUrl} is ready. It includes a content snapshot, hosting notes, and editor instructions (AGENTS.md). You edit the site by chatting with your own agent.

${opts.kitUrl ? `Kit: ${opts.kitUrl}` : "Open the kit link from your order email."}

We do not promise the new pages will match the old site pixel for pixel. You own the code we hand you. DNS and the domain stay your job until you decide to point them.

Thanks,
The Eject team
${supportLine()}
`;
  return { subject, text, html: paragraphHtml(text) };
}

export function refundFollowupEmail(opts: { name: string; siteUrl: string }) {
  const subject = `Refund follow-up for ${opts.siteUrl || "your order"}`;
  const text = `Hi ${opts.name || "there"},

We marked ${opts.siteUrl || "your order"} for a person to review. If the site is outside the simple-site scope, or you are inside the 14-day window on the refunds page, email ${supportLine()} and a person will refund the original payment method.

This email does not move money. Stripe is not called from this message.

Thanks,
The Eject team
${supportLine()}
`;
  return { subject, text, html: paragraphHtml(text) };
}

function supportLine(): string {
  return process.env.SUPPORT_EMAIL?.trim() || siteConfig.email;
}

function paragraphHtml(text: string): string {
  const body = escape(text).replace(/\n/g, "<br/>");
  return `<!doctype html><html><body style="font-family: ui-sans-serif, system-ui, sans-serif; line-height: 1.6; color: #0B0B0F; max-width: 560px; margin: 0 auto; padding: 24px;">${body}</body></html>`;
}

function escape(s: string) {
 return String(s ?? "").replace(/[&<>"']/g, (c) => {
 return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!;
 });
}
