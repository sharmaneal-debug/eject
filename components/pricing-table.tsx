import Link from "next/link";
import { siteConfig } from "@/lib/site";

const offers = [
  {
    ...siteConfig.pricing.express,
    href: "/checkout?tier=express",
    primary: true,
  },
  {
    ...siteConfig.pricing.concierge,
    href: "/book",
    primary: false,
  },
];

export function PricingTable() {
  return (
    <div>
      <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-ink-muted">Pricing</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {offers.map((offer) => (
          <article key={offer.id} className="flex flex-col rounded-2xl border border-line bg-white p-6 md:p-8">
            <h3 className="text-lg font-semibold">{offer.name}</h3>
            <p className="mt-3 text-5xl font-semibold tabular-nums tracking-tight">${offer.price}</p>
            <p className="mt-3 text-sm text-ink-soft">{offer.blurb}</p>
            <ul className="mt-4 space-y-1 text-sm">
              {offer.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            <Link
              href={offer.href}
              className={
                offer.primary
                  ? "mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-ink px-5 text-sm font-medium text-paper hover:bg-signal"
                  : "mt-6 inline-flex min-h-12 items-center justify-center rounded-xl border border-ink px-5 text-sm font-medium hover:bg-ink hover:text-paper"
              }
            >
              {offer.cta}
            </Link>
          </article>
        ))}
      </div>
      <p className="mt-4 text-sm text-ink-muted">Simple sites only. About 10 pages and 1 form.</p>
    </div>
  );
}
