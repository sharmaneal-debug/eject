import type { Metadata } from "next";
import { PricingTable } from "@/components/pricing-table";
import { Faq } from "@/components/faq";
import { ScopeLimits } from "@/components/scope-limits";
import { Section, Eyebrow } from "@/components/section";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
 title: "Pricing",
 description: `${siteConfig.editing.lead} ${siteConfig.pricing.express.name} is $${siteConfig.pricing.express.price}. ${siteConfig.pricing.concierge.name} is $${siteConfig.pricing.concierge.price}. Simple marketing, portfolio, and landing sites only.`,
 path: "/pricing",
});

export default function PricingPage() {
 return (
 <>
 <Section className="pb-0">
 <Eyebrow>Pricing</Eyebrow>
 <h1 className="h-display text-5xl md:text-7xl tracking-tightest max-w-4xl mb-5">
 Edit by chatting. <span className="text-ink/40">Two one-time prices.</span>
 </h1>
 <p className="text-ink-soft max-w-2xl text-lg">
 {siteConfig.editing.lead} {siteConfig.editing.included} {siteConfig.pricing.express.name} (${siteConfig.pricing.express.price}) is an automated migration of a simple site. {siteConfig.pricing.concierge.name} (${siteConfig.pricing.concierge.price}) is the same kind of site, done by hand inside a cap. You review before DNS. There is no preview before you pay.
 </p>
 </Section>
 <PricingTable />
 <ScopeLimits />
 <Faq />
 </>
 );
}
