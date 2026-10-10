import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section, Eyebrow } from "@/components/section";
import { isMockStripe } from "@/lib/checkout";
import { getOrderStore } from "@/lib/orders";
import { pageMetadata } from "@/lib/seo";
import { tierConfig } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Mock checkout",
  description: "Mock checkout.",
  path: "/checkout/mock",
  index: false,
});

export default async function Page({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  if (!isMockStripe()) notFound();
  const { order: orderId } = await searchParams;
  if (!orderId) notFound();
  const order = await getOrderStore().get(orderId);
  if (!order || order.testMode !== "mock") notFound();
  const cfg = tierConfig(order.tier);
  const paid = order.status !== "pending";

  return (
    <Section>
      <Eyebrow>Stripe test mode · mock</Eyebrow>
      <div className="max-w-xl">
        <h1 className="h-display text-4xl md:text-5xl tracking-tightest mb-4">
          {cfg.name} · ${cfg.price}
        </h1>
        <p className="text-ink-soft text-lg leading-relaxed mb-6">
          No card. No charge. This stand-in exists so the paid flow can be exercised locally without a Stripe account.
          It only runs when <span className="font-mono text-ink">EJECT_STRIPE_MODE=mock</span>.
        </p>
        <div className="rounded-2xl border border-line bg-white p-6 mb-6 text-sm">
          <p>Order <span className="font-mono">{order.id}</span></p>
          <p className="text-ink-muted mt-1">Site: {order.siteUrl || "you'll add this after payment"}</p>
          <p className="text-ink-muted mt-1">Status: {order.status}</p>
        </div>
        {paid ? (
          <Link href={`/checkout/success?session_id=${encodeURIComponent(order.stripeSessionId || "")}`} className="text-accent">
            Continue to your order →
          </Link>
        ) : (
          <form action="/api/checkout/mock-complete" method="post">
            <input type="hidden" name="orderId" value={order.id} />
            <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-ink px-5 text-base font-medium text-paper hover:bg-signal">
              Mark paid · no charge
            </button>
          </form>
        )}
      </div>
    </Section>
  );
}
