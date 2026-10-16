import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { processDeliveryQueue } from "@/lib/auto-deliver";
import { logError } from "@/lib/log-error";

export const runtime = "nodejs";
export const maxDuration = 60;

// Vercel Cron calls this. See vercel.json.
// No-op unless CRON_SECRET is set, so a deploy without the secret cannot
// start delivery and an open URL cannot drain the queue.
function authorized(req: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: true, processed: 0, skipped: "CRON_SECRET not set" });
  }
  const header = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const left = Buffer.from(header);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(req: Request) {
  const denied = authorized(req);
  if (denied) return denied;
  try {
    const run = await processDeliveryQueue();
    return NextResponse.json({
      ok: true,
      runner: run.runner,
      warning: run.warning,
      githubConfigured: run.githubConfigured,
      emailConfigured: run.emailConfigured,
      processed: run.results.length,
      results: run.results,
    });
  } catch (err) {
    logError("deliver-cron", err);
    return NextResponse.json({ ok: false, error: "cron failed" }, { status: 500 });
  }
}
