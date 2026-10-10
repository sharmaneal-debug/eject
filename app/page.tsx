import type { Metadata } from "next";
import Link from "next/link";
import { CostCalculator } from "@/components/cost-calculator";
import { CustomPricingLink } from "@/components/custom-pricing-link";
import { Faq } from "@/components/faq";
import { JsonLd } from "@/components/json-ld";
import { Section } from "@/components/section";
import { organizationSchema, serviceSchema, websiteSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: siteConfig.tagline,
  description: siteConfig.description,
  path: "/",
});

const steps = [
  ["1", "Send the URL"],
  ["2", "We move the pages"],
  ["3", "You own the files"],
];

export default function HomePage() {
  return (
    <>
      <JsonLd data={[organizationSchema(), websiteSchema(), serviceSchema()]} />
      <section className="max-w-content mx-auto px-6 pt-16 pb-4 md:pt-24">
        <h1 className="h-display text-5xl md:text-7xl tracking-tightest max-w-4xl">Move your site. $99.</h1>
        <p className="mt-3 text-ink-soft">One time. You own the files.</p>
      </section>
      <Section>
        <h2 className="text-sm font-mono uppercase tracking-widest text-ink-muted mb-4">Savings</h2>
        <CostCalculator />
      </Section>
      <Section className="pt-0">
        <h2 className="text-sm font-mono uppercase tracking-widest text-ink-muted mb-4">Three steps</h2>
        <ol className="grid gap-3 md:grid-cols-3">
          {steps.map(([n, label]) => (
            <li key={n} className="rounded-2xl border border-line bg-white p-6">
              <p className="text-3xl h-display">{n}</p>
              <p className="mt-2 font-medium">{label}</p>
            </li>
          ))}
        </ol>
        <Link
          href="/checkout?tier=express"
          className="mt-8 inline-flex rounded-xl bg-ink text-paper px-8 py-4 text-base font-medium hover:bg-signal"
        >
          Buy for $99
        </Link>
        <p className="mt-4">
          <CustomPricingLink />
        </p>
      </Section>
      <Faq />
    </>
  );
}
