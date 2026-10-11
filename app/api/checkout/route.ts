import { NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/checkout";
import { checkoutOpen } from "@/lib/checkout-gate";
import { normalizeTier, tierConfig } from "@/lib/stripe";
import { siteConfig } from "@/lib/site";

export const runtime = "nodejs";

type Body = {
  tier?: string;
  url?: string;
  email?: string;
  name?: string;
};

export async function POST(req: Request) {
  if (!checkoutOpen()) {
    return NextResponse.redirect(new URL("/early-access", req.url), 303);
  }
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }

  const tier = normalizeTier(body.tier);
  if (!tier) {
    return NextResponse.json({ ok: false, error: "invalid tier" }, { status: 400 });
  }
  if (tier === "done_for_you") {
    return NextResponse.json(
      { ok: false, error: "Custom work is not a public checkout.", book: "/book" },
      { status: 409 },
    );
  }

  const origin = req.headers.get("origin") ?? siteConfig.url;
  const result = await createCheckoutSession({
    tier,
    origin,
    siteUrl: body.url,
    email: body.email,
    name: body.name,
  });

  if (result.kind === "redirect") {
    return NextResponse.json({ ok: true, url: result.url, orderId: result.orderId });
  }

  return NextResponse.json(
    { ok: false, error: result.reason, tier: tierConfig(tier) },
    { status: 503 },
  );
}
