import type { Metadata } from "next";
import { Section } from "@/components/section";
import { bookingEmbeddable, bookingUrl, supportEmail } from "@/lib/support";
import { BookForm } from "./book-form";

export const metadata: Metadata = {
  title: "Custom pricing",
  description: "We handle the migration for you, step by step.",
};

export default function Page() {
  const calendar = bookingUrl();
  return (
    <Section>
      <h1 className="h-display text-4xl md:text-6xl tracking-tightest mb-2">Custom pricing.</h1>
      <p className="text-ink-soft mb-6">We handle the migration for you, step by step.</p>
      <BookForm bookingUrl={calendar} embed={calendar ? bookingEmbeddable(calendar) : false} support={supportEmail()} />
    </Section>
  );
}
