import type { Metadata } from "next";
import { CostCalculator } from "@/components/cost-calculator";
import { ScopeLimits } from "@/components/scope-limits";
import { Section, Eyebrow } from "@/components/section";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { PRICING_LAST_CHECKED, SELF_HOSTED } from "@/lib/pricing/platforms";

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
 <h1 className="h-display text-5xl md:text-7xl tracking-tightest max-w-4xl mb-5">
 Edit by chatting. <span className="text-signal">Then stop the renewal.</span>
 </h1>
 <p className="text-ink-soft max-w-2xl text-lg">
 {siteConfig.editing.lead} The fee buttons default to ${siteConfig.pricing.express.price} ({siteConfig.pricing.express.name}) and ${siteConfig.pricing.concierge.price} ({siteConfig.pricing.concierge.name}). Every plan price was read from the vendor&apos;s site on {PRICING_LAST_CHECKED}. If a billing option wasn&apos;t published, the calculator leaves it blank.
 </p>
 </Section>
 <Section>
 <CostCalculator />
 <div className="mt-12 grid md:grid-cols-3 gap-5 text-sm text-ink-soft">
 <div className="rounded-xl border border-line bg-paper-warm p-6">
 <p className="font-medium text-ink mb-1">What we count</p>
 <p>The vendor&apos;s published plan price only. Extra seats, taxes, and add-ons are excluded. The domain is excluded because you pay a registrar either way.</p>
 </div>
 <div className="rounded-xl border border-line bg-paper-warm p-6">
 <p className="font-medium text-ink mb-1">Self-hosted side</p>
 <p>{SELF_HOSTED.assumption}</p>
 </div>
 <div className="rounded-xl border border-line bg-paper-warm p-6">
 <p className="font-medium text-ink mb-1">What this is not</p>
 <p>A quote for a store or a CMS migration. {siteConfig.pricing.express.name} is an automated simple-site move you review before DNS. Plans marked out of scope stay on the list so you can see the bill.</p>
 </div>
 </div>
 </Section>
 <ScopeLimits compact />
 </>
 );
}
