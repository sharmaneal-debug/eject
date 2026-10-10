import type { Metadata } from "next";
import { Faq } from "@/components/faq";
import { PricingTable } from "@/components/pricing-table";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Pricing",
  description: `Automated $${siteConfig.pricing.express.price}. Done for you $${siteConfig.pricing.concierge.price}. Simple sites, about 10 pages.`,
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <>
      <section className="mx-auto max-w-content px-6 pb-4 pt-12 md:pt-16">
        <h1 className="h-display text-4xl md:text-6xl">Pricing</h1>
        <p className="mt-4 text-lg text-ink-soft">Two ways to move a simple site.</p>
      </section>
      <section className="mx-auto max-w-content px-6 py-8">
        <PricingTable />
      </section>
      <Faq />
    </>
  );
}
