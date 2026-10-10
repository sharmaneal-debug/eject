import { NextResponse } from "next/server";
import { markMockOrderPaid, sendKickoffOnce, publicOrigin } from "@/lib/fulfillment";
import { isMockStripe } from "@/lib/checkout";

export const runtime = "nodejs";

async function readOrderId(req: Request): Promise<string> {
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await req.json()) as { orderId?: string };
    return body.orderId ?? "";
  }
  const form = await req.formData();
  return String(form.get("orderId") ?? "");
}

export async function POST(req: Request) {
  if (!isMockStripe()) {
    return NextResponse.json({ ok: false, error: "mock checkout is disabled" }, { status: 404 });
  }
  let orderId = "";
  try {
    orderId = await readOrderId(req);
  } catch {
    return NextResponse.json({ ok: false, error: "bad request" }, { status: 400 });
  }
  if (!orderId) return NextResponse.json({ ok: false, error: "missing order" }, { status: 400 });

  try {
    const paid = await markMockOrderPaid(orderId);
    const order = await sendKickoffOnce(paid, publicOrigin());
    const destination = `/checkout/success?session_id=${encodeURIComponent(order.stripeSessionId || "")}`;
    if ((req.headers.get("content-type") ?? "").includes("application/json")) {
      return NextResponse.json({ ok: true, redirect: destination, orderId: order.id, token: order.token });
    }
    return NextResponse.redirect(new URL(destination, req.url), 303);
  } catch (err) {
    const message = err instanceof Error ? err.message : "mock checkout failed";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
