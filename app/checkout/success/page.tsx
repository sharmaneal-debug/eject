import type { Metadata } from "next";
import Link from "next/link";
import { Section, Eyebrow } from "@/components/section";

export const metadata: Metadata = {
 title: "You're in",
 description: "Migration kickoff in your inbox in the next 5 minutes.",
};

export default async function Page() {
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
 Check your inbox in the next 5 minutes for a kickoff email. We&apos;ll confirm your site URL,
 ask a few quick questions, and start the migration.
 </p>

 <div className="rounded-2xl border border-line bg-paper-warm p-6 mb-8">
 <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-4">
 What happens next
 </p>
 <ol className="space-y-3 text-sm">
 <li className="flex gap-3">
 <span className="font-mono text-signal w-6 shrink-0">01</span>
 <span className="text-ink-soft">
 <strong className="text-ink">Within 5 min:</strong> kickoff email with a short questionnaire.
 </span>
 </li>
 <li className="flex gap-3">
 <span className="font-mono text-signal w-6 shrink-0">02</span>
 <span className="text-ink-soft">
 <strong className="text-ink">Within 24 hr:</strong> we crawl your site and confirm scope.
 </span>
 </li>
 <li className="flex gap-3">
 <span className="font-mono text-signal w-6 shrink-0">03</span>
 <span className="text-ink-soft">
 <strong className="text-ink">Day 4:</strong> we send a preview of the rebuilt site.
 </span>
 </li>
 <li className="flex gap-3">
 <span className="font-mono text-signal w-6 shrink-0">04</span>
 <span className="text-ink-soft">
 <strong className="text-ink">Day 7:</strong> we hand you the keys.
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
 </div>
 </Section>
 );
}
