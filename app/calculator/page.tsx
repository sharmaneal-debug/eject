import type { Metadata } from "next";
import { CostCalculator } from "@/components/cost-calculator";
import { pageMetadata } from "@/lib/seo";
import { PRICING_LAST_CHECKED } from "@/lib/pricing/platforms";

export const metadata: Metadata = pageMetadata({
  title: "Savings",
  description: "Checked platform prices versus a simple self-hosted site.",
  path: "/calculator",
});

export default function Page() {
  return (
    <section className="mx-auto max-w-content min-w-0 px-4 py-10 sm:px-6 md:py-16">
      <h1 className="h-display text-4xl md:text-6xl">Savings</h1>
      <p className="mt-4 text-lg text-ink-soft">Checked {PRICING_LAST_CHECKED}.</p>
      <div className="mt-8">
        <CostCalculator initialPlatform="framer" initialPlanId="pro" />
      </div>
    </section>
  );
}
