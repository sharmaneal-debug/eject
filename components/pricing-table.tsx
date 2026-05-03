import Link from "next/link";
import { Section, Eyebrow } from "./section";
import { Check } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/cn";

const tiers = [siteConfig.pricing.dfy, siteConfig.pricing.diy];

export function PricingTable() {
  return (
    <Section className="bg-paper-warm">
      <Eyebrow>Pricing</Eyebrow>
      <h2 className="h-section text-3xl md:text-5xl max-w-3xl mb-3">
        Two options. <span className="text-ink/40">Both are one payment.</span>
      </h2>
      <p className="text-ink-soft max-w-2xl mb-12">
        Pick what fits. Either way, you&apos;ll never get a monthly bill from us.
      </p>

      <div className="grid md:grid-cols-2 gap-5">
        {tiers.map((t, i) => {
          const accent = i === 0; // DFY featured
          return (
            <div
              key={t.id}
              className={cn(
                "rounded-2xl bg-white p-7 md:p-9 flex flex-col border",
                accent ? "border-ink shadow-[0_24px_60px_-24px_rgba(11,11,15,0.15)]" : "border-line"
              )}
            >
              <div className="flex items-baseline justify-between mb-1">
                <h3 className="font-semibold text-xl tracking-tight">{t.name}</h3>
                {accent && (
                  <span className="text-[10px] font-mono uppercase tracking-widest bg-signal text-paper rounded-full px-2 py-0.5">
                    Most popular
                  </span>
                )}
              </div>
              <p className="text-ink-muted mb-5">{t.blurb}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl h-display tracking-tightest">${t.price}</span>
                <span className="text-ink-muted text-sm">one-time</span>
              </div>
              <ul className="space-y-3 mb-7 text-sm flex-1">
                {t.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-signal mt-0.5 shrink-0" />
                    <span className="text-ink-soft">{b}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/checkout?tier=${t.id}`}
                className={cn(
                  "rounded-xl px-5 py-3.5 text-sm font-medium text-center transition",
                  accent ? "bg-ink text-paper hover:bg-signal" : "bg-paper-warm text-ink hover:bg-ink hover:text-paper"
                )}
              >
                {t.cta} →
              </Link>
            </div>
          );
        })}
      </div>

      <div className="mt-10 max-w-3xl text-sm text-ink-muted leading-relaxed">
        <p className="mb-2"><span className="font-medium text-ink">Why is &quot;do it yourself&quot; more expensive?</span></p>
        <p>
          Because it&apos;s a complete kit you keep forever — your website files, a video walkthrough, and AI instructions you can paste into ChatGPT or Claude to make changes whenever you want. The cheaper option is just &quot;we move you over and hand you the keys.&quot;
        </p>
      </div>
    </Section>
  );
}
