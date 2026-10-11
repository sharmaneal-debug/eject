import type { Metadata } from "next";
import { HonestScope } from "@/components/honest-scope";
import { Section } from "@/components/section";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description: `Eject is operated by ${siteConfig.legalEntity.name}. Simple sites only.`,
  path: "/about",
});

export default function Page() {
  return (
    <Section>
      <h1 className="h-display text-4xl tracking-tightest md:text-6xl">About</h1>
      <p className="mt-4 text-lg text-ink-soft">Operated by {siteConfig.legalEntity.name}.</p>
      <div className="mt-4">
        <HonestScope />
      </div>
    </Section>
  );
}
