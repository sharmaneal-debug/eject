import type { Metadata } from "next";
import { Faq } from "@/components/faq";
import { JsonLd } from "@/components/json-ld";
import { SiteUrlForm } from "@/components/site-url-form";
import { HOME_DESCRIPTION, HOME_H1, HOME_LEDE, homeFaqItems } from "@/lib/home-copy";
import { faqSchema, organizationSchema, productSchema, websiteSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Move your website",
  description: HOME_DESCRIPTION,
  path: "/",
  image: "/og.jpg",
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={[organizationSchema(), websiteSchema(), productSchema(), faqSchema([...homeFaqItems])]} />
      <section className="mx-auto min-w-0 max-w-2xl px-4 pb-4 pt-14 sm:px-6 md:pt-24">
        <h1 className="h-display max-w-xl text-4xl sm:text-6xl">{HOME_H1}</h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl">{HOME_LEDE}</p>
        <SiteUrlForm />
        <ul className="mt-8 flex min-w-0 flex-col text-base sm:flex-row sm:flex-wrap sm:gap-x-6">
          <li className="flex min-h-11 items-center text-ink">You own the code.</li>
          <li>
            <a href="/refunds" className="inline-flex min-h-11 items-center text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
              Refund policy
            </a>
          </li>
          <li>
            <a href="/samples" className="inline-flex min-h-11 items-center text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
              Sample sites
            </a>
          </li>
        </ul>
      </section>
      <Faq items={homeFaqItems} showBlog={false} />
    </>
  );
}
