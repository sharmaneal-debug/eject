import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { organizationSchema, websiteSchema } from "@/lib/schema";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Move a simple site." },
  description: "Launching soon.",
  openGraph: {
    title: "Move a simple site.",
    description: "Launching soon.",
    url: siteConfig.url,
    siteName: siteConfig.name,
  },
  twitter: {
    title: "Move a simple site.",
    description: "Launching soon.",
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={[organizationSchema(), websiteSchema()]} />
      <div className="mx-auto w-full max-w-content px-6 pb-32 pt-16">
        <h1 className="text-4xl font-semibold tracking-tight text-ink">Move a simple site.</h1>
        <p className="mt-4 text-xl text-ink">Launching soon.</p>
        <a
          href={`mailto:${siteConfig.email}`}
          className="mt-8 inline-flex min-h-12 items-center text-lg text-accent underline underline-offset-4"
        >
          {siteConfig.email}
        </a>
      </div>
    </>
  );
}
