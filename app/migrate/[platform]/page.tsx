import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LeadForm } from "@/components/lead-form";
import { CostCalculator } from "@/components/cost-calculator";
import { ScopeLimits } from "@/components/scope-limits";
import { Section, Eyebrow } from "@/components/section";
import { pageMetadata } from "@/lib/seo";
import type { PlatformId } from "@/lib/pricing/platforms";
import { siteConfig, doneForYouCapLabel } from "@/lib/site";

const offerLine = `${siteConfig.editing.lead} ${siteConfig.editing.included} ${siteConfig.pricing.express.name} ($${siteConfig.pricing.express.price}) is an automated migration you review before DNS. ${siteConfig.pricing.concierge.name} ($${siteConfig.pricing.concierge.price}) is done by hand: ${doneForYouCapLabel()}. Beyond that, we refer out or quote an add-on.`;

const data: Record<
  PlatformId,
  { name: string; pitch: string; bullets: string[] }
> = {
  webflow: {
    name: "Webflow",
    pitch: "A simple Webflow site, as files you host.",
    bullets: [
      "In scope: a marketing site, portfolio, or landing page on the Basic site plan, or a similarly small page set.",
      "Out of scope: Webflow CMS collections, Ecommerce plans, and Localization.",
      offerLine,
      "You deploy on a free static host. We don't keep the hosting account.",
    ],
  },
  framer: {
    name: "Framer",
    pitch: "A simple Framer site, without the subscription.",
    bullets: [
      "In scope: a personal or marketing site with a handful of pages.",
      "Out of scope: a large CMS, localization, and anything that depends on Framer-only components we can't honestly recreate.",
      "Framer has no code export. The move is a rewrite of the pages, not a file conversion.",
      "You deploy on a free static host. We don't keep the hosting account.",
    ],
  },
  wix: {
    name: "Wix",
    pitch: "A simple Wix site. Not the store.",
    bullets: [
      "In scope: a Light-plan style brochure, portfolio, or landing page.",
      "Out of scope: Core and above when the site takes payments, bookings, or a catalog.",
      "Wix doesn't give you the site as code. The pages are rewritten. There is no one-click export.",
      "You deploy on a free static host. We don't keep the hosting account.",
    ],
  },
  squarespace: {
    name: "Squarespace",
    pitch: "A simple Squarespace site. Not the commerce plan.",
    bullets: [
      "In scope: a Basic-plan style portfolio or brochure.",
      "Out of scope: Core, Plus, and Advanced commerce, memberships, and scheduling.",
      "Squarespace's blog export is not a design export. We don't pretend the XML is the site.",
      "You deploy on a free static host. We don't keep the hosting account.",
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(data).map((platform) => ({ platform }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ platform: string }>;
}): Promise<Metadata> {
  const { platform } = await params;
  const d = data[platform as PlatformId];
  if (!d) return {};
  return pageMetadata({
    title: `${d.name} simple-site move`,
    description: d.pitch,
    path: `/migrate/${platform}`,
  });
}

export default async function Page({ params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  const d = data[platform as PlatformId];
  if (!d) notFound();

  return (
    <>
      <Section>
        <Eyebrow>{d.name} · simple sites</Eyebrow>
        <h1 className="h-display text-4xl md:text-6xl tracking-tightest max-w-4xl mb-5">
          Edit by chatting. {d.pitch}
        </h1>
        <p className="text-ink-soft max-w-2xl text-lg leading-relaxed mb-10">
          {offerLine} We don&apos;t extract a CMS and we don&apos;t migrate a store.
        </p>

        <div className="grid lg:grid-cols-[1fr_0.9fr] gap-10 items-start">
          <ul className="space-y-3 text-sm">
            {d.bullets.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <span className="font-mono text-signal text-xs mt-1">→</span>
                <span className="text-ink-soft leading-relaxed">{b}</span>
              </li>
            ))}
          </ul>
          <LeadForm intent={`migrate-${platform}`} source="platform" />
        </div>
      </Section>

      <Section className="bg-paper-warm">
        <Eyebrow>Checked prices</Eyebrow>
        <h2 className="h-section text-3xl md:text-4xl max-w-3xl mb-3">
          What {d.name} lists, versus self-hosting.
        </h2>
        <p className="text-ink-soft mb-10 max-w-2xl">
          The calculator opens on {d.name}. Out-of-scope plans stay visible so the price is honest, not because we&apos;ll take the work.
        </p>
        <CostCalculator initialPlatform={platform as PlatformId} />
      </Section>
      <ScopeLimits compact />
    </>
  );
}
