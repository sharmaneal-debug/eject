import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/site";
import { logError } from "@/lib/log-error";
import { daysUntilDate } from "@/lib/renewal/dates";
import { dueReminder } from "@/lib/renewal/move-plan";
import { sendRenewalReminder } from "@/lib/renewal/email";
import { listSubscriptions, updateSubscription } from "@/lib/renewal/subscriptions";

export const runtime = "nodejs";

// Vercel Cron calls this daily. See vercel.json.
// No-op unless CRON_SECRET and RESEND_API_KEY are both set, so a deploy
// without email credentials cannot send and an open URL cannot trigger mail.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: true, sent: 0, skipped: "CRON_SECRET not set" });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ ok: true, sent: 0, skipped: "RESEND_API_KEY not set" });
  }

  try {
    const { subscriptions } = await listSubscriptions();
    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const sub of subscriptions) {
      if (sub.status !== "active") {
        skipped += 1;
        continue;
      }
      const days = daysUntilDate(sub.renewalDate);
      if (days == null) {
        skipped += 1;
        continue;
      }
      const slot = dueReminder(days, sub.remindersSent);
      if (!slot) {
        skipped += 1;
        continue;
      }
      const ok = await sendRenewalReminder({
        sub,
        daysUntil: days,
        slot,
        origin: siteConfig.url,
      });
      if (!ok) {
        failed += 1;
        continue;
      }
      await updateSubscription(sub.id, (current) => ({
        ...current,
        remindersSent: current.remindersSent.includes(slot) ? current.remindersSent : [...current.remindersSent, slot],
      }));
      sent += 1;
    }

    return NextResponse.json({ ok: true, sent, failed, skipped });
  } catch (err) {
    logError("renewal-cron", err);
    return NextResponse.json({ ok: false, error: "cron failed" }, { status: 500 });
  }
}
