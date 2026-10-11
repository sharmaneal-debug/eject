import type { Metadata } from "next";
import Link from "next/link";
import { Section, Eyebrow } from "@/components/section";
import { LEGAL_UPDATED } from "@/lib/legal";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Refunds",
  description: "Email us to ask for a refund. We send it to the original payment method.",
  path: "/refunds",
});

export default function Page() {
  return (
    <Section>
      <Eyebrow>Refunds</Eyebrow>
      <h1 className="h-display text-4xl md:text-6xl tracking-tightest mb-2">Refunds</h1>
      <p className="text-ink-soft mb-8">Last updated: {LEGAL_UPDATED}.</p>
      <div className="max-w-2xl">
        <div className="border-t border-line py-4">
          <h2 className="text-lg text-ink">Ask</h2>
          <p className="text-sm text-ink-soft mt-1">Email {siteConfig.email} with the site URL and the charge date.</p>
        </div>
        <div className="border-t border-line py-4">
          <h2 className="text-lg text-ink">When</h2>
          <p className="text-sm text-ink-soft mt-1">We refund if nothing was delivered, you ask within 14 days of delivery, or the site is out of scope.</p>
        </div>
        <div className="border-t border-line py-4">
          <h2 className="text-lg text-ink">How</h2>
          <p className="text-sm text-ink-soft mt-1">We send refunds to the original payment method within 5 business days of approving your request.</p>
        </div>
        <div className="border-t border-line py-4">
          <h2 className="text-lg text-ink">Timing</h2>
          <p className="text-sm text-ink-soft mt-1">Your bank may take longer to show it.</p>
        </div>
        <p className="text-sm mt-6"><Link className="text-accent" href="/terms">Terms</Link></p>
        <p className="text-xs text-ink-muted mt-4">Operated by {siteConfig.legalEntity.name}. Last updated: {LEGAL_UPDATED}.</p>
      </div>
    </Section>
  );
}
