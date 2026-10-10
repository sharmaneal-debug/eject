import type { Metadata } from "next";
import { Section } from "@/components/section";

export const metadata: Metadata = { title: "Demo", description: "The $99 move is the product." };

export default function Page() {
  return (
    <Section>
      <h1 className="h-display text-4xl md:text-6xl tracking-tightest">Demo</h1>
      <p className="mt-3 text-ink-soft">The $99 move is the product. There is no separate demo.</p>
    </Section>
  );
}
