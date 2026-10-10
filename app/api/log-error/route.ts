import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { logError } from "@/lib/log-error";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const limit = rateLimit({ key: `log:${clientIp(req)}`, windowMs: 60 * 60 * 1000, max: 30 });
  if (!limit.ok) return NextResponse.json({ ok: false }, { status: 429 });

  let body: { message?: unknown; path?: unknown; digest?: unknown };
  try {
    body = (await req.json()) as { message?: unknown; path?: unknown; digest?: unknown };
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.slice(0, 500) : "client error";
  const path = typeof body.path === "string" ? body.path.slice(0, 200) : "";
  const digest = typeof body.digest === "string" ? body.digest.slice(0, 80) : "";
  logError("client", message, { path, digest });
  return NextResponse.json({ ok: true });
}
