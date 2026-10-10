import Link from "next/link";
import { siteConfig, doneForYouCapLabel } from "@/lib/site";
import { IN_SCOPE_SUMMARY, OUT_OF_SCOPE } from "@/lib/scope";
import { Section, Eyebrow } from "./section";
import { LeadForm } from "./lead-form";

export function ScopeLimits({ compact = false }: { compact?: boolean }) {
  return (
    <Section className={compact ? "py-12 md:py-16" : "bg-paper-warm"}>
      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start">
        <div>
          <Eyebrow>What we don&apos;t do</Eyebrow>
          <h2 className="h-section text-3xl md:text-5xl max-w-xl mb-4">
            Simple sites only. <span className="text-ink/40">We refer the rest out.</span>
          </h2>
          <p className="text-ink-soft max-w-xl text-lg leading-relaxed mb-8">{IN_SCOPE_SUMMARY}</p>
          <ul className="space-y-4">
            {OUT_OF_SCOPE.map((item) => (
              <li key={item.title} className="rounded-xl border border-line bg-white p-5">
                <p className="font-semibold tracking-tight">{item.title}</p>
                <p className="text-sm text-ink-soft mt-1 leading-relaxed">{item.detail}</p>
                <p className="text-sm text-ink mt-2 leading-relaxed">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-signal">Refer out · </span>
                  {item.referTo}
                </p>
              </li>
            ))}
          </ul>
          <p className="text-sm text-ink-muted mt-6 max-w-xl">
            {siteConfig.editing.lead} {siteConfig.pricing.express.name} (${siteConfig.pricing.express.price}) is an automated migration you review before DNS. {siteConfig.pricing.concierge.name} (${siteConfig.pricing.concierge.price}) is done by hand: {doneForYouCapLabel()}. There is no preview before you pay.{" "}
            <Link href="/how-it-works" className="text-accent hover:text-signal">
              How a simple-site move actually works
            </Link>
            .
          </p>
        </div>
        <LeadForm />
      </div>
    </Section>
  );
}
