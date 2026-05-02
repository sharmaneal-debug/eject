import { Hero } from "@/components/hero";
import { MarqueePlatforms } from "@/components/marquee-platforms";
import { CostCalculator } from "@/components/cost-calculator";
import { FeatureGrid } from "@/components/feature-grid";
import { ComparisonTable } from "@/components/comparison-table";
import { PricingTable } from "@/components/pricing-table";
import { SocialProof } from "@/components/social-proof";
import { Faq } from "@/components/faq";
import { Section, Eyebrow } from "@/components/section";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <Hero />
      <MarqueePlatforms />

      <Section>
        <Eyebrow>Cost calculator</Eyebrow>
        <h2 className="h-section text-3xl md:text-5xl max-w-3xl mb-3">
          See your real bill. <span className="text-ink/40">Then see ours.</span>
        </h2>
        <p className="text-ink-soft max-w-2xl mb-10">
          Plug in what you pay today. The math updates as you type. No email gate, no signup.
        </p>
        <CostCalculator />
      </Section>

      <FeatureGrid />
      <ComparisonTable />
      <PricingTable />
      <SocialProof />
      <Faq />

      <Section className="bg-paper-warm">
        <div className="rounded-2xl bg-ink text-paper p-10 md:p-16 text-center">
          <h2 className="h-section text-3xl md:text-5xl max-w-3xl mx-auto mb-5">
            Ready to stop renting your website?
          </h2>
          <p className="text-paper/70 max-w-xl mx-auto mb-8">
            Free 5-minute Loom audit. No call required. We send it within 24 hours.
          </p>
          <Link
            href="/migrate"
            className="inline-flex items-center justify-center rounded-lg bg-signal text-paper px-6 py-3 text-sm font-medium hover:bg-paper hover:text-ink transition"
          >
            Start a free audit →
          </Link>
        </div>
      </Section>
    </>
  );
}
