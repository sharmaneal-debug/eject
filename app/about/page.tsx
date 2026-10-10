import type { Metadata } from "next";
import { Section, Eyebrow } from "@/components/section";
import { ScopeLimits } from "@/components/scope-limits";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import Link from "next/link";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description: "Eject helps people leave a simple marketing, portfolio, or landing site. We don't extract a CMS or migrate a store.",
  path: "/about",
});

export default function Page() {
  return (
    <>
      <Section>
        <Eyebrow>About</Eyebrow>
        <h1 className="h-display text-4xl md:text-6xl tracking-tightest mb-7 max-w-3xl">
          Edit by chatting. <span className="text-ink/40">A narrow service.</span>
        </h1>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl">
          <div className="space-y-4 text-ink-soft leading-relaxed">
            <h2 className="text-2xl h-section text-ink mb-3">Why this exists</h2>
            <p>
              A simple site — a homepage, a portfolio, a landing page — does not need a monthly builder bill. The files can live on a free static host. The hard part is getting the pages out without pretending the export is one click.
            </p>
            <p>
              {siteConfig.legalEntity.name} runs Eject so that after the move you edit by chatting with your own AI. {siteConfig.pricing.express.name} (${siteConfig.pricing.express.price}) is an automated migration of a simple site, reviewed before DNS. {siteConfig.pricing.concierge.name} (${siteConfig.pricing.concierge.price}) is that move, done by hand inside a cap. We do not extract a CMS, migrate a store, or show a preview before you pay.
            </p>
          </div>
          <div>
            <h2 className="text-2xl h-section mb-3">What we won&apos;t pretend</h2>
            <ul className="space-y-2 text-ink-soft">
              <li>· That a scan is a preview of a rebuilt site.</li>
              <li>· That we lift a CMS, a store, or a member area.</li>
              <li>· That PageSpeed or rankings move by a fixed number of points.</li>
              <li>· That we host the site or keep an editor subscription.</li>
              <li>· That a quote without a source is a price.</li>
            </ul>
          </div>
        </div>
      </Section>
      <ScopeLimits />
      <Section>
        <div className="rounded-2xl bg-ink text-paper p-10 md:p-14 text-center">
          <h2 className="h-section text-3xl md:text-4xl mb-4">Watch the renewal instead of guessing.</h2>
          <p className="text-paper/70 max-w-xl mx-auto mb-7">
            90, 60, and 30 days before the invoice. Simple sites only.
          </p>
          <Link
            href="/renewal-watch"
            className="inline-flex items-center justify-center rounded-lg bg-signal text-paper px-6 py-3 text-sm font-medium hover:bg-paper hover:text-ink transition"
          >
            Open renewal watch →
          </Link>
        </div>
      </Section>
    </>
  );
}
