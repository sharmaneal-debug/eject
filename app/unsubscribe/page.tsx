import type { Metadata } from "next";
import Link from "next/link";
import { Section, Eyebrow } from "@/components/section";
import { supportEmail } from "@/lib/support";

export const metadata: Metadata = {
  title: "Unsubscribe",
  description: "Stop renewal reminder emails.",
  robots: { index: false, follow: false },
};

export default function Page() {
  const email = supportEmail();
  return (
    <Section>
      <Eyebrow>Email</Eyebrow>
      <h1 className="h-display text-4xl md:text-6xl tracking-tightest mb-4">Unsubscribe</h1>
      <div className="max-w-2xl space-y-4 text-ink-soft leading-relaxed">
        <p>
          Renewal reminder emails stop from the link in the email, or on the{" "}
          <Link className="text-accent" href="/renewal-watch/unsubscribe">renewal unsubscribe page</Link>.
          That does not cancel your Framer, Webflow, Wix, or Squarespace plan.
        </p>
        <p>
          Order emails (payment confirmation, intake received, delivery, refund follow-up) are about a purchase you made. To stop those, email {email} and name the order. We still have to keep the record of the payment.
        </p>
        <p>
          <a className="text-accent" href={`mailto:${email}?subject=Unsubscribe`}>Email {email}</a>
        </p>
      </div>
    </Section>
  );
}
