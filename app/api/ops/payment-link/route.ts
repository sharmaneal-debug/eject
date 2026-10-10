import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { createCheckoutSession } from "@/lib/checkout";
import { operatorDoneForYouUsd } from "@/lib/operator-pricing";
import { siteConfig } from "@/lib/site";

export const runtime = "nodejs";

function authorized(presented: string | null | undefined): boolean {
  const expected = process.env.OPS_ACCESS_TOKEN;
  if (!expected || !presented) return false;
  const left = Buffer.from(presented);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function POST(req: Request) {
  let body: { key?: string; email?: string; name?: string; url?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Send JSON." }, { status: 400 });
  }
  const header = req.headers.get("x-ops-token");
  if (!authorized(header ?? body.key)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? siteConfig.url;
  const result = await createCheckoutSession({
    tier: "done_for_you",
    channel: "operator",
    origin,
    email: body.email,
    name: body.name,
    siteUrl: body.url,
  });
  if (result.kind !== "redirect") {
    return NextResponse.json({ ok: false, error: result.reason }, { status: 503 });
  }
  return NextResponse.json({
    ok: true,
    url: result.url,
    orderId: result.orderId,
    amount: operatorDoneForYouUsd,
  });
}
