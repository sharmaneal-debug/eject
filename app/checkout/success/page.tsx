import type { Metadata } from "next";
import Link from "next/link";
import { FinalizeOnLoad } from "@/components/finalize-on-load";
import { reconcileSession } from "@/lib/fulfillment";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Payment received",
  description: "What you get, and the next three steps.",
  path: "/checkout/success",
  index: false,
});

const got = [
  { title: "Files you own", icon: FilesIcon },
  { title: "Editing guide", icon: GuideIcon },
  { title: "A simple-site score", icon: ScoreIcon },
];

const next = ["Submit the URL", "We score the site", "Open the kit if it fits"];

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const sp = await searchParams;
  const order = sp.session_id ? await reconcileSession(sp.session_id).catch(() => null) : null;

  return (
    <section className="mx-auto max-w-content min-w-0 px-4 py-10 sm:px-6 md:py-16">
      <div className="max-w-3xl">
        {order ? (
          <>
            <h1 className="h-display text-4xl md:text-6xl">Payment received.</h1>
            <p className="mt-4 text-lg text-ink-soft">Charged ${(order.amountCents / 100).toFixed(2)}.</p>

            <h2 className="mb-4 mt-10 text-xs font-medium uppercase tracking-widest text-ink-muted">What you get</h2>
            <ul className="grid gap-4 lg:grid-cols-3">
              {got.map((item) => (
                <li key={item.title} className="rounded-2xl border border-line bg-white p-5">
                  <item.icon />
                  <p className="mt-3 font-medium">{item.title}</p>
                </li>
              ))}
            </ul>

            <h2 className="mb-4 mt-10 text-xs font-medium uppercase tracking-widest text-ink-muted">What to do next</h2>
            <ol className="grid gap-3 lg:grid-cols-3">
              {next.map((label, index) => (
                <li key={label} className="rounded-2xl border border-line bg-white p-5">
                  <p className="text-2xl font-semibold tabular-nums">{index + 1}</p>
                  <p className="mt-2 font-medium">{label}</p>
                </li>
              ))}
            </ol>

            {order.token && (
              <Link
                href={`/intake?token=${encodeURIComponent(order.token)}`}
                className="mt-8 inline-flex min-h-12 items-center rounded-xl bg-ink px-6 text-base font-medium text-paper hover:bg-signal"
              >
                Submit the URL
              </Link>
            )}
            <p className="mt-6 text-base text-ink-soft">
              Questions:{" "}
              <a className="text-accent underline-offset-2 hover:underline" href={`mailto:${siteConfig.email}`}>
                {siteConfig.email}
              </a>
            </p>
          </>
        ) : (
          <>
            <h1 className="h-display text-4xl md:text-5xl">We couldn&apos;t confirm payment.</h1>
            <p className="mt-4 text-lg text-ink-soft">
              Email{" "}
              <a className="text-accent underline-offset-2 hover:underline" href={`mailto:${siteConfig.email}`}>
                {siteConfig.email}
              </a>
              .
            </p>
          </>
        )}
        {sp.session_id && <FinalizeOnLoad sessionId={sp.session_id} />}
      </div>
    </section>
  );
}

function FilesIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 3.5h7l5 5V20.5H7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M14 3.5V9h5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function GuideIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 5.5h9.5A2.5 2.5 0 0 1 18 8v12H8.5A2.5 2.5 0 0 1 6 17.5z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6 5.5A2.5 2.5 0 0 1 8.5 3H16" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function ScoreIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 16l4-4 3 3 7-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
