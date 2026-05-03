import { NextResponse } from "next/server";
import { logLead } from "@/lib/leads";

export const runtime = "edge";

// Intake form handler. Logs every submission to Google Sheets via the
// LEADS_WEBHOOK_URL Apps Script web app (see docs/setup-leads.md).

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const safe = {
      name: String(body?.name ?? "").slice(0, 200),
      email: String(body?.email ?? "").slice(0, 200),
      siteUrl: String(body?.siteUrl ?? "").slice(0, 500),
      platform: String(body?.platform ?? "").slice(0, 50),
      tier: String(body?.tier ?? "express").slice(0, 20),
      pages: Number(body?.pages) || 0,
      cmsItems: Number(body?.cmsItems) || 0,
      notes: String(body?.notes ?? "").slice(0, 2000),
      receivedAt: new Date().toISOString(),
    };

    if (!safe.email || !safe.siteUrl) {
      return NextResponse.json(
        { ok: false, error: "missing email or siteUrl" },
        { status: 400 },
      );
    }

    await logLead({
      event: "intake_submitted",
      data: {
        ...safe,
        userAgent: req.headers.get("user-agent") ?? "",
        referer: req.headers.get("referer") ?? "",
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }
}
