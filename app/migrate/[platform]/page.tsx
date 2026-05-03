import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IntakeForm } from "@/components/intake-form";
import { CostCalculator } from "@/components/cost-calculator";
import { Section, Eyebrow } from "@/components/section";

const data: Record<
 string,
 { name: string; pitch: string; bullets: string[]; description: string }
> = {
 webflow: {
 name: "Webflow",
 pitch: "Webflow → Next.js. The honest exit.",
 description:
 "We migrate your Webflow site to a Next.js codebase you own. Deployed on Cloudflare Pages free. CMS extracted via API. Forms, redirects, sitemaps included.",
 bullets: [
 "CMS extracted via Webflow's API (every collection, every field)",
 "Forms moved to Resend (free up to 3K/mo)",
 "301 redirects from every old URL. SEO survives",
 "Cloudflare Pages free hosting, $0/mo",
 ],
 },
 framer: {
 name: "Framer",
 pitch: "Framer → Next.js. Without the lock-in.",
 description:
 "Framer doesn't ship a code export. We rebuild your Framer site as Next.js + Framer Motion (the open-source library). You get the same animations on a codebase you own.",
 bullets: [
 "Animations preserved via Framer Motion (open source)",
 "CMS collections walked from rendered DOM",
 "Custom domain, SSL, sitemap. Included",
 "Cloudflare Pages free hosting, $0/mo",
 ],
 },
 wix: {
 name: "Wix",
 pitch: "Wix → Next.js. Yes, it's possible.",
 description:
 "Wix has zero code export. We rebuild manually from your live URL. Design, content, images, redirects. You go from locked-in to fully owned.",
 bullets: [
 "Manual content extraction (Wix has no API)",
 "Pixel-matched design rebuild in Next.js + Tailwind",
 "10-day turnaround (longer than Framer/Webflow because no API)",
 "Cloudflare Pages free hosting, $0/mo",
 ],
 },
 squarespace: {
 name: "Squarespace",
 pitch: "Squarespace → Next.js. For real this time.",
 description:
 "Squarespace's export is JSON only. Useless for actually moving. We rebuild your design and migrate your blog/CMS content into a Next.js codebase you own.",
 bullets: [
 "Blog/CMS migrated to MDX in your repo",
 "Design rebuilt with Tailwind",
 "Forms, sitemaps, redirects wired",
 "Cloudflare Pages free hosting, $0/mo",
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
 const d = data[platform];
 if (!d) return {};
 return {
 title: `${d.name} → Next.js migration`,
 description: d.description,
 };
}

export default async function Page({ params }: { params: Promise<{ platform: string }> }) {
 const { platform } = await params;
 const d = data[platform];
 if (!d) notFound();

 return (
 <>
 <Section>
 <Eyebrow>{d.name} → Next.js</Eyebrow>
 <h1 className="h-display text-4xl md:text-6xl tracking-tightest max-w-4xl mb-5">{d.pitch}</h1>
 <p className="text-ink-soft max-w-2xl text-lg leading-relaxed mb-10">{d.description}</p>

 <div className="grid lg:grid-cols-[1fr_1.1fr] gap-10 items-start">
 <ul className="space-y-3 text-sm">
 {d.bullets.map((b) => (
 <li key={b} className="flex items-start gap-3">
 <span className="font-mono text-signal text-xs mt-1">→</span>
 <span className="text-ink-soft leading-relaxed">{b}</span>
 </li>
 ))}
 </ul>
 <IntakeForm defaultTier="dwy" />
 </div>
 </Section>

 <Section className="bg-paper-warm">
 <Eyebrow>Cost calculator</Eyebrow>
 <h2 className="h-section text-3xl md:text-4xl max-w-3xl mb-3">
 What you&apos;re paying {d.name} vs what you&apos;d pay us.
 </h2>
 <p className="text-ink-soft mb-10 max-w-2xl">
 Adjust the inputs to match your actual setup.
 </p>
 <CostCalculator />
 </Section>
 </>
 );
}
