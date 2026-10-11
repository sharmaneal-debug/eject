import type { Metadata } from "next";
import { HonestScope } from "@/components/honest-scope";
import { Section } from "@/components/section";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Preview",
  description: "You pay first. You approve a preview before any DNS change.",
  path: "/preview",
});

export default function Page() {
  return (
    <Section>
      <h1 className="h-display text-4xl tracking-tightest md:text-6xl">Preview</h1>
      <div className="mt-4">
        <HonestScope />
      </div>
    </Section>
  );
}
