import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { logError } from "@/lib/log-error";
import { saveLead } from "@/lib/leads/store";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const limit = rateLimit({ key: `lead:${clientIp(req)}`, windowMs: 60 * 60 * 1000, max: 8 });
  if (!limit.ok) {
    return NextResponse.json({ ok: false, error: "Too many notes from this network. Try again later." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Send JSON." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    const { info, forwarded } = await saveLead({
      email,
      name: typeof body.name === "string" ? body.name : "",
      note: typeof body.note === "string" ? body.note : "",
      intent: typeof body.intent === "string" ? body.intent : "general",
      source: typeof body.source === "string" ? body.source : "site",
      page: typeof body.page === "string" ? body.page : "",
    });
    return NextResponse.json({ ok: true, persisted: info.durable, store: info.driver, forwarded });
  } catch (err) {
    logError("leads", err);
    return NextResponse.json({ ok: false, error: "We couldn't save that." }, { status: 500 });
  }
}
