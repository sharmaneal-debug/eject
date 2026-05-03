import type { Metadata } from "next";
import Link from "next/link";
import { Section, Eyebrow } from "@/components/section";
import { FinalizeOnLoad } from "@/components/finalize-on-load";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "You're in",
  description: "Migration kickoff in your inbox in the next few minutes.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const sp = await searchParams;
  const sessionId = sp.session_id;

  return (
    <Section>
      <div className="max-w-2xl">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-signal/15 text-signal mb-6 font-mono text-xl">
          ✓
        </div>
        <Eyebrow>Payment received</Eyebrow>
        <h1 className="h-display text-4xl md:text-6xl tracking-tightest mb-5">
          You&apos;re in.
        </h1>
        <p className="text-ink-soft text-lg leading-relaxed mb-8 max-w-lg">
          Check your inbox in the next few minutes for a kickoff email. We&apos;ll
          confirm your site URL and start the migration.
        </p>

        <div className="rounded-2xl border border-line bg-paper-warm p-6 mb-8">
          <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-4">
            What happens next
          </p>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="font-mono text-signal w-6 shrink-0">01</span>
              <span className="text-ink-soft">
                <strong className="text-ink">In your inbox now:</strong> kickoff email with what to expect.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-signal w-6 shrink-0">02</span>
              <span className="text-ink-soft">
                <strong className="text-ink">Within 24 hours:</strong> we start crawling and rebuilding your site.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-signal w-6 shrink-0">03</span>
              <span className="text-ink-soft">
                <strong className="text-ink">Day 4 (Concierge) / 24–48 hr (Express):</strong> preview link to review.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-signal w-6 shrink-0">04</span>
              <span className="text-ink-soft">
                <strong className="text-ink">Once you approve:</strong> we hand you the keys and the AI editing kit.
              </span>
            </li>
          </ol>
        </div>

        <p className="text-sm text-ink-muted">
          Questions in the meantime? Email{" "}
          <a href="mailto:hi@eject.co" className="text-accent hover:text-signal">hi@eject.co</a>.
        </p>

        <Link href="/" className="mt-10 inline-flex text-sm text-ink-muted hover:text-ink">
          ← back to home
        </Link>

        {sessionId && <FinalizeOnLoad sessionId={sessionId} />}
      </div>
    </Section>
  );
}
