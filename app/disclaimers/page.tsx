import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/section";
import { LEGAL_UPDATED } from "@/lib/legal";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = { title: "Disclaimers", description: "What Eject does not promise." };

const lines = [
  ["Look", "We do not promise a pixel match."],
  ["Results", "We do not promise rankings, speed, or sales."],
  ["Rights", "You must have rights to the content."],
  ["DNS", "Your domain stays with you unless an order says otherwise."],
  ["AI", "The public site does not send your pages to an AI model by itself."],
] as const;

export default function Page() {
  return (
    <Section>
      <h1 className="h-display text-4xl md:text-6xl tracking-tightest">Disclaimers</h1>
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
