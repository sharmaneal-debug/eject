import type { Metadata } from "next";
import { IntakeForm } from "@/components/intake-form";
import { Section, Eyebrow } from "@/components/section";

export const metadata: Metadata = {
  title: "Start a migration",
  description: "Tell us about your site. We send a free 5-minute Loom audit within 24 hours — no call required.",
};

export default async function Page({ searchParams }: { searchParams: Promise<{ tier?: string }> }) {
  const sp = await searchParams;
  const tier = (sp.tier === "diy" || sp.tier === "dwy" || sp.tier === "dfy" ? sp.tier : "dwy") as
    | "diy"
    | "dwy"
    | "dfy";
  return (
    <Section>
      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12">
        <div>
          <Eyebrow>Free Loom audit</Eyebrow>
          <h1 className="h-display text-4xl md:text-6xl tracking-tightest mb-5 max-w-2xl">
            Tell us about your site.
          </h1>
          <p className="text-ink-soft leading-relaxed max-w-md mb-8 text-lg">
            We&apos;ll record a 5-minute Loom showing your real Lighthouse score, your real annual cost, and what we&apos;d ship. Within 24 hours. No call required.
          </p>

          <div className="space-y-5 max-w-md">
            <div className="flex items-start gap-3">
              <span className="font-mono text-xs text-signal mt-1">01</span>
              <div>
                <p className="font-medium">Your real cost, computed live</p>
                <p className="text-ink-muted text-sm">We total your plan + seats + add-ons + likely overages.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-mono text-xs text-signal mt-1">02</span>
              <div>
                <p className="font-medium">A side-by-side preview</p>
                <p className="text-ink-muted text-sm">Your current site next to a rough Next.js rebuild on a preview URL.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-mono text-xs text-signal mt-1">03</span>
              <div>
                <p className="font-medium">A clear path forward</p>
                <p className="text-ink-muted text-sm">DIY $49, Done-with-You $299, or Done-for-You $1,499. Or none. Loom doesn&apos;t commit you.</p>
              </div>
            </div>
          </div>
        </div>

        <IntakeForm defaultTier={tier} />
      </div>
    </Section>
  );
}
