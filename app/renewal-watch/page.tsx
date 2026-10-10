import type { Metadata } from "next";
import { Section, Eyebrow } from "@/components/section";
import { RenewalWatchForm } from "@/components/renewal-watch-form";
import { ScopeLimits } from "@/components/scope-limits";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Renewal watch",
  description:
    "Enter a Framer, Webflow, Wix, or Squarespace renewal. See the checked list price against self-hosting, get a move-by plan, and get email reminders at 90, 60, and 30 days.",
  path: "/renewal-watch",
});

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Renewal watch",
    url: `${siteConfig.url}/renewal-watch`,
    description: "Reminders before a website platform renewal, for simple marketing, portfolio, and landing sites.",
    isPartOf: { "@type": "WebSite", name: siteConfig.name, url: siteConfig.url },
  };

  return (
    <>
      <JsonLd data={schema} />
      <Section className="pb-0">
        <Eyebrow>Renewal watch</Eyebrow>
        <h1 className="h-display text-5xl md:text-7xl tracking-tightest">Renewal watch</h1>
        <p className="mt-3 text-ink-soft">Reminders before the invoice. The math uses the ${siteConfig.pricing.express.price} move.</p>
      </Section>
      <Section>
        <RenewalWatchForm />
      </Section>
      <ScopeLimits />
    </>
  );
}
