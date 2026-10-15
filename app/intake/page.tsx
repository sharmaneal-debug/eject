import type { Metadata } from "next";
import Link from "next/link";
import { Section, Eyebrow } from "@/components/section";
import { PaidIntakeForm } from "@/components/paid-intake-form";
import { ScoreReport } from "@/components/score-report";
import { getOrderStore } from "@/lib/orders";
import { AUTOMATED_REFUND_PROMISE } from "@/lib/legal";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Site intake",
  description: "Site intake.",
  path: "/intake",
  index: false,
});

export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const order = token ? await getOrderStore().getByToken(token) : null;
  const paid = order && order.status !== "pending";

  return (
    <Section>
      <Eyebrow>Intake</Eyebrow>
      {!token || !paid || !order ? (
        <div className="max-w-xl">
          <h1 className="h-display text-4xl md:text-5xl tracking-tightest mb-4">Paid orders only.</h1>
          <p className="text-ink-soft text-lg mb-6">
            Submit a URL after checkout. The link in your confirmation carries the order token.
          </p>
          <Link href="/pricing" className="inline-flex min-h-11 items-center text-base text-accent">
            See pricing
          </Link>
        </div>
      ) : order.score ? (
        <ScoreReport order={order} />
      ) : (
        <div>
          <h1 className="h-display text-4xl md:text-5xl tracking-tightest mb-4">Score the site.</h1>
          <p className="text-ink-soft text-lg max-w-2xl mb-8">
            We fetch public pages only. Simple sites are about 10 pages. {AUTOMATED_REFUND_PROMISE}
          </p>
          <PaidIntakeForm token={token} initialUrl={order.siteUrl} />
          <p className="text-xs text-ink-muted mt-4">
            Stuck? Email <a className="text-accent" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
          </p>
        </div>
      )}
    </Section>
  );
}
