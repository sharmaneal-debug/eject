import type { Metadata } from "next";
import { HonestScope } from "@/components/honest-scope";
import { Section } from "@/components/section";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Demo",
  description: "Simple sites only. About 10 pages.",
  path: "/demo",
});

export default function Page() {
  return (
    <Section>
      <h1 className="h-display text-4xl tracking-tightest md:text-6xl">Demo</h1>
      <p className="mt-4 text-lg text-ink-soft">There is no separate demo.</p>
      <div className="mt-4">
        <HonestScope />
      </div>
    </Section>
  );
}
