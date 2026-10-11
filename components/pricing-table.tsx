import Link from "next/link";
import { buyNowHref } from "@/lib/checkout-gate";
import { siteConfig } from "@/lib/site";
import { CustomPricingLink } from "./custom-pricing-link";

export function PricingTable() {
  const offer = siteConfig.pricing.express;
  return (
    <div className="min-w-0">
      <article className="max-w-md rounded-2xl border border-line bg-white p-6">
        <h2 className="text-lg font-semibold">{offer.name}</h2>
        <p className="mt-3 text-5xl font-semibold tabular-nums tracking-tight">${offer.price}</p>
        <p className="mt-3 text-base text-ink-soft">{offer.blurb}</p>
        <ul className="mt-4 space-y-1 text-base">
          {offer.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
        <Link
          href={buyNowHref()}
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-ink px-5 text-base font-medium text-paper hover:bg-signal"
        >
          {offer.cta}
        </Link>
      </article>
      <p className="mt-6 max-w-md text-base text-ink-soft">We handle the migration for you, step by step.</p>
      <CustomPricingLink />
    </div>
  );
}
