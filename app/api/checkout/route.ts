import { NextResponse } from "next/server";
import { getStripe, priceIdForTier, tierConfig, isValidTier, type Tier } from "@/lib/stripe";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";

type Body = {
 tier?: Tier | string;
 url?: string;
 email?: string;
};

export async function POST(req: Request) {
 let body: Body;
 try {
 body = (await req.json()) as Body;
 } catch {
 return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
 }

 if (!isValidTier(body.tier)) {
 return NextResponse.json({ ok: false, error: "invalid tier" }, { status: 400 });
 }

 const tier = body.tier;

 const stripe = getStripe();
 if (!stripe) {
 return NextResponse.json(
 {
 ok: false,
 error: "stripe is not configured yet. Set STRIPE_SECRET_KEY in your .env file.",
 preview: true,
 tier: tierConfig(tier),
 },
 { status: 503 },
 );
 }

 const priceId = priceIdForTier(tier);
 if (!priceId) {
 return NextResponse.json(
 { ok: false, error: `STRIPE_PRICE_${tier.toUpperCase()} is not set. Run pnpm setup-stripe to create products.` },
 { status: 503 },
 );
 }

 const origin = req.headers.get("origin") ?? siteConfig.url;

 try {
 const session = await stripe.checkout.sessions.create({
 mode: "payment",
 line_items: [{ price: priceId, quantity: 1 }],
 success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
 cancel_url: `${origin}/checkout/cancel`,
 customer_email: body.email,
 allow_promotion_codes: true,
 metadata: {
 tier,
 siteUrl: body.url ?? "",
 },
 payment_intent_data: {
 metadata: { tier, siteUrl: body.url ?? "" },
 },
 });

 if (!session.url) {
 return NextResponse.json({ ok: false, error: "stripe didn't return a checkout url" }, { status: 502 });
 }

 return NextResponse.json({ ok: true, url: session.url });
 } catch (err) {
 return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
 }
}
