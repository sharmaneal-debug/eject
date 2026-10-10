import Link from "next/link";

export const faqItems = [
  { q: "What is $99?", a: "An automated move of a simple site. You own the files." },
  { q: "Need it done for you?", a: "We handle the migration for you, step by step." },
  { q: "Will it look the same?", a: "We do not promise a pixel match." },
  { q: "What is out of scope?", a: "Stores and large CMS sites." },
  { q: "Domain?", a: "The domain stays yours. DNS changes only when you ask." },
  { q: "Refund?", a: "Email us within 14 days of delivery." },
];

export function Faq() {
  return (
    <section className="mx-auto max-w-content min-w-0 px-4 py-10 sm:px-6 md:py-16">
      <h2 className="mb-3 text-base font-medium text-ink-muted">FAQ</h2>
      <div className="max-w-xl border-b border-line">
        {faqItems.map((item) => (
          <details key={item.q} className="border-t border-line py-3">
            <summary className="flex min-h-11 cursor-pointer list-none items-center text-base font-medium [&::-webkit-details-marker]:hidden">
              {item.q}
            </summary>
            <p className="pb-2 text-base text-ink-soft">{item.a}</p>
          </details>
        ))}
      </div>
      <p className="mt-4">
        <Link href="/blog" className="inline-flex min-h-11 items-center text-base text-accent underline-offset-2 hover:underline">
          More on the blog
        </Link>
      </p>
    </section>
  );
}
