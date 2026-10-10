import { Section, Eyebrow } from "./section";
import { Check } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/cn";
import { CheckoutLink } from "./checkout-link";

const tiers = [siteConfig.pricing.express, siteConfig.pricing.concierge];

export function PricingTable() {
 return (
 <Section className="bg-paper-warm">
 <Eyebrow>Pricing</Eyebrow>
 <h2 className="h-section text-3xl md:text-5xl max-w-3xl mb-3">
 Edit by chatting. <span className="text-ink/40">Two ways to get there.</span>
 </h2>
 <p className="text-ink-soft max-w-2xl mb-12">
 {siteConfig.editing.lead} {siteConfig.editing.included} Both prices are one payment. We don&apos;t bill a monthly editor.
 </p>

 <div className="grid md:grid-cols-2 gap-5">
 {tiers.map((t) => {
 const accent = t.id === "concierge"; // Concierge featured (premium upsell)
 return (
 <div
 key={t.id}
 className={cn(
 "rounded-2xl bg-white p-7 md:p-9 flex flex-col border",
 accent ? "border-ink shadow-[0_24px_60px_-24px_rgba(11,11,15,0.15)]" : "border-line"
 )}
 >
 <div className="flex items-baseline justify-between mb-1">
 <h3 className="font-semibold text-xl tracking-tight">{t.name}</h3>
 {accent && (
 <span className="text-[10px] font-mono uppercase tracking-widest bg-signal text-paper rounded-full px-2 py-0.5">
 Most popular
 </span>
 )}
 </div>
 <p className="text-ink-muted mb-5">{t.blurb}</p>
 <div className="flex items-baseline gap-1 mb-6">
 <span className="text-5xl h-display tracking-tightest">${t.price}</span>
 <span className="text-ink-muted text-sm">one-time</span>
 </div>
 <ul className="space-y-3 mb-7 text-sm flex-1">
 {t.bullets.map((b) => (
 <li key={b} className="flex items-start gap-2.5">
 <Check className="h-4 w-4 text-signal mt-0.5 shrink-0" />
 <span className="text-ink-soft">{b}</span>
 </li>
 ))}
 </ul>
 <CheckoutLink
 tier={t.id}
 className={cn(
 "rounded-xl px-5 py-3.5 text-sm font-medium text-center transition",
 accent ? "bg-ink text-paper hover:bg-signal" : "bg-paper-warm text-ink hover:bg-ink hover:text-paper"
 )}
 >
 {t.cta} →
 </CheckoutLink>
 </div>
 );
 })}
 </div>

 <div className="mt-10 max-w-3xl text-sm text-ink-muted leading-relaxed">
 <p className="mb-2"><span className="font-medium text-ink">What&apos;s the real difference?</span></p>
 <p>
 <strong className="text-ink">{siteConfig.pricing.express.name} (${siteConfig.pricing.express.price}):</strong> {siteConfig.pricing.express.blurb}
 </p>
 <p className="mt-2">
 <strong className="text-ink">{siteConfig.pricing.concierge.name} (${siteConfig.pricing.concierge.price}):</strong> {siteConfig.pricing.concierge.blurb}
 </p>
 </div>
 </Section>
 );
}
