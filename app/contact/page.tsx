import type { Metadata } from "next";
import { Section, Eyebrow } from "@/components/section";
import { supportEmail } from "@/lib/support";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Support email for Eject.",
};

export default function Page() {
  const email = supportEmail();
  return (
    <Section>
      <Eyebrow>Support</Eyebrow>
      <h1 className="h-display text-4xl md:text-6xl tracking-tightest mb-4">Contact</h1>
      <p className="text-ink-soft text-lg max-w-2xl mb-6">
        Email <a className="text-accent" href={`mailto:${email}`}>{email}</a> for an order, a refund, or a question about scope.
        {siteConfig.pricing.concierge.name} calls start on the booking page. {siteConfig.pricing.express.name} checkout is on the pricing page.
      </p>
      <p className="text-sm text-ink-muted max-w-2xl">
        Operated by {siteConfig.legalEntity.name}. The address above is the support inbox.
      </p>
    </Section>
  );
}
