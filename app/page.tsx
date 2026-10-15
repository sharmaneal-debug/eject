import type { Metadata } from "next";
import { BoxScreen } from "@/components/box-screen";
import { CostCalculator } from "@/components/cost-calculator";
import { JsonLd } from "@/components/json-ld";
import { PricingTable } from "@/components/pricing-table";
import { Steps } from "@/components/steps";
import { organizationSchema, productSchema, websiteSchema } from "@/lib/schema";
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
      <JsonLd data={[organizationSchema(), websiteSchema(), productSchema()]} />
      <section className="mx-auto max-w-content min-w-0 px-4 pb-2 pt-10 sm:px-6 md:pt-16">
        <h1 className="h-display max-w-3xl text-4xl sm:text-5xl lg:text-6xl">Move a simple site. $99.</h1>
        <p className="mt-4 text-lg text-ink-soft">One-time. You own the files.</p>
      </section>
      <section className="mx-auto max-w-content min-w-0 px-4 py-6 sm:px-6">
        <CostCalculator initialPlatform="framer" initialPlanId="pro" />
      </section>
      <section className="mx-auto max-w-content min-w-0 px-4 py-6 sm:px-6">
        <Steps />
        <div className="mt-4">
          <BoxScreen />
        </div>
      </section>
      <section className="mx-auto max-w-content min-w-0 px-4 py-6 pb-12 sm:px-6">
        <PricingTable />
      </section>
    </>
  );
}
