import { siteConfig } from "@/lib/site";
import { sendEmail } from "@/lib/email";
import { formatLongDate } from "./dates";
import type { RenewalSubscription } from "./subscriptions";

export async function sendRenewalConfirmation(sub: RenewalSubscription, origin: string): Promise<boolean> {
  const when = formatLongDate(sub.renewalDate);
  const plan = sub.planLabel || "your plan";
  const platform = titlePlatform(sub.platform);
  const unsubscribe = unsubscribeUrl(origin, sub.unsubscribeToken);
  const subject = `${platform} renewal watch is on for ${when}`;
  const text = `You're watching the ${platform} ${plan} renewal on ${when}.

We'll email you around 90, 60, and 30 days before that date so you can move a simple marketing, portfolio, or landing site before the invoice. We don't email you about stores, member areas, or large CMS sites, because those are outside what Eject does.

Plan the move: ${origin}/renewal-watch

Unsubscribe: ${unsubscribe}

${siteConfig.name}
${siteConfig.email}`;
  const html = layout(`
    <p>You're watching the <strong>${escapeHtml(platform)} ${escapeHtml(plan)}</strong> renewal on <strong>${escapeHtml(when)}</strong>.</p>
    <p>We'll email you around 90, 60, and 30 days before that date. Use the time to move a simple marketing, portfolio, or landing site. Stores, member areas, and large CMS sites are outside what Eject does.</p>
    <p><a href="${escapeHtml(origin)}/renewal-watch">Open your move-by plan</a></p>
    <p style="font-size:13px;color:#5A5A66;">Don't want these? <a href="${escapeHtml(unsubscribe)}">Unsubscribe</a>.</p>
  `);
  const result = await sendEmail({ to: sub.email, subject, html, text });
  return result.ok;
}

export async function sendRenewalReminder(opts: {
  sub: RenewalSubscription;
  daysUntil: number;
  slot: "90" | "60" | "30";
  origin: string;
}): Promise<boolean> {
  const platform = titlePlatform(opts.sub.platform);
  const when = formatLongDate(opts.sub.renewalDate);
  const unsubscribe = unsubscribeUrl(opts.origin, opts.sub.unsubscribeToken);
  const subject = `${platform} renews in ${opts.daysUntil} days`;
  const next =
    opts.slot === "90"
      ? "Confirm the site is only a marketing page, portfolio, or landing page. If it is a store or a large CMS, don't start a move with us."
      : opts.slot === "60"
        ? `Start the move now if the site is in scope. ${siteConfig.pricing.express.name} ($${siteConfig.pricing.express.price}) is an automated migration of a simple site that you review before DNS. ${siteConfig.pricing.concierge.name} ($${siteConfig.pricing.concierge.price}) is that same kind of site, done by hand inside a page cap. ${siteConfig.editing.lead} ${siteConfig.editing.included} There is no preview before you pay.`
        : "Turn off auto-renew in the platform's billing settings. Switch DNS only after the new site is on a host you control.";
  const text = `Your ${platform} renewal is in ${opts.daysUntil} days (${when}).

${next}

Calculator and checklist: ${opts.origin}/renewal-watch

Unsubscribe: ${unsubscribe}`;
  const html = layout(`
    <p>Your <strong>${escapeHtml(platform)}</strong> renewal is in <strong>${opts.daysUntil} days</strong> (${escapeHtml(when)}).</p>
    <p>${escapeHtml(next)}</p>
    <p><a href="${escapeHtml(opts.origin)}/renewal-watch">Open the calculator and checklist</a></p>
    <p style="font-size:13px;color:#5A5A66;"><a href="${escapeHtml(unsubscribe)}">Unsubscribe</a></p>
  `);
  const result = await sendEmail({ to: opts.sub.email, subject, html, text });
  return result.ok;
}

function unsubscribeUrl(origin: string, token: string): string {
  return `${origin}/renewal-watch/unsubscribe?token=${encodeURIComponent(token)}`;
}

function titlePlatform(id: string): string {
  if (id === "webflow") return "Webflow";
  if (id === "framer") return "Framer";
  if (id === "wix") return "Wix";
  if (id === "squarespace") return "Squarespace";
  return id;
}

function layout(inner: string): string {
  return `<!doctype html>
<html><body style="font-family: ui-sans-serif, system-ui, sans-serif; line-height: 1.6; color: #0B0B0F; max-width: 560px; margin: 0 auto; padding: 24px;">
${inner}
<p style="color:#5A5A66;font-size:14px;margin-top:32px;">${escapeHtml(siteConfig.name)} · <a href="mailto:${escapeHtml(siteConfig.email)}">${escapeHtml(siteConfig.email)}</a></p>
</body></html>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
}
