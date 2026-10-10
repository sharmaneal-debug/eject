import type { Metadata } from "next";
import { LeadForm } from "@/components/lead-form";
import { ScopeLimits } from "@/components/scope-limits";
import { Section, Eyebrow } from "@/components/section";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Ask about a simple site",
  description:
    "Tell us about a marketing, portfolio, or landing page on Framer, Webflow, Wix, or Squarespace. We reply about fit. We don't record a preview.",
  path: "/migrate",
});

export default function Page() {
  return (
    <>
      <Section>
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-start">
          <div>
            <Eyebrow>Simple sites</Eyebrow>
            <h1 className="h-display text-4xl md:text-6xl tracking-tightest mb-5 max-w-2xl">
              Edit by chatting, after the move.
            </h1>
            <p className="text-ink-soft leading-relaxed max-w-md mb-8 text-lg">
              {siteConfig.editing.lead} If it is a marketing page, a portfolio, or a landing page, we&apos;ll say whether {siteConfig.pricing.express.name} (${siteConfig.pricing.express.price}) or {siteConfig.pricing.concierge.name} (${siteConfig.pricing.concierge.price}) applies. If it is a store or a CMS, we&apos;ll say who to hire instead. This form saves a lead. It does not start a crawl, and it does not book a Loom.
            </p>
            <ol className="space-y-5 max-w-md text-sm">
              <li>
                <p className="font-medium">1. You describe the pages</p>
                <p className="text-ink-muted">A URL and a sentence. No CMS item count, because we don&apos;t extract one.</p>
              </li>
              <li>
                <p className="font-medium">2. We answer fit</p>
                <p className="text-ink-muted">In scope, or a referral. We don&apos;t send a rebuilt preview.</p>
              </li>
              <li>
                <p className="font-medium">3. You decide</p>
                <p className="text-ink-muted">The lead is not an order. Checkout is a separate step, and only for a simple site.</p>
              </li>
            </ol>
          </div>
          <LeadForm intent="migrate" source="migrate" />
        </div>
      </Section>
      <ScopeLimits compact />
    </>
  );
}
