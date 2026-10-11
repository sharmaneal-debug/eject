import { NextResponse } from "next/server";
import { supportEmail } from "@/lib/support";
import { saveLead } from "@/lib/leads/store";
import { sendEmail } from "@/lib/email";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { safeFetch, SsrfError } from "@/lib/ssrf";
import { detectPlatform, PLATFORM_LABELS } from "@/lib/platform";
import { buildScanEstimate } from "@/lib/scan-estimate";

export const runtime = "nodejs";

type Body = {
  email?: string;
  name?: string;
  url?: string;
  platform?: string;
  renewalDate?: string;
  note?: string;
};

function friendlyUrl(input: string): string {
  let value = input.trim();
  if (!value) throw new Error("Add the site URL.");
  if (!/^https?:\/\//i.test(value)) value = `https://${value}`;
  return value;
}

export async function POST(req: Request) {
  const limit = rateLimit({ key: `book:${clientIp(req)}`, windowMs: 60 * 60 * 1000, max: 8 });
  if (!limit.ok) {
    return NextResponse.json({ ok: false, error: "Too many booking requests. Email us instead." }, { status: 429 });
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

  let siteUrl = "";
  let platformLabel = (body.platform ?? "").trim().slice(0, 40);
  let scanNote = "";
  let scanError = "";
  try {
    siteUrl = friendlyUrl(body.url ?? "");
    const response = await safeFetch(siteUrl, { timeoutMs: 8000 });
    const html = (await response.text()).slice(0, 400_000);
    const platform = detectPlatform(html);
    if (!platformLabel) platformLabel = PLATFORM_LABELS[platform];
    const estimate = buildScanEstimate(platform);
    scanNote = `Typical plan about $${estimate.annualCostEstimate}/yr. Automated one-time comparison $${estimate.ejectThreeYearCost}.`;
  } catch (err) {
    scanError = err instanceof SsrfError ? "That URL can't be scanned." : err instanceof Error ? err.message : "Scan failed.";
  }

  const note = [
    `Platform: ${platformLabel || "unknown"}`,
    `Renewal date: ${(body.renewalDate ?? "").slice(0, 40) || "not given"}`,
    `What they want: ${(body.note ?? "").trim().slice(0, 1000) || "not given"}`,
    scanError ? `Scan: ${scanError}` : `Scan: completed. ${scanNote}`,
  ].join("\n");

  const saved = await saveLead({
    email,
    name: body.name,
    note,
    intent: "done_for_you_call",
    source: "book",
    page: siteUrl,
  });

  const to = process.env.LEAD_NOTIFICATION_TO?.trim() || supportEmail();
  const subject = `Custom pricing · ${email} · ${siteUrl || "no url"}`;
  const text = `Custom pricing request.

Name: ${body.name || "(not provided)"}
Email: ${email}
Site: ${siteUrl || "(missing)"}
${note}

Lead id: ${saved.lead.id}
Stored: ${saved.info.driver} (durable: ${saved.info.durable})

Custom pricing. We handle the migration for you, step by step.
`;
  const mailed = await sendEmail({ to, subject, text, html: `<pre>${text.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!)}</pre>` });

  return NextResponse.json({
    ok: true,
    leadId: saved.lead.id,
    durable: saved.info.durable,
    emailed: mailed.ok,
    emailSkipped: mailed.skipped ?? false,
    siteUrl,
    platform: platformLabel,
    scanError: scanError || null,
  });
}
