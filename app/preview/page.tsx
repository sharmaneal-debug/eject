import type { Metadata } from "next";
import { Section } from "@/components/section";

export const metadata: Metadata = { title: "Preview", description: "No preview before you pay." };

export default function Page() {
  return (
    <Section>
      <h1 className="h-display text-4xl md:text-6xl tracking-tightest">Preview</h1>
      <p className="mt-3 text-ink-soft">No preview before you pay.</p>
    </Section>
  );
}
