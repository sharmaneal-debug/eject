import type { Metadata } from "next";
import { Hero } from "@/components/hero";
import { WhyOwn } from "@/components/why-own";
import { ChatVsDev } from "@/components/chat-vs-dev";
import { FeatureGrid } from "@/components/feature-grid";
import { ComparisonTable } from "@/components/comparison-table";
import { CostCalculator } from "@/components/cost-calculator";
import { AiKit } from "@/components/ai-kit";
import { PricingTable } from "@/components/pricing-table";
import { SocialProof } from "@/components/social-proof";
import { Faq } from "@/components/faq";
import { Section, Eyebrow } from "@/components/section";
import { JsonLd } from "@/components/json-ld";
import { organizationSchema, websiteSchema, serviceSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { ScopeLimits } from "@/components/scope-limits";
import Link from "next/link";

export const metadata: Metadata = pageMetadata({
 title: siteConfig.tagline,
 description: siteConfig.description,
 path: "/",
});

export default function HomePage() {
 return (
 <>
 <JsonLd data={[organizationSchema(), websiteSchema(), serviceSchema()]} />
 <Hero />
 <WhyOwn />
 <ChatVsDev />
 <AiKit />
 <FeatureGrid />
 <ComparisonTable />

 <Section>
 <Eyebrow>Cost calculator</Eyebrow>
 <h2 className="h-section text-3xl md:text-5xl max-w-3xl mb-3">
 After you can edit by chatting, <span className="text-ink/40">what does the renewal cost?</span>
 </h2>
 <p className="text-ink-soft max-w-2xl mb-10">
 The fee buttons default to ${siteConfig.pricing.express.price} ({siteConfig.pricing.express.name}) and ${siteConfig.pricing.concierge.price} ({siteConfig.pricing.concierge.name}). Platform prices are published list prices, with a source link and the date we checked them. Blank means we didn&apos;t find that number.
 </p>
 <CostCalculator />
 </Section>

 <PricingTable />
 <SocialProof />
 <Faq />
 <ScopeLimits />

 <Section className="bg-paper-warm">
 <div className="rounded-2xl bg-ink text-paper p-10 md:p-16 text-center">
 <h2 className="h-section text-3xl md:text-5xl max-w-3xl mx-auto mb-5">
 Edit the next version by chatting.
 </h2>
 <p className="text-paper/70 max-w-xl mx-auto mb-8">
 {siteConfig.editing.lead} The scan names the platform and a rough page count. It is not a preview of a rebuilt site.
 </p>
 <Link
 href="/"
 className="inline-flex items-center justify-center rounded-lg bg-signal text-paper px-6 py-3 text-sm font-medium hover:bg-paper hover:text-ink transition"
 >
 Scan my site →
 </Link>
 </div>
 </Section>
 </>
 );
}
