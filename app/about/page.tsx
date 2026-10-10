import type { Metadata } from "next";
import { Section } from "@/components/section";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description: `Eject is operated by ${siteConfig.legalEntity.name}.`,
  path: "/about",
});

export default function Page() {
  return (
    <Section>
      <h1 className="h-display text-4xl md:text-6xl tracking-tightest">About</h1>
      <p className="mt-3 text-ink-soft">Operated by {siteConfig.legalEntity.name}.</p>
    </Section>
  );
}
