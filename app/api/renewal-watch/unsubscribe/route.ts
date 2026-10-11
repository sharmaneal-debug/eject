import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { logError } from "@/lib/log-error";
import { unsubscribeByToken } from "@/lib/renewal/subscriptions";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const limit = rateLimit({ key: `unsub:${clientIp(req)}`, windowMs: 60 * 60 * 1000, max: 20 });
  if (!limit.ok) {
    return NextResponse.json({ ok: false, error: "Too many attempts. Try again later." }, { status: 429 });
  }

  let token = "";
  try {
    const body = (await req.json()) as { token?: unknown };
    if (typeof body.token === "string") token = body.token;
  } catch {
    return NextResponse.json({ ok: false, error: "Send JSON." }, { status: 400 });
  }

  try {
    const result = await unsubscribeByToken(token);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: "That unsubscribe link is not valid." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, already: result.already });
  } catch (err) {
    logError("renewal-unsubscribe", err);
    return NextResponse.json({ ok: false, error: "We couldn't update that subscription." }, { status: 500 });
  }
}
