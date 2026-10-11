import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HonestScope } from "@/components/honest-scope";
import { Section } from "@/components/section";
import { pageMetadata } from "@/lib/seo";
import type { PlatformId } from "@/lib/pricing/platforms";

const names: Record<PlatformId, string> = {
  webflow: "Webflow",
  framer: "Framer",
  wix: "Wix",
  squarespace: "Squarespace",
};

export function generateStaticParams() {
  return Object.keys(names).map((platform) => ({ platform }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ platform: string }>;
}): Promise<Metadata> {
  const { platform } = await params;
  const name = names[platform as PlatformId];
  if (!name) return {};
  return pageMetadata({
    title: `A simple ${name} site`,
    description: "Simple sites only. About 10 pages. You approve a preview before any DNS change.",
    path: `/migrate/${platform}`,
  });
}

export default async function Page({ params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  const name = names[platform as PlatformId];
  if (!name) notFound();

  return (
    <Section>
      <h1 className="h-display text-4xl tracking-tightest md:text-6xl">A simple {name} site.</h1>
      <div className="mt-4">
        <HonestScope />
      </div>
    </Section>
  );
}
