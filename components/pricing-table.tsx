import Link from "next/link";
import { CustomPricingLink } from "./custom-pricing-link";
import { Section } from "./section";
import { siteConfig } from "@/lib/site";

export function PricingTable() {
  const offer = siteConfig.pricing.express;
  return (
    <Section>
      <div className="max-w-md rounded-2xl border border-line bg-white p-8">
        <h2 className="text-xl font-semibold">{offer.name}</h2>
        <p className="mt-1 text-sm text-ink-soft">{offer.blurb}</p>
        <p className="mt-4 text-5xl h-display tracking-tightest">${offer.price}</p>
        <Link
          href="/checkout?tier=express"
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-ink text-paper px-5 py-3.5 text-sm font-medium hover:bg-signal"
        >
          Buy for ${offer.price}
        </Link>
        <p className="mt-4">
          <CustomPricingLink />
        </p>
      </div>
    </Section>
  );
}
