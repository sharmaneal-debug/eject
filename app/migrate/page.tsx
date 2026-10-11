import type { Metadata } from "next";
import Link from "next/link";
import { HonestScope } from "@/components/honest-scope";
import { Section } from "@/components/section";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Move a simple site",
  description: "Simple sites only. About 10 pages. You approve a preview before any DNS change.",
  path: "/migrate",
});

const platforms = [
  { href: "/migrate/webflow", label: "Webflow" },
  { href: "/migrate/framer", label: "Framer" },
  { href: "/migrate/wix", label: "Wix" },
  { href: "/migrate/squarespace", label: "Squarespace" },
];

export default function Page() {
  return (
    <Section>
      <h1 className="h-display text-4xl tracking-tightest md:text-6xl">Move a simple site.</h1>
      <div className="mt-4">
        <HonestScope />
      </div>
      <nav className="mt-6 flex flex-col sm:flex-row sm:flex-wrap sm:gap-x-2">
        {platforms.map((item) => (
          <Link key={item.href} href={item.href} className="inline-flex min-h-11 items-center px-2 text-base text-accent">
            {item.label}
          </Link>
        ))}
      </nav>
    </Section>
  );
}
