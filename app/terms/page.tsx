import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/section";
import { LEGAL_UPDATED } from "@/lib/legal";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms for Eject, operated by ${siteConfig.legalEntity.name}.`,
};

const lines = [
  ["The service", "We move a simple public site onto files you host."],
  ["Price", `Automated is $${siteConfig.pricing.express.price}. Done for you is $${siteConfig.pricing.concierge.price}. Simple sites, about ${siteConfig.pricing.concierge.cap.pages} pages.`],
  ["Your part", "You need rights to the content. Domain and DNS stay yours."],
  ["Refunds", "Email us. A person sends any refund."],
  ["Ownership", "You own the files we deliver."],
  ["Limits", "We do not promise a visual match or a ranking change."],
  ["Liability", "Liability is capped at what you paid us in the prior 12 months, where the law allows."],
  ["Law", `${siteConfig.legalEntity.name} is the company name in this repo. No state is named here.`],
] as const;

export default function Page() {
  return (
    <Section>
      <h1 className="h-display text-4xl md:text-6xl tracking-tightest">Terms</h1>
      <p className="mt-2 text-ink-soft">Last updated: {LEGAL_UPDATED}.</p>
      <div className="max-w-xl mt-6">
        {lines.map(([title, line]) => (
          <div key={title} className="border-t border-line py-3">
            <h2 className="text-lg">{title}</h2>
            <p className="text-sm text-ink-soft">{line}</p>
          </div>
        ))}
        <p className="text-sm mt-4">
          <Link className="text-accent" href="/privacy">Privacy</Link>
          {" · "}
          <Link className="text-accent" href="/refunds">Refunds</Link>
          {" · "}
          <Link className="text-accent" href="/disclaimers">Disclaimers</Link>
        </p>
        <p className="text-xs text-ink-muted mt-4">Operated by {siteConfig.legalEntity.name}. Last updated: {LEGAL_UPDATED}.</p>
      </div>
    </Section>
  );
}
