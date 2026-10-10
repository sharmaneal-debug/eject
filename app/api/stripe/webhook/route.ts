import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { markOrderPaidFromSession, sendKickoffOnce, publicOrigin } from "@/lib/fulfillment";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json(
      { ok: false, error: "Stripe webhook is not configured. Set STRIPE_SECRET_KEY (sk_test_…) and STRIPE_WEBHOOK_SECRET." },
      { status: 503 },
    );
  }

  const payload = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch {
    return NextResponse.json({ ok: false, error: "invalid signature" }, { status: 400 });
  }

  if (event.livemode) {
    return NextResponse.json({ ok: false, error: "live mode events are refused" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.livemode) {
      return NextResponse.json({ ok: false, error: "live mode events are refused" }, { status: 400 });
    }
    if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
      return NextResponse.json({ ok: true, ignored: true });
    }
    const order = await markOrderPaidFromSession(session);
    await sendKickoffOnce(order, publicOrigin());
    return NextResponse.json({ ok: true, orderId: order.id });
  }

  return NextResponse.json({ ok: true, ignored: true });
}
