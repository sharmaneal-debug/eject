import { NextResponse } from "next/server";

export const runtime = "edge";

// Stub intake handler. In production this will:
//   1. validate via zod
//   2. write to a Supabase / Notion / Airtable lead table
//   3. fire a Resend email to hi@eject.dev
//   4. fire a Slack webhook for instant notification
// For now we log and return ok so the form works locally and on preview deploys.

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const safe = {
      name: String(body?.name ?? "").slice(0, 200),
      email: String(body?.email ?? "").slice(0, 200),
      siteUrl: String(body?.siteUrl ?? "").slice(0, 500),
      platform: String(body?.platform ?? "").slice(0, 50),
      tier: String(body?.tier ?? "dwy").slice(0, 10),
      pages: Number(body?.pages) || 0,
      cmsItems: Number(body?.cmsItems) || 0,
      notes: String(body?.notes ?? "").slice(0, 2000),
      receivedAt: new Date().toISOString(),
    };

    if (!safe.email || !safe.siteUrl) {
      return NextResponse.json({ ok: false, error: "missing email or siteUrl" }, { status: 400 });
    }

    // TODO: persist to Supabase + send Resend "audit incoming" + Slack ping.
    console.log("[intake]", safe);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }
}
