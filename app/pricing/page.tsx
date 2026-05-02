import type { Metadata } from "next";
import { PricingTable } from "@/components/pricing-table";
import { Faq } from "@/components/faq";
import { Section, Eyebrow } from "@/components/section";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Three migration tiers from $49 to $1,499. Optional editor retainer from $79/mo. Pay once, own forever.",
};

export default function PricingPage() {
  return (
    <>
      <Section className="pb-0">
        <Eyebrow>Pricing</Eyebrow>
        <h1 className="h-display text-5xl md:text-7xl tracking-tightest max-w-4xl mb-5">
          Productized prices. <span className="text-ink/40">No quotes. No haggling.</span>
        </h1>
        <p className="text-ink-soft max-w-2xl text-lg">
          We sell three SKUs and one optional retainer. That&apos;s it. The migration is one-time. The site is yours forever.
        </p>
      </Section>
      <PricingTable />
      <Faq />
    </>
  );
}
