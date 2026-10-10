import type { Metadata } from "next";
import { Section } from "@/components/section";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "How it works",
  description: "Send the URL. We move the pages. You own the files.",
  path: "/how-it-works",
});

export default function Page() {
  return (
    <Section>
      <h1 className="h-display text-4xl md:text-6xl tracking-tightest">How it works</h1>
      <p className="mt-3 text-ink-soft">Send the URL. We move the pages. You own the files.</p>
    </Section>
  );
}
