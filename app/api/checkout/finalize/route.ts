import { NextResponse } from "next/server";
import { reconcileSession } from "@/lib/fulfillment";

export const runtime = "nodejs";

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  return `${local.slice(0, 2)}***@${domain}`;
}

export async function POST(req: Request) {
  let body: { sessionId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }
  if (!body.sessionId) {
    return NextResponse.json({ ok: false, error: "missing sessionId" }, { status: 400 });
  }

  try {
    const order = await reconcileSession(body.sessionId);
    if (!order) {
      return NextResponse.json({ ok: false, error: "session not paid yet" }, { status: 402 });
    }
    return NextResponse.json({
      ok: true,
      sent: Boolean(order.kickoffSentAt),
      error: order.kickoffSkipReason,
      tier: order.tier,
      email: order.email ? maskEmail(order.email) : undefined,
      token: order.token,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "finalize failed";
    const status = message.includes("live mode") ? 400 : 404;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
