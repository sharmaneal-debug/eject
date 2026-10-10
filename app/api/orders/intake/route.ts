import { NextResponse } from "next/server";
import { runPaidIntake } from "@/lib/fulfillment";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = rateLimit({ key: `intake:${ip}`, windowMs: 60 * 60 * 1000, max: 8 });
  if (!limit.ok) {
    return NextResponse.json({ ok: false, error: "Too many intake attempts. Try again later." }, { status: 429 });
  }

  let body: { token?: string; url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }
  if (!body.token) return NextResponse.json({ ok: false, error: "missing token" }, { status: 401 });

  const result = await runPaidIntake(body.token, body.url ?? "");
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: result.status });

  const score = result.order.score;
  return NextResponse.json({
    ok: true,
    orderId: result.order.id,
    eligibility: score?.eligibility,
    referral: score?.referral,
  });
}
