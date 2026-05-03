import type { Metadata } from "next";
import { PricingTable } from "@/components/pricing-table";
import { Faq } from "@/components/faq";
import { Section, Eyebrow } from "@/components/section";

export const metadata: Metadata = {
 title: "Pricing",
 description: "Two options. Both are one payment. No subscription, ever.",
};

export default function PricingPage() {
 return (
 <>
 <Section className="pb-0">
 <Eyebrow>Pricing</Eyebrow>
 <h1 className="h-display text-5xl md:text-7xl tracking-tightest max-w-4xl mb-5">
 Two options. <span className="text-ink/40">No haggling.</span>
 </h1>
 <p className="text-ink-soft max-w-2xl text-lg">
 We move your site, or we give you everything to do it yourself. Both are one payment. Neither is a subscription.
 </p>
 </Section>
 <PricingTable />
 <Faq />
 </>
 );
}
