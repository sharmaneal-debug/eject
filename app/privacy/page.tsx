import type { Metadata } from "next";
import Link from "next/link";
import { Section, Eyebrow } from "@/components/section";
import { LEGAL_UPDATED } from "@/lib/legal";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: `Privacy policy for Eject, operated by ${siteConfig.legalEntity.name}.`,
  path: "/privacy",
});

const lines = [
  ["What we collect", "The URL you scan, and the name and email you send us."],
  ["Payments", "We do not take payment on this website, and we do not store card numbers."],
  ["Use", "We reply and keep records the service requires."],
  ["Sharing", "We do not sell personal information."],
  ["Cookies", "No analytics script loads. The banner stores your choice in this browser."],
  ["Rights", `Email ${siteConfig.email} to ask for a copy or deletion.`],
] as const;

export default function Page() {
  return (
    <Section>
      <Eyebrow>Privacy</Eyebrow>
      <h1 className="h-display text-4xl md:text-6xl tracking-tightest mb-2">Privacy Policy</h1>
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
              <dt className="text-ink">Vendors</dt>
              <dd>Resend if we email. Vercel hosts this site.</dd>
            </div>
            <div>
              <dt className="text-ink">AI</dt>
              <dd>The public scan does not send page content to an AI model.</dd>
            </div>
            <div>
              <dt className="text-ink">Children</dt>
              <dd>This site is not for children under 13.</dd>
            </div>
          </dl>
        </details>
        <p className="text-sm mt-6">
          <Link className="text-accent" href="/terms">Terms</Link>
          {" · "}
          <Link className="text-accent" href="/contact">Contact</Link>
        </p>
        <p className="text-xs text-ink-muted mt-4">Operated by {siteConfig.legalEntity.name}. Last updated: {LEGAL_UPDATED}.</p>
      </div>
    </Section>
  );
}
