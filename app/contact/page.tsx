import type { Metadata } from "next";
import { CustomPricingLink } from "@/components/custom-pricing-link";
import { Section } from "@/components/section";
import { LEGAL_UPDATED } from "@/lib/legal";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Email ${siteConfig.email}.`,
};

export default function Page() {
  return (
    <Section>
      <h1 className="h-display text-4xl md:text-6xl tracking-tightest">Contact</h1>
      <p className="mt-3 text-ink-soft">Last updated: {LEGAL_UPDATED}.</p>
      <p className="mt-4 text-lg">
        <a className="inline-flex min-h-11 items-center text-base text-accent" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
      </p>
      <p className="mt-4">
        <CustomPricingLink />
      </p>
      <p className="mt-6 text-base text-ink-muted">Operated by {siteConfig.legalEntity.name}. Last updated: {LEGAL_UPDATED}.</p>
    </Section>
  );
}
