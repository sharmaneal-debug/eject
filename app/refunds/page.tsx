import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/section";
import { LEGAL_UPDATED } from "@/lib/legal";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Refunds",
  description: "Email us for a refund. A person sends it.",
  path: "/refunds",
});

export default function Page() {
  return (
    <Section>
      <h1 className="h-display text-4xl md:text-6xl tracking-tightest">Refunds</h1>
      <p className="mt-2 text-ink-soft">Last updated: {LEGAL_UPDATED}.</p>
      <div className="max-w-xl mt-6">
        <div className="border-t border-line py-3">
          <h2 className="text-lg">Ask</h2>
          <p className="text-base text-ink-soft">Email {siteConfig.email} with the site URL.</p>
        </div>
        <div className="border-t border-line py-3">
          <h2 className="text-lg">When</h2>
          <p className="text-base text-ink-soft">If nothing was delivered, within 14 days of delivery, or the site is out of scope.</p>
        </div>
        <div className="border-t border-line py-3">
          <h2 className="text-lg">How</h2>
          <p className="text-base text-ink-soft">A person sends it. This site does not refund the card.</p>
        </div>
        <p className="mt-4 text-base"><Link className="inline-flex min-h-11 items-center text-accent" href="/terms">Terms</Link></p>
        <p className="mt-4 text-base text-ink-muted">Operated by {siteConfig.legalEntity.name}. Last updated: {LEGAL_UPDATED}.</p>
      </div>
    </Section>
  );
}
