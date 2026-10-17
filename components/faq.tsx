import Link from "next/link";
import { AUTOMATED_REFUND_PROMISE } from "@/lib/legal";

export const faqItems = [
  { q: "What is $99?", a: "A one-time automated move of a simple site, about 10 pages. You own the files." },
  { q: "Need it done for you?", a: "We handle the migration for you, step by step." },
  { q: "Will it look the same?", a: "We do not promise a visual match." },
  { q: "What is out of scope?", a: "Stores, and sites past about 10 pages. We do not move a CMS or a shop." },
  { q: "Domain?", a: "The domain stays yours. DNS changes only when you ask." },
  { q: "Refund?", a: `${AUTOMATED_REFUND_PROMISE} You can also email us within 14 days of delivery.` },
];

export function Faq({
  items = faqItems,
  showBlog = true,
}: {
  items?: readonly { q: string; a: string }[];
  showBlog?: boolean;
}) {
  return (
    <section className="mx-auto max-w-content min-w-0 px-4 py-10 sm:px-6 md:py-16">
      <h2 className="mb-3 text-base font-medium text-ink-muted">FAQ</h2>
      <div className="max-w-xl border-b border-line">
        {items.map((item) => (
          <details key={item.q} className="border-t border-line py-3">
            <summary className="flex min-h-11 cursor-pointer list-none items-center text-base font-medium [&::-webkit-details-marker]:hidden">
              {item.q}
            </summary>
            <p className="pb-2 text-base text-ink-soft">{item.a}</p>
          </details>
        ))}
      </div>
      {showBlog ? (
        <p className="mt-4">
          <Link href="/blog" className="inline-flex min-h-11 items-center text-base text-accent underline-offset-2 hover:underline">
            More on the blog
          </Link>
        </p>
      ) : null}
    </section>
  );
}
