import type { Metadata } from "next";
import Link from "next/link";
import { Steps } from "@/components/steps";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "How it works",
  description: "Scan the URL. Move the pages. Edit by chatting.",
  path: "/how-it-works",
});

export default function Page() {
  return (
    <section className="mx-auto max-w-content px-6 py-12 md:py-16">
      <h1 className="h-display text-4xl md:text-6xl">How it works</h1>
      <p className="mt-4 text-lg text-ink-soft">Three steps. Simple sites only.</p>
      <div className="mt-8">
        <Steps />
      </div>
      <p className="mt-6 text-sm">
        <Link href="/blog" className="text-accent underline-offset-2 hover:underline">
          More on the blog
        </Link>
      </p>
    </section>
  );
}
