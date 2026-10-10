import type { Metadata } from "next";
import Link from "next/link";
import { Section, Eyebrow } from "@/components/section";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Refunds",
  description: "Simple sites only. Ineligible orders are refunded by a person. Eligible work has a 14-day window.",
};

export default function Page() {
  return (
    <Section>
      <Eyebrow>Refunds</Eyebrow>
      <div className="max-w-2xl text-ink-soft leading-relaxed space-y-4">
        <h1 className="h-display text-4xl md:text-6xl tracking-tightest text-ink mb-5">Refunds</h1>
        <p>
          Eject is for simple marketing, portfolio, and landing pages. After payment we score the site. If the result is NOT ELIGIBLE, email{" "}
          <a className="text-accent" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>{" "}
          with your order id. A person refunds the payment. The app does not call Stripe to move money by itself.
        </p>
        <p>
          Stores, heavy CMS collections, member logins, and very large sites are the usual reasons. Commerce sites are referred out as well as refunded: this service does not migrate carts.
        </p>
        <p>
          If the site is eligible and you are unhappy with what was delivered, email within 14 days of the handoff for a full refund. Outside that window we still fix mistakes we shipped. Changes you made after handoff are not covered.
        </p>
        <p>
          The legal version is in the <Link className="text-accent" href="/terms">terms</Link>.
        </p>
      </div>
    </Section>
  );
}
