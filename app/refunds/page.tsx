import type { Metadata } from "next";
import Link from "next/link";
import { Section, Eyebrow } from "@/components/section";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Refunds",
  description: `Refund policy for ${siteConfig.name}. 14 days from delivery of a simple-site move, by email.`,
  path: "/refunds",
});

const faqs = [
  {
    q: "What can be refunded?",
    a: `${siteConfig.pricing.express.name} and ${siteConfig.pricing.concierge.name} payments for a simple marketing, portfolio, or landing site. If we decide the site is a store, a member area, or a heavy CMS after you pay, we refund instead of pretending we can move it.`,
  },
  {
    q: "How long do I have?",
    a: `14 days after we deliver the ${siteConfig.pricing.express.name} pages, or 14 days after the ${siteConfig.pricing.concierge.name} handoff. Email us inside that window.`,
  },
  {
    q: "How do I ask?",
    a: `Email ${siteConfig.email} from the address you paid with. Say what you received and that you want a refund. A person handles it. There is no automatic refund button.`,
  },
  {
    q: "What does a refund not cover?",
    a: "Domain registration, hosting you bought from someone else, and platform invoices you already paid Framer, Webflow, Wix, or Squarespace. We never charged those, so we can't refund them.",
  },
];

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      <JsonLd data={schema} />
      <Section className="pb-0">
        <Eyebrow>Refunds</Eyebrow>
        <h1 className="h-display text-5xl md:text-7xl tracking-tightest max-w-4xl mb-5">
          14 days. <span className="text-ink/40">Email us.</span>
        </h1>
        <p className="text-ink-soft max-w-2xl text-lg">
          If the pages aren&apos;t what we described for a simple site, you get the payment back. We don&apos;t take the fee and then tell you the site was out of scope.
        </p>
      </Section>
      <Section>
        <div className="max-w-3xl space-y-8">
          {faqs.map((item) => (
            <div key={item.q}>
              <h2 className="h-section text-2xl mb-2">{item.q}</h2>
              <p className="text-ink-soft leading-relaxed">{item.a}</p>
            </div>
          ))}
          <p className="text-sm text-ink-muted">
            Payments run through Stripe. Refunds go back to the original payment method. See also the{" "}
            <Link className="text-accent hover:text-signal" href="/terms">
              terms
            </Link>
            .
          </p>
        </div>
      </Section>
    </>
  );
}
