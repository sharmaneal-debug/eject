import type { Metadata } from "next";
import Link from "next/link";
import { Section, Eyebrow } from "@/components/section";
import { LEGAL_UPDATED } from "@/lib/legal";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms for Eject, operated by ${siteConfig.legalEntity.name}.`,
};

const lines = [
  ["The service", "We help you move a simple public site onto files you can host yourself."],
  ["Payment", "This website does not take payment."],
  ["Your part", "You need rights to the content. Your domain and DNS stay yours."],
  ["Refunds", "We send refunds to the original payment method within 5 business days of approving your request."],
  ["Ownership", "You own the files we deliver. We keep the Eject brand and this website."],
  ["Limits", "We do not promise a visual match or a ranking change."],
  ["Liability", "Liability is capped at what you paid us in the prior 12 months, except where the law forbids a cap."],
  ["Who we are", `Eject is operated by ${siteConfig.legalEntity.name}. Contact: ${siteConfig.email}.`],
] as const;

export default function Page() {
  return (
    <Section>
      <Eyebrow>Terms</Eyebrow>
      <h1 className="h-display text-4xl md:text-6xl tracking-tightest mb-2">Terms of Service</h1>
      <p className="text-ink-soft mb-8">Last updated: {LEGAL_UPDATED}.</p>
      <div className="max-w-2xl">
        {lines.map(([title, line]) => (
          <div key={title} className="border-t border-line py-4">
            <h2 className="text-lg text-ink">{title}</h2>
            <p className="text-sm text-ink-soft mt-1">{line}</p>
          </div>
        ))}
        <details className="border-t border-line py-4">
          <summary className="text-lg text-ink cursor-pointer">More</summary>
          <dl className="mt-3 space-y-3 text-sm text-ink-soft">
            <div>
              <dt className="text-ink">Old platform</dt>
              <dd>Their terms still apply. We do not cancel that account.</dd>
            </div>
            <div>
              <dt className="text-ink">AI</dt>
              <dd>The public scan does not send your site to an AI model.</dd>
            </div>
            <div>
              <dt className="text-ink">Tax</dt>
              <dd>Sales tax may be added where required.</dd>
            </div>
            <div>
              <dt className="text-ink">Chargebacks</dt>
              <dd>Email us before you dispute a charge with your bank.</dd>
            </div>
          </dl>
        </details>
        <p className="text-sm text-ink-muted mt-6">
          <Link className="text-accent" href="/privacy">Privacy</Link>
          {" · "}
          <Link className="text-accent" href="/refunds">Refunds</Link>
          {" · "}
          <Link className="text-accent" href="/disclaimers">Disclaimers</Link>
          {" · "}
          <Link className="text-accent" href="/contact">Contact</Link>
        </p>
        <p className="text-xs text-ink-muted mt-4">Operated by {siteConfig.legalEntity.name}. Last updated: {LEGAL_UPDATED}.</p>
      </div>
    </Section>
  );
}
