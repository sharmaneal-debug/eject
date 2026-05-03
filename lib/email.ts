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
 // own domain yet. Once eject.co is verified in Resend, set RESEND_FROM in env.
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

export function expressKickoffEmail(opts: { name: string; siteUrl: string }) {
 const subject = `${opts.name}, your Eject migration is starting`;
 const text = `Hi ${opts.name || "there"},

Your $49 Express payment came through. Here's what happens next:

1. Within the next 1–2 hours, our system starts crawling ${opts.siteUrl}.
2. You'll get a preview link in your inbox within 24–48 hours. A real, live version of your site rebuilt as code you own.
3. Click around. If anything's off, hit reply and tell us. We'll fix it.
4. Once you approve, we send you the files plus a 10-minute deploy guide for free hosting on Cloudflare.

You'll also receive an "AI editing kit". A small instruction file you paste into ChatGPT (or Claude) once. After that, you can change anything on your site by typing what you want. No code, no tool to learn.

Reply to this email with anything you want us to know about your site. We read every reply.

Thanks,
The Eject team
hi@eject.co
${siteConfig.url}
`;
 const html = `<!doctype html>
<html><body style="font-family: ui-sans-serif, system-ui, sans-serif; line-height: 1.6; color: #0B0B0F; max-width: 560px; margin: 0 auto; padding: 24px;">
 <p style="font-size: 18px;">Hi ${escape(opts.name) || "there"},</p>
 <p>Your <strong>$49 Express</strong> payment came through. Here's what happens next:</p>
 <ol style="padding-left: 20px;">
 <li>Within the next 1–2 hours, our system starts crawling <code>${escape(opts.siteUrl)}</code>.</li>
 <li>You'll get a preview link in your inbox within 24–48 hours. A real, live version of your site rebuilt as code you own.</li>
 <li>Click around. If anything's off, hit reply and tell us. We'll fix it.</li>
 <li>Once you approve, we send you the files plus a 10-minute deploy guide for free hosting on Cloudflare.</li>
 </ol>
 <p>You'll also receive an "AI editing kit". A small instruction file you paste into ChatGPT (or Claude) once. After that, you can change anything on your site by typing what you want. No code, no tool to learn.</p>
 <p>Reply to this email with anything you want us to know about your site. We read every reply.</p>
 <p style="color: #5A5A66; font-size: 14px; margin-top: 32px;">
    Thanks,<br/>
    The Eject team<br/>
    <a href="mailto:hi@eject.co" style="color: #0066FF;">hi@eject.co</a> · <a href="${siteConfig.url}" style="color: #0066FF;">eject.co</a>
 </p>
</body></html>`;

 return { subject, text, html };
}

export function conciergeKickoffEmail(opts: { name: string; siteUrl: string }) {
 const subject = `${opts.name}, your Eject Concierge migration is starting`;
 const text = `Hi ${opts.name || "there"},

Your $299 Concierge payment came through. A real human (not a bot) is on it.

What happens next:

1. Within 24 hours, you'll get a personal email from us asking 2–3 quick questions about ${opts.siteUrl}: anything specific you want preserved, anything you want changed, when you want to launch.
2. We rebuild your site by hand. Pixel-matched to today.
3. Day 4–5: we send you a preview link to review. One round of revisions included.
4. Day 7: we deploy your site to free hosting, move your domain over, and hand you the keys.

You'll get the same AI editing kit Express customers get. Copy-paste instructions for editing your site with ChatGPT or Claude after the migration is done.

Reply with anything you want us to know. The more context, the better.

Thanks,
The Eject team
hi@eject.co
${siteConfig.url}
`;
 const html = `<!doctype html>
<html><body style="font-family: ui-sans-serif, system-ui, sans-serif; line-height: 1.6; color: #0B0B0F; max-width: 560px; margin: 0 auto; padding: 24px;">
 <p style="font-size: 18px;">Hi ${escape(opts.name) || "there"},</p>
 <p>Your <strong>$299 Concierge</strong> payment came through. A real human (not a bot) is on it.</p>
 <p><strong>What happens next:</strong></p>
 <ol style="padding-left: 20px;">
 <li>Within 24 hours, a personal email from us asking 2–3 quick questions about <code>${escape(opts.siteUrl)}</code>.</li>
 <li>We rebuild your site by hand, pixel-matched to today.</li>
 <li>Day 4–5: preview link to review. One round of revisions included.</li>
 <li>Day 7: we deploy to free hosting, move your domain, hand you the keys.</li>
 </ol>
 <p>You'll get the same AI editing kit Express customers get. Copy-paste instructions for editing your site with ChatGPT or Claude after the migration is done.</p>
 <p>Reply with anything you want us to know. The more context, the better.</p>
 <p style="color: #5A5A66; font-size: 14px; margin-top: 32px;">
    Thanks,<br/>
    The Eject team<br/>
    <a href="mailto:hi@eject.co" style="color: #0066FF;">hi@eject.co</a> · <a href="${siteConfig.url}" style="color: #0066FF;">eject.co</a>
 </p>
</body></html>`;

 return { subject, text, html };
}

function escape(s: string) {
 return String(s ?? "").replace(/[&<>"']/g, (c) => {
 return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!;
 });
}
