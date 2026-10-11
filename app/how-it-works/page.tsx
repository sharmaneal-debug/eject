import type { Metadata } from "next";
import Link from "next/link";
import { EditDemo } from "@/components/edit-demo";
import { Steps } from "@/components/steps";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "How it works",
  description: "Scan the URL. Move the pages. Edit by chatting.",
  path: "/how-it-works",
});

export default function Page() {
  return (
    <section className="mx-auto max-w-content min-w-0 px-4 py-10 sm:px-6 md:py-16">
      <h1 className="h-display text-4xl lg:text-6xl">How it works</h1>
      <p className="mt-4 text-lg text-ink-soft">Three steps. Simple sites only.</p>
      <div className="mt-8">
        <Steps />
      </div>
      <div className="mt-8">
        <EditDemo />
      </div>
      <p className="mt-6">
        <Link href="/blog" className="inline-flex min-h-11 items-center text-base text-accent underline-offset-2 hover:underline">
          More on the blog
        </Link>
      </p>
    </section>
  );
}
