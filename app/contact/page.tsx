import type { Metadata } from "next";
import { Section, Eyebrow } from "@/components/section";
import { LEGAL_UPDATED } from "@/lib/legal";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Email ${siteConfig.email}.`,
};

export default function Page() {
  return (
    <Section>
      <Eyebrow>Support</Eyebrow>
      <h1 className="h-display text-4xl md:text-6xl tracking-tightest mb-2">Contact</h1>
      <p className="text-ink-soft mb-6">Last updated: {LEGAL_UPDATED}.</p>
      <p className="text-lg">
        <a className="inline-flex min-h-12 items-center text-accent" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
      </p>
      <p className="text-xs text-ink-muted mt-6">Operated by {siteConfig.legalEntity.name}. Last updated: {LEGAL_UPDATED}.</p>
    </Section>
  );
}
