import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { siteConfig } from "@/lib/site";
import { Section, Eyebrow } from "@/components/section";
import { getStripe, priceIdForTier, isValidTier, tierConfig, type Tier } from "@/lib/stripe";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Checkout",
  description: "One payment. Your kit lands in your inbox in seconds.",
};

// Server-side flow: this route creates a Stripe Checkout Session and 303s
// the user to Stripe-hosted Checkout. No intake form. Stripe collects email
// + name + payment; we capture the chosen tier + site URL via session
// metadata. After payment Stripe redirects to /checkout/success.
//
// If Stripe isn't configured (no STRIPE_SECRET_KEY), we render a manual
// fallback page with mailto. Should never happen in production but keeps
// preview deploys from 500-ing.

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; url?: string }>;
}) {
  const sp = await searchParams;
  const tier: Tier = isValidTier(sp.tier) ? sp.tier : "express";
  const cfg = tierConfig(tier);

  const stripe = getStripe();
  if (stripe) {
    const priceId = priceIdForTier(tier);
    if (priceId) {
      try {
        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          line_items: [{ price: priceId, quantity: 1 }],
          success_url: `${siteConfig.url}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${siteConfig.url}/checkout/cancel`,
          allow_promotion_codes: true,
          billing_address_collection: "auto",
          phone_number_collection: { enabled: false },
          custom_text: {
            submit: {
              message:
                tier === "express"
                  ? "After payment we email you the playbook + AI prompts within 5 minutes."
                  : "After payment a human emails you within 24 hours to confirm scope.",
            },
          },
          metadata: { tier, siteUrl: sp.url ?? "" },
          payment_intent_data: { metadata: { tier, siteUrl: sp.url ?? "" } },
        });
        if (session.url) {
          redirect(session.url);
        }
      } catch (err) {
        // Surface in logs; render the fallback below.
        console.error("[checkout] stripe session create failed:", err);
      }
    }
  }

  // Fallback when Stripe isn't configured or session creation failed.
  return (
    <Section>
      <Eyebrow>Checkout</Eyebrow>
      <div className="max-w-xl">
        <h1 className="h-display text-4xl md:text-5xl tracking-tightest mb-5">
          {cfg.name} · ${cfg.price}
        </h1>
        <p className="text-ink-soft text-lg leading-relaxed mb-8">
          Stripe checkout is temporarily unavailable. Email{" "}
          <a className="text-accent hover:text-signal" href={`mailto:${siteConfig.email}?subject=${encodeURIComponent(`${cfg.name} · ${sp.url ?? "site URL"}`)}`}>
            {siteConfig.email}
          </a>{" "}
          and we&apos;ll send you a payment link manually within an hour.
        </p>
        <div className="rounded-2xl border border-line bg-paper-warm p-6 mb-8">
          <p className="text-sm font-medium mb-3">{cfg.name} includes:</p>
          <ul className="text-sm space-y-2 text-ink-soft">
            {cfg.bullets.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="text-signal">·</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <Link href="/" className="text-sm text-ink-muted hover:text-ink">
          ← back to home
        </Link>
      </div>
    </Section>
  );
}
