import type { Metadata } from "next";
import Link from "next/link";
import { Section, Eyebrow } from "@/components/section";

export const metadata: Metadata = {
  title: "Preview",
  description: "Preview links are sent after a person reviews a rebuild. They are not generated at scan or checkout.",
};

export default function Page() {
  return (
    <Section>
      <Eyebrow>Preview</Eyebrow>
      <div className="max-w-2xl">
        <h1 className="h-display text-4xl md:text-6xl tracking-tightest mb-5">Previews are reviewed, not automatic.</h1>
        <p className="text-ink-soft text-lg leading-relaxed mb-4">
          Paying does not create a live preview URL. The free scan does not either. For an eligible simple site, the system stores a content snapshot plus hosting and editor instructions. A visual rebuild runs when you follow the kit, or when a person runs the crawler and rebuilder.
        </p>
        <p className="text-ink-soft text-lg leading-relaxed mb-8">
          A preview link, when one exists, is something a person sends after looking at that rebuild. We also don&apos;t promise a PageSpeed gain. Speed depends on the finished pages and the host you choose.
        </p>
        <Link href="/demo" className="text-sm text-accent">
          What you can try today →
        </Link>
      </div>
    </Section>
  );
}
