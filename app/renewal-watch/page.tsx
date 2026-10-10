import type { Metadata } from "next";
import { RenewalWatchForm } from "@/components/renewal-watch-form";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata } from "@/lib/seo";
import { getPlan, type PlatformId } from "@/lib/pricing/platforms";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Renewal watch",
  description: "Reminders at 90, 60, and 30 days. Simple sites only.",
  path: "/renewal-watch",
});

const platforms: PlatformId[] = ["framer", "webflow", "wix", "squarespace"];

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string; plan?: string; date?: string }>;
}) {
  const sp = await searchParams;
  const platform = platforms.includes(sp.platform as PlatformId) ? (sp.platform as PlatformId) : "framer";
  const plan = sp.plan && getPlan(platform, sp.plan) ? sp.plan : undefined;
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Renewal watch",
    url: `${siteConfig.url}/renewal-watch`,
    description: "Reminders before a website platform renewal, for simple sites.",
    isPartOf: { "@type": "WebSite", name: siteConfig.name, url: siteConfig.url },
  };

  return (
    <>
      <JsonLd data={schema} />
      <section className="mx-auto max-w-content px-6 py-12 md:py-16">
        <h1 className="h-display text-4xl md:text-6xl">Renewal watch</h1>
        <p className="mt-4 text-lg text-ink-soft">Reminders at 90, 60, and 30 days. Simple sites only.</p>
        <div className="mt-8">
          <RenewalWatchForm initialPlatform={platform} initialPlanId={plan} initialDate={sp.date} />
        </div>
      </section>
    </>
  );
}
