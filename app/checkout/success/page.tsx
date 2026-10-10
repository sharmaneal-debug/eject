import type { Metadata } from "next";
import Link from "next/link";
import { Section, Eyebrow } from "@/components/section";
import { FinalizeOnLoad } from "@/components/finalize-on-load";
import { reconcileSession } from "@/lib/fulfillment";
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

  return (
    <Section>
      <div className="max-w-2xl">
        <Eyebrow>Payment</Eyebrow>
        {order ? (
          <>
            <h1 className="h-display text-4xl md:text-6xl tracking-tightest mb-3">Payment received.</h1>
            <p className="text-ink-soft mb-6">Send the site URL.</p>
            {order.token && (
              <Link
                href={`/intake?token=${encodeURIComponent(order.token)}`}
                className="inline-flex rounded-xl bg-ink text-paper px-5 py-3 text-sm font-medium hover:bg-signal"
              >
                Submit the URL
              </Link>
            )}
            <p className="text-sm text-ink-muted mt-6">
              {order.tier === "automated"
                ? <>Charged ${(order.amountCents / 100).toFixed(2)}.</>
                : <>Payment received.</>}
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
