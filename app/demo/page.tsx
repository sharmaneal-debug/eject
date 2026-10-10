import type { Metadata } from "next";
import Link from "next/link";
import { Section, Eyebrow } from "@/components/section";

export const metadata: Metadata = {
  title: "Demo",
  description: "What you can try today, and what is still reviewed by a person.",
};

export default function Page() {
  return (
    <Section>
      <Eyebrow>Demo</Eyebrow>
      <div className="max-w-2xl">
        <h1 className="h-display text-4xl md:text-6xl tracking-tightest mb-5">There is no automated site demo.</h1>
        <p className="text-ink-soft text-lg leading-relaxed mb-4">
          The free scan on the homepage reads one public page and a sitemap. It shows the platform, a page count when a sitemap exists, and a typical plan price. It does not rebuild the site, and it does not show a preview.
        </p>
        <p className="text-ink-soft text-lg leading-relaxed mb-8">
          After you pay, a second step crawls the site and scores whether it is a simple marketing, portfolio, or landing page. Eligible orders get a kit, a content snapshot, hosting notes, and editor instructions. A person still reviews a visual rebuild before any preview link exists.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/" className="rounded-xl bg-ink text-paper px-5 py-3 text-sm font-medium hover:bg-signal">
            Run a free scan
          </Link>
          <Link href="/how-it-works" className="rounded-xl border border-line px-5 py-3 text-sm font-medium">
            How it works
          </Link>
        </div>
      </div>
    </Section>
  );
}
