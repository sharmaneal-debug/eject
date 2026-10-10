import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { bookingEmbeddable, bookingUrl, supportEmail } from "@/lib/support";
import { BookForm } from "./book-form";

export const metadata: Metadata = {
  title: "Book a call",
  description: `Done for you is $${siteConfig.pricing.concierge.price}. Simple sites, about 10 pages.`,
};

export default function Page() {
  const calendar = bookingUrl();
  const cap = siteConfig.pricing.concierge.cap;
  return (
    <section className="mx-auto max-w-content px-6 py-12 md:py-16">
      <h1 className="h-display text-4xl md:text-6xl">Book a call.</h1>
      <p className="mt-4 text-lg text-ink-soft">
        Done for you is ${siteConfig.pricing.concierge.price}. About {cap.pages} pages.
      </p>
      <div className="mt-8">
        <BookForm bookingUrl={calendar} embed={calendar ? bookingEmbeddable(calendar) : false} support={supportEmail()} />
      </div>
    </section>
  );
}
