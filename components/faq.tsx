import Link from "next/link";
import { siteConfig } from "@/lib/site";

const cap = siteConfig.pricing.concierge.cap;

export const faqItems = [
  { q: "What is $99?", a: "An automated move of a simple site. You own the files." },
  { q: "What is $199?", a: `Done for you. We handle the move. About ${cap.pages} pages and ${cap.forms} form.` },
  { q: "Will it look the same?", a: "We do not promise a pixel match." },
  { q: "What is out of scope?", a: "Stores and large CMS sites." },
  { q: "Domain?", a: "The domain stays yours. DNS changes only when you ask." },
  { q: "Refund?", a: "Email us within 14 days of delivery." },
];

export function Faq() {
  return (
    <section className="mx-auto max-w-content px-6 py-12 md:py-16">
      <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-ink-muted">FAQ</h2>
      <div className="max-w-xl border-b border-line">
        {faqItems.map((item) => (
          <details key={item.q} className="border-t border-line py-3">
            <summary className="flex min-h-11 cursor-pointer list-none items-center font-medium [&::-webkit-details-marker]:hidden">
              {item.q}
            </summary>
            <p className="pb-2 text-sm text-ink-soft">{item.a}</p>
          </details>
        ))}
      </div>
      <p className="mt-4 text-sm">
        <Link href="/blog" className="text-accent underline-offset-2 hover:underline">
          More on the blog
        </Link>
      </p>
    </section>
  );
}
