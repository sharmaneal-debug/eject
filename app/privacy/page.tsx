import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/section";
import { LEGAL_UPDATED } from "@/lib/legal";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy for Eject, operated by ${siteConfig.legalEntity.name}.`,
};

const lines = [
  ["Collect", "The URL you scan, and the email you send."],
  ["Cards", "Stripe holds the card. We do not."],
  ["Sale", "We do not sell personal information."],
  ["Cookies", "No analytics script loads. The banner stores your choice in this browser."],
  ["Ask", `Email ${siteConfig.email} for a copy or deletion.`],
] as const;

export default function Page() {
  return (
    <Section>
      <h1 className="h-display text-4xl md:text-6xl tracking-tightest">Privacy</h1>
      <p className="mt-2 text-ink-soft">Last updated: {LEGAL_UPDATED}.</p>
      <div className="max-w-xl mt-6">
        {lines.map(([title, line]) => (
          <div key={title} className="border-t border-line py-3">
            <h2 className="text-lg">{title}</h2>
            <p className="text-base text-ink-soft">{line}</p>
          </div>
        ))}
        <p className="mt-4 text-base"><Link className="inline-flex min-h-11 items-center text-accent" href="/terms">Terms</Link></p>
        <p className="mt-4 text-base text-ink-muted">Operated by {siteConfig.legalEntity.name}. Last updated: {LEGAL_UPDATED}.</p>
      </div>
    </Section>
  );
}
