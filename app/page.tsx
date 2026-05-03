import { Hero } from "@/components/hero";
import { WhyOwn } from "@/components/why-own";
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
import Link from "next/link";

export default function HomePage() {
 return (
 <>
 <JsonLd data={[organizationSchema(), websiteSchema(), serviceSchema()]} />
 <Hero />
 <WhyOwn />
 <AiKit />
 <FeatureGrid />
 <ComparisonTable />

 <Section>
 <Eyebrow>Cost calculator</Eyebrow>
 <h2 className="h-section text-3xl md:text-5xl max-w-3xl mb-3">
 Plug in your numbers. <span className="text-ink/40">See what you&apos;d save.</span>
 </h2>
 <p className="text-ink-soft max-w-2xl mb-10">
 We default to mid-tier plans because most small businesses are paying more than they realize. Adjust to match yours.
 </p>
 <CostCalculator />
 </Section>

 <PricingTable />
 <SocialProof />
 <Faq />

 <Section className="bg-paper-warm">
 <div className="rounded-2xl bg-ink text-paper p-10 md:p-16 text-center">
 <h2 className="h-section text-3xl md:text-5xl max-w-3xl mx-auto mb-5">
 Stop renting your website.
 </h2>
 <p className="text-paper/70 max-w-xl mx-auto mb-8">
 Paste your URL at the top. We&apos;ll show you a preview. For free, in seconds.
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
