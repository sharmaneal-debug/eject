import type { Metadata } from "next";
import { faqItems, Faq } from "@/components/faq";
import { JsonLd } from "@/components/json-ld";
import { PricingTable } from "@/components/pricing-table";
import { faqSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Pricing",
  description: `Automated move of a simple site for $${siteConfig.pricing.express.price}.`,
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <>
      <JsonLd data={faqSchema(faqItems)} />
      <section className="mx-auto max-w-content min-w-0 px-4 pb-4 pt-10 sm:px-6 md:pt-16">
        <h1 className="h-display text-4xl md:text-6xl">Pricing</h1>
        <p className="mt-4 text-lg text-ink-soft">One price for a simple site.</p>
      </section>
      <section className="mx-auto max-w-content min-w-0 px-4 py-6 sm:px-6">
        <PricingTable />
      </section>
      <Faq />
    </>
  );
}
