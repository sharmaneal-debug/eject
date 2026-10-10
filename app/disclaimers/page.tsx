import type { Metadata } from "next";
import Link from "next/link";
import { Section, Eyebrow } from "@/components/section";
import { siteConfig, doneForYouCapLabel } from "@/lib/site";

export const metadata: Metadata = {
  title: "Disclaimers",
  description: "What Eject does and does not promise.",
};

export default function Page() {
  const auto = siteConfig.pricing.express;
  const hand = siteConfig.pricing.concierge;
  return (
    <Section>
      <Eyebrow>Disclaimers</Eyebrow>
      <h1 className="h-display text-4xl md:text-6xl tracking-tightest mb-6">What we do not promise</h1>
      <div className="max-w-3xl space-y-5 text-ink-soft leading-relaxed">
        <p>
          Eject, operated by {siteConfig.legalEntity.name}, moves simple marketing, portfolio, and landing pages. {auto.name} is ${auto.price} and is self-serve. {hand.name} is ${hand.price} after a call, done by Neal and a colleague, {doneForYouCapLabel()}.
        </p>
        <p>
          We do not promise visual parity. A rebuilt page can differ in type, spacing, motion, and embeds. We do not promise a PageSpeed or ranking change.
        </p>
        <p>
          You own the code we hand you. You also own the domain. We do not change DNS unless you ask, and the registrar account stays yours. Hosting after handoff is an account you control.
        </p>
        <p>
          Text and images on the old site may be yours, a client's, or a platform's. You confirm you have the right to move them. Framer, Webflow, Wix, and Squarespace have their own terms. We are not affiliated with them.
        </p>
        <p>
          Stores, member areas, heavy CMS collections, bookings, and sites past the cap are referred out or quoted as an add-on. The add-on price is not a product on the pricing page.
        </p>
        <p>
          If a rebuild uses an AI vendor, public page content may be sent to that vendor to draft files. The editing guide is for your own agent. We do not host a chat product and we do not sell a subscription for one.
        </p>
        <p>
          Payments run through Stripe in test mode until a live account is approved. This site does not issue refunds by itself. See the <Link className="text-accent" href="/refunds">refunds</Link> and <Link className="text-accent" href="/terms">terms</Link>.
        </p>
        <p className="text-sm text-ink-muted">
          These sentences describe the product as built. They are not a substitute for the review in LEGAL_REVIEW.md.
        </p>
      </div>
    </Section>
  );
}
