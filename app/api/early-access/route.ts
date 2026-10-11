import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { saveLead } from "@/lib/leads/store";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { supportEmail } from "@/lib/support";

export const runtime = "nodejs";

type Body = {
  email?: string;
  name?: string;
  url?: string;
  note?: string;
};

export async function POST(req: Request) {
  const limit = rateLimit({ key: `early:${clientIp(req)}`, windowMs: 60 * 60 * 1000, max: 8 });
  if (!limit.ok) {
    return NextResponse.json({ ok: false, error: "Too many requests. Email us instead." }, { status: 429 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Send JSON." }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Add a real email address." }, { status: 400 });
  }

  const name = (body.name ?? "").trim().slice(0, 120);
  const page = (body.url ?? "").trim().slice(0, 200);
  const note = (body.note ?? "").trim().slice(0, 1000);
  await saveLead({
    email,
    name,
    note: note || "Early access",
    intent: "early_access",
    source: "early-access",
    page,
  });

  const to = process.env.LEAD_NOTIFICATION_TO?.trim() || supportEmail();
  const text = `Early access request.\n\nEmail: ${email}\nName: ${name || "(not given)"}\nSite: ${page || "(not given)"}\nNote: ${note || "(not given)"}`;
  const sent = await sendEmail({
    to,
    subject: `Early access · ${email}`,
    text,
    html: `<p>${text.replace(/\n/g, "<br>")}</p>`,
  });

  return NextResponse.json({ ok: true, stored: true, emailed: sent.ok === true });
}
