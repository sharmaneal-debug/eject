import type { Metadata } from "next";
import { Section, Eyebrow } from "@/components/section";
import { pageMetadata } from "@/lib/seo";
import { UnsubscribeForm } from "./unsubscribe-form";

export const metadata: Metadata = pageMetadata({
  title: "Unsubscribe from renewal reminders",
  description: "Stop Eject renewal reminder emails.",
  path: "/renewal-watch/unsubscribe",
  index: false,
});

export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return (
    <Section>
      <div className="max-w-xl">
        <Eyebrow>Reminders</Eyebrow>
        <h1 className="h-display text-4xl md:text-6xl tracking-tightest mb-4">Unsubscribe</h1>
        <p className="text-ink-soft text-lg mb-8">
          This stops the 90, 60, and 30 day renewal emails for the subscription on this link. It does not cancel your platform plan.
        </p>
        <UnsubscribeForm token={token} />
      </div>
    </Section>
  );
}
