import type { Metadata } from "next";
import Link from "next/link";
import { Section, Eyebrow } from "@/components/section";
import { listKitPages } from "@/lib/kit";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Express Kit",
  description: "The kit you get when you pay for Eject Express. Playbook, AI prompts, deploy guide, editing kit.",
};

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ session?: string; site?: string }>;
}) {
  const pages = listKitPages();
  return (
    <>
      <Section className="pb-0">
        <Eyebrow>Express Kit</Eyebrow>
        <h1 className="h-display text-4xl md:text-6xl tracking-tightest mb-5 max-w-3xl">
          Welcome. <span className="text-ink/40">Let&apos;s rebuild your site.</span>
        </h1>
        <p className="text-ink-soft text-lg leading-relaxed max-w-2xl">
          Four documents. A starter template. ~4 hours of focused time. End state: a website you own,
          on free hosting, editable forever by chatting with any AI.
        </p>
      </Section>

      <Section>
        <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-6">
          Start with the Playbook. The other three are referenced from inside it.
        </p>
        <div className="grid md:grid-cols-2 gap-5 max-w-4xl">
          {pages.map((p) => (
            <Link
              key={p.slug}
              href={`/kit/${p.slug}`}
              className="rounded-2xl border border-line bg-white p-7 hover:border-ink transition group"
            >
              <div className="flex items-baseline gap-3 mb-3">
                <span className="font-mono text-xs text-signal tracking-widest">{p.icon}</span>
                <span className="h-px flex-1 bg-line" />
                {p.estimatedMinutes !== undefined && p.estimatedMinutes > 0 && (
                  <span className="font-mono text-xs text-ink-muted">{p.estimatedMinutes} min</span>
                )}
              </div>
              <h2 className="font-semibold text-xl tracking-tight mb-2 group-hover:text-signal transition">
                {p.title}
              </h2>
              <p className="text-ink-soft leading-relaxed text-sm">{p.description}</p>
              <p className="mt-4 text-sm font-medium text-ink group-hover:text-signal transition">
                Open <span className="group-hover:translate-x-1 inline-block transition">→</span>
              </p>
            </Link>
          ))}

          {/* Starter template card — links out to GitHub */}
          <a
            href="https://github.com/sharmaneal-debug/eject-starter"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-line bg-paper-warm p-7 hover:border-ink transition group"
          >
            <div className="flex items-baseline gap-3 mb-3">
              <span className="font-mono text-xs text-signal tracking-widest">05</span>
              <span className="h-px flex-1 bg-line" />
              <span className="font-mono text-xs text-ink-muted">GitHub</span>
            </div>
            <h2 className="font-semibold text-xl tracking-tight mb-2 group-hover:text-signal transition">
              Next.js + Tailwind Starter
            </h2>
            <p className="text-ink-soft leading-relaxed text-sm">
              The starter template the AI fills in with your content. Clone it from GitHub or use it
              as a reference. MIT license, yours forever.
            </p>
            <p className="mt-4 text-sm font-medium text-ink group-hover:text-signal transition">
              Clone on GitHub <span className="group-hover:translate-x-1 inline-block transition">↗</span>
            </p>
          </a>

          {/* Support card */}
          <div className="rounded-2xl border border-line bg-ink text-paper p-7 md:col-span-2">
            <div className="flex items-baseline gap-3 mb-3">
              <span className="font-mono text-xs text-signal tracking-widest">06</span>
              <span className="h-px flex-1 bg-paper/20" />
              <span className="font-mono text-xs text-paper/50">30 days</span>
            </div>
            <h2 className="font-semibold text-xl tracking-tight mb-2 text-paper">
              Email Support
            </h2>
            <p className="text-paper/70 leading-relaxed text-sm mb-4">
              Stuck on a step? Reply to your kickoff email or write directly to{" "}
              <a className="text-signal hover:text-paper" href={`mailto:${siteConfig.email}`}>
                {siteConfig.email}
              </a>
              . A real person responds within 24 hours, for the first 30 days after purchase.
            </p>
          </div>
        </div>
      </Section>

      <Section className="bg-paper-warm">
        <div className="max-w-3xl">
          <Eyebrow>How long this takes</Eyebrow>
          <h2 className="h-section text-2xl md:text-3xl mb-4">
            Plan one focused afternoon. About 4 hours.
          </h2>
          <p className="text-ink-soft leading-relaxed mb-3">
            Phase 1 (setup) is 15 minutes. Phase 2 (capture) is another 30. The bulk is Phase 3
            (rebuild) at 2 to 3 hours, depending on how many pages you have. Deploy is 10 minutes,
            domain cutover is 5, and the AI editor setup is another 5.
          </p>
          <p className="text-ink-soft leading-relaxed">
            If your site is over 30 pages, plan a second session for Phase 3. Most marketing sites
            are under 15 pages and finish in one afternoon.
          </p>
        </div>
      </Section>
    </>
  );
}
