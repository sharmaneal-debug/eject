import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { Section, Eyebrow } from "@/components/section";
import { CheckoutForm } from "@/components/checkout-form";
import { isValidTier, type Tier } from "@/lib/stripe";

export const runtime = "edge";

export const metadata: Metadata = {
 title: "Checkout",
 description: "One payment. We start the migration.",
};

export default async function Page({ searchParams }: { searchParams: Promise<{ tier?: string; url?: string }> }) {
 const sp = await searchParams;
 const tier: Tier = isValidTier(sp.tier) ? sp.tier : "express";
 const config = tier === "concierge" ? siteConfig.pricing.concierge : siteConfig.pricing.express;
 const otherTier: Tier = tier === "concierge" ? "express" : "concierge";
 const otherConfig = tier === "concierge" ? siteConfig.pricing.express : siteConfig.pricing.concierge;

 return (
 <Section>
 <Eyebrow>Checkout</Eyebrow>
 <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-start">
 <div>
 <h1 className="h-display text-4xl md:text-6xl tracking-tightest mb-6 max-w-xl">
 {config.name}.
 </h1>

 <div className="rounded-2xl border border-line bg-paper-warm p-6 md:p-7 mb-6">
 <div className="flex items-baseline justify-between mb-4">
 <p className="text-sm font-medium">{config.name}</p>
 <p className="text-3xl h-section tracking-tightest">${config.price}</p>
 </div>
 <p className="text-ink-soft text-sm mb-5 leading-relaxed">{config.blurb}</p>
 <ul className="space-y-2.5 text-sm">
 {config.bullets.map((b) => (
 <li key={b} className="flex items-start gap-2 text-ink-soft">
 <span className="text-signal mt-0.5">·</span>
 <span>{b}</span>
 </li>
 ))}
 </ul>
 </div>

 <p className="text-sm text-ink-muted mb-2">Want the other one instead?</p>
 <Link
 href={`/checkout?tier=${otherTier}${sp.url ? `&url=${encodeURIComponent(sp.url)}` : ""}`}
 className="text-sm font-medium text-accent hover:text-signal"
 >
 Switch to {otherConfig.name} (${otherConfig.price}) →
 </Link>

 <div className="mt-12 grid sm:grid-cols-3 gap-3 text-xs text-ink-muted font-mono uppercase tracking-widest">
 <span>· No subscription</span>
 <span>· 14-day refund</span>
 <span>{tier === "concierge" ? "· 7-day delivery" : "· Auto-build"}</span>
 </div>
 </div>

 <CheckoutForm tier={tier} prefilledUrl={sp.url} />
 </div>
 </Section>
 );
}
