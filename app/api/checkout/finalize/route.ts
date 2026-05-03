import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { sendEmail, expressKickoffEmail, conciergeKickoffEmail, sendPaidLeadNotification } from "@/lib/email";
import { logLead } from "@/lib/leads";

export const runtime = "edge";

// Called by /checkout/success after the user lands post-payment.
// Verifies the session is paid, then sends the appropriate kickoff email.
// Idempotent: Stripe webhooks would be more robust for production, but this
// keeps the moving pieces minimal for launch.

export async function POST(req: Request) {
  let body: { sessionId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }
  if (!body.sessionId) {
    return NextResponse.json({ ok: false, error: "missing sessionId" }, { status: 400 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ ok: false, error: "stripe not configured" }, { status: 503 });
  }

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(body.sessionId);
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 404 });
  }

  if (session.payment_status !== "paid") {
    return NextResponse.json({ ok: false, error: "session not paid yet" }, { status: 402 });
  }

  const tier = (session.metadata?.tier ?? "express") as "express" | "concierge";
  const siteUrl = session.metadata?.siteUrl || "your site";
  const email = session.customer_email || session.customer_details?.email;
  const name = session.customer_details?.name || "";

  if (!email) {
    return NextResponse.json({ ok: true, sent: false, reason: "no customer email" });
  }

  const tpl = tier === "concierge" ? conciergeKickoffEmail({ name, siteUrl }) : expressKickoffEmail({ name, siteUrl });

  const result = await sendEmail({ to: email, ...tpl, customerName: name });

  // Notify Neal directly. Real-time database alternative to Apps Script:
  // every paid customer lands in his Laniakea inbox with reply-to set to
  // the customer so he can reply straight from his inbox.
  await sendPaidLeadNotification({
    name,
    email,
    tier,
    siteUrl,
    amount: typeof session.amount_total === "number" ? session.amount_total / 100 : 0,
    stripeSessionId: session.id,
  });

  // Log paid customer to the lead store.
  await logLead({
    event: "checkout_paid",
    data: {
      tier,
      siteUrl,
      email,
      name,
      stripeSessionId: session.id,
      amountPaid: typeof session.amount_total === "number" ? session.amount_total / 100 : null,
      currency: session.currency,
      kickoffEmailSent: result.ok,
      kickoffEmailError: result.error ?? null,
    },
  });

  return NextResponse.json({
    ok: true,
    sent: result.ok,
    error: result.error,
    tier,
    email: maskEmail(email),
  });
}

function maskEmail(e: string) {
  const [local, domain] = e.split("@");
  if (!domain) return e;
  return `${local.slice(0, 2)}***@${domain}`;
}
