import type { Metadata } from "next";
import { CostCalculator } from "@/components/cost-calculator";
import { Faq } from "@/components/faq";
import { JsonLd } from "@/components/json-ld";
import { PricingTable } from "@/components/pricing-table";
import { Steps } from "@/components/steps";
import { organizationSchema, serviceSchema, websiteSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: siteConfig.tagline,
  description: siteConfig.description,
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={[organizationSchema(), websiteSchema(), serviceSchema()]} />
      <section className="mx-auto max-w-content px-6 pb-2 pt-12 md:pt-16">
        <h1 className="h-display max-w-3xl text-4xl sm:text-5xl md:text-6xl">Move a simple site. Keep the files.</h1>
        <p className="mt-4 max-w-xl text-lg text-ink-soft">Simple sites only. About 10 pages.</p>
      </section>
      <section className="mx-auto max-w-content px-6 py-8">
        <CostCalculator initialPlatform="framer" initialPlanId="pro" />
      </section>
      <section className="mx-auto max-w-content px-6 py-8 md:py-12">
        <Steps />
      </section>
      <section className="mx-auto max-w-content px-6 py-8 md:py-12">
        <PricingTable />
      </section>
      <Faq />
    </>
  );
}
