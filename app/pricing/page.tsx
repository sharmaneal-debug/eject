import type { Metadata } from "next";
import { Faq } from "@/components/faq";
import { PricingTable } from "@/components/pricing-table";
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
      <PricingTable />
      <Faq />
    </>
  );
}
