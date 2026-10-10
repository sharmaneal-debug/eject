import type { Metadata } from "next";
import Link from "next/link";
import { Section, Eyebrow } from "@/components/section";
import { LEGAL_UPDATED } from "@/lib/legal";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Disclaimers",
  description: "Limits on what Eject promises.",
};

const lines = [
  ["Scan", "A scan reads public pages. It does not move the site."],
  ["Payment", "A payment does not, by itself, publish a preview or change DNS."],
  ["Look", "We do not promise a pixel match to the old site."],
  ["Results", "We do not promise a ranking, speed, or sales result."],
  ["Rights", "You must own the text, images, and brand, or have permission."],
  ["DNS", "Your domain and DNS stay with you unless an order says otherwise."],
  ["AI", "The public scan does not send your site to an AI model."],
] as const;

export default function Page() {
  return (
    <Section>
      <Eyebrow>Disclaimers</Eyebrow>
      <h1 className="h-display text-4xl md:text-6xl tracking-tightest mb-2">Disclaimers</h1>
      <p className="text-ink-soft mb-8">Last updated: {LEGAL_UPDATED}.</p>
      <div className="max-w-2xl">
        {lines.map(([title, line]) => (
          <div key={title} className="border-t border-line py-4">
            <h2 className="text-lg text-ink">{title}</h2>
            <p className="text-sm text-ink-soft mt-1">{line}</p>
          </div>
        ))}
        <p className="text-sm mt-6">
          <Link className="text-accent" href="/terms">Terms</Link>
          {" · "}
          <Link className="text-accent" href="/refunds">Refunds</Link>
        </p>
        <p className="text-xs text-ink-muted mt-4">Operated by {siteConfig.legalEntity.name}. Last updated: {LEGAL_UPDATED}.</p>
      </div>
    </Section>
  );
}
