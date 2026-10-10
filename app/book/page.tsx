import type { Metadata } from "next";
import { Section, Eyebrow } from "@/components/section";
import { siteConfig, doneForYouCapLabel } from "@/lib/site";
import { bookingEmbeddable, bookingUrl, supportEmail } from "@/lib/support";
import { BookForm } from "./book-form";

export const metadata: Metadata = {
  title: "Book a call",
  description: `${siteConfig.pricing.concierge.name} is $${siteConfig.pricing.concierge.price} after a call. Simple sites only.`,
};

export default function Page() {
  const calendar = bookingUrl();
  const offer = siteConfig.pricing.concierge;
  return (
    <Section>
      <Eyebrow>{offer.name} · ${offer.price}</Eyebrow>
      <h1 className="h-display text-4xl md:text-6xl tracking-tightest mb-4 max-w-3xl">Book a call.</h1>
      <p className="text-ink-soft text-lg max-w-2xl mb-8 leading-relaxed">
        {offer.name} is not a buy-now checkout. Tell us about the site. We run the free scan, then you pick a time.
        Neal and a colleague do the hand work. There is no contractor. The cap is {doneForYouCapLabel()}. Anything past that is a referral or a priced add-on.
        If we take the work, we send a payment link for ${offer.price}. {siteConfig.pricing.express.name} (${siteConfig.pricing.express.price}) is still self-serve.
      </p>
      <BookForm bookingUrl={calendar} embed={calendar ? bookingEmbeddable(calendar) : false} support={supportEmail()} />
    </Section>
  );
}
