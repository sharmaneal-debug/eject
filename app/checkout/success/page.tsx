import type { Metadata } from "next";
import Link from "next/link";
import { Section, Eyebrow } from "@/components/section";
import { FinalizeOnLoad } from "@/components/finalize-on-load";
import { reconcileSession } from "@/lib/fulfillment";
import { tierConfig } from "@/lib/stripe";
import { siteConfig } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payment received",
  description: "Next step: submit your site URL so we can score it.",
  robots: { index: false, follow: false },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const sp = await searchParams;
  const order = sp.session_id ? await reconcileSession(sp.session_id).catch(() => null) : null;
  const cfg = tierConfig(order?.tier ?? "automated");

  return (
    <Section>
      <div className="max-w-2xl">
        <Eyebrow>Payment</Eyebrow>
        {order ? (
          <>
            <h1 className="h-display text-4xl md:text-6xl tracking-tightest mb-5">
              {order.name ? `${order.name.split(" ")[0]}, payment is in.` : "Payment is in."}
            </h1>
            <p className="text-ink-soft text-lg leading-relaxed mb-6 max-w-lg">
              {cfg.name} is paid. The next step is a complexity score, not an automatic rebuild and not a preview link.
            </p>
            <div className="rounded-2xl border border-line bg-paper-warm p-7 mb-8">
              <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-3">What happens now</p>
              <ol className="space-y-3 text-sm text-ink-soft">
                <li>1. Submit the public URL of a marketing, portfolio, or landing page.</li>
                <li>2. We crawl it and return ELIGIBLE or NOT ELIGIBLE, plus time and cost-to-serve estimates.</li>
                <li>3. Eligible orders get the kit, a content snapshot, hosting notes, and editor instructions.</li>
                <li>4. A person reviews anything that should become a real site. Preview URLs are manual.</li>
              </ol>
              {order.token && (
                <Link
                  href={`/intake?token=${encodeURIComponent(order.token)}`}
                  className="mt-6 inline-flex rounded-xl bg-ink text-paper px-5 py-3 text-sm font-medium hover:bg-signal transition"
                >
                  Score the site →
                </Link>
              )}
            </div>
            <p className="text-sm text-ink-muted">
              {order.email ? <>Receipt address: <span className="font-mono text-ink">{order.email}</span>. </> : null}
              Charged in this session: <span className="font-mono text-ink">${(order.amountCents / 100).toFixed(2)}</span>.
              {order.kickoffSkipReason ? ` Email was not sent (${order.kickoffSkipReason}).` : null}
            </p>
          </>
        ) : (
          <>
            <h1 className="h-display text-4xl md:text-5xl tracking-tightest mb-5">We couldn&apos;t confirm payment.</h1>
            <p className="text-ink-soft text-lg leading-relaxed mb-6">
              The checkout session is missing, unpaid, or was created in live mode. Live payments are refused.
              If you just paid in Stripe test mode, wait a moment and reload. Otherwise email{" "}
              <a className="text-accent" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
            </p>
          </>
        )}
        <Link href="/" className="mt-10 inline-flex text-sm text-ink-muted hover:text-ink">
          ← back to home
        </Link>
        {sp.session_id && <FinalizeOnLoad sessionId={sp.session_id} />}
      </div>
    </Section>
  );
}
