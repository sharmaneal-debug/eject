import type { Metadata } from "next";
import { CostCalculator } from "@/components/cost-calculator";
import { Section, Eyebrow } from "@/components/section";

export const metadata: Metadata = {
  title: "Cost calculator — Webflow vs Eject",
  description:
    "Plug in your Webflow / Framer / Wix / Squarespace plan. See the real 36-month cost vs migrating to a self-hosted Next.js site on Cloudflare Pages.",
};

export default function Page() {
  return (
    <>
      <Section className="pb-0">
        <Eyebrow>Cost calculator</Eyebrow>
        <h1 className="h-display text-5xl md:text-7xl tracking-tightest max-w-4xl mb-5">
          Three years on Webflow vs. <span className="text-signal">three years on Eject.</span>
        </h1>
        <p className="text-ink-soft max-w-2xl text-lg">
          Adjust the inputs to match your actual setup. The math updates as you type. Numbers reflect 2026 list pricing on each platform.
        </p>
      </Section>
      <Section>
        <CostCalculator />
        <div className="mt-12 grid md:grid-cols-3 gap-5 text-sm text-ink-soft">
          <div className="rounded-xl border border-line bg-paper-warm p-6">
            <p className="font-medium text-ink mb-1">What we count on Webflow</p>
            <p>Site plan + Workspace seats above the first + bandwidth overages. We don&apos;t count CMS-cap upgrades or form-submission fees — those are extra.</p>
          </div>
          <div className="rounded-xl border border-line bg-paper-warm p-6">
            <p className="font-medium text-ink mb-1">What we count on Eject</p>
            <p>One-time migration fee + optional editor retainer + ~$12/yr domain. Hosting is $0 on Cloudflare Pages free tier.</p>
          </div>
          <div className="rounded-xl border border-line bg-paper-warm p-6">
            <p className="font-medium text-ink mb-1">Caveats we&apos;re honest about</p>
            <p>If you&apos;re on Cloudflare&apos;s paid Pages tier (1M+ requests/day), add $5/mo. The math still wins by 90%+ vs Webflow.</p>
          </div>
        </div>
      </Section>
    </>
  );
}
