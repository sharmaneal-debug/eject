import type { Metadata } from "next";
import { CostCalculator } from "@/components/cost-calculator";
import { ScopeLimits } from "@/components/scope-limits";
import { Section, Eyebrow } from "@/components/section";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { PRICING_LAST_CHECKED } from "@/lib/pricing/platforms";

export const metadata: Metadata = pageMetadata({
 title: "Renewal savings calculator",
 description:
 "Compare a checked Framer, Webflow, Wix, or Squarespace list price with self-hosting a simple static site. Prices include a source URL and the date they were checked.",
 path: "/calculator",
});

export default function Page() {
 return (
 <>
 <Section className="pb-0">
 <Eyebrow>Cost calculator</Eyebrow>
 <h1 className="h-display text-5xl md:text-7xl tracking-tightest max-w-4xl">Savings</h1>
 <p className="mt-3 text-ink-soft">Compared with a ${siteConfig.pricing.express.price} move. Checked {PRICING_LAST_CHECKED}.</p>
 </Section>
 <Section>
 <CostCalculator />
 </Section>
 <ScopeLimits compact />
 </>
 );
}
