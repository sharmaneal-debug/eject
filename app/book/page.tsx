import type { Metadata } from "next";
import { bookingEmbeddable, bookingUrl, supportEmail } from "@/lib/support";
import { pageMetadata } from "@/lib/seo";
import { BookForm } from "./book-form";

export const metadata: Metadata = pageMetadata({
  title: "Custom pricing",
  description: "We handle the migration for you, step by step.",
  path: "/book",
});

export default function Page() {
  const calendar = bookingUrl();
  return (
    <section className="mx-auto max-w-content min-w-0 px-4 py-10 sm:px-6 md:py-16">
      <h1 className="h-display text-4xl md:text-6xl">Custom pricing.</h1>
      <p className="mt-4 text-lg text-ink-soft">We handle the migration for you, step by step.</p>
      <div className="mt-8">
        <BookForm bookingUrl={calendar} embed={calendar ? bookingEmbeddable(calendar) : false} support={supportEmail()} />
      </div>
    </section>
  );
}
