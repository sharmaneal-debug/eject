import Link from "next/link";
import { Section, Eyebrow } from "./section";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

const tiers = [
  {
    id: "diy",
    name: "DIY Guided",
    price: 49,
    period: "one-time",
    blurb: "URL in. Repo out. You deploy.",
    bullets: [
      "Crawl your live site to a Next.js codebase",
      "Cloudflare Pages deploy guide (Loom + checklist)",
      "Webflow CMS extracted to MDX",
      "Email support for 7 days",
    ],
    cta: "Start a migration",
    href: "/migrate?tier=diy",
    accent: false,
  },
  {
    id: "dwy",
    name: "Done-with-You",
    price: 299,
    period: "one-time",
    blurb: "We migrate. You launch on a 30-min Zoom.",
    bullets: [
      "Everything in DIY",
      "30-min pairing call to flip DNS together",
      "We wire forms (Resend) + 301 redirects",
      "14 days of editor support",
    ],
    cta: "Book a Done-with-You",
    href: "/migrate?tier=dwy",
    accent: true,
  },
  {
    id: "dfy",
    name: "Done-for-You",
    price: 1499,
    period: "one-time",
    blurb: "Hand off. Wired up. Editor trained.",
    bullets: [
      "Everything in Done-with-You",
      "7-day turnaround SLA",
      "Custom domain, SSL, sitemap, OG images",
      "AI editor pre-trained on your site",
      "30 days of unlimited editor support",
    ],
    cta: "Talk to us",
    href: "/migrate?tier=dfy",
    accent: false,
  },
];

const editor = [
  { name: "Hobby", price: 79, blurb: "Up to 50 chat-edits/mo. Preview deploys + rollback." },
  { name: "Pro", price: 149, blurb: "Unlimited edits. Monthly Lighthouse + SEO health report." },
];

export function PricingTable() {
  return (
    <Section className="bg-paper-warm">
      <Eyebrow>Pricing</Eyebrow>
      <h2 className="h-section text-3xl md:text-5xl max-w-3xl mb-3">
        Pay once. Own forever. <span className="text-ink/40">Optional retainer keeps the chatbot fresh.</span>
      </h2>
      <p className="text-ink-soft max-w-2xl mb-12">
        No platform tax. No per-seat upcharges. Cancel the editor any time and your site keeps running on Cloudflare for free.
      </p>

      <div className="grid md:grid-cols-3 gap-5 mb-16">
        {tiers.map((t) => (
          <div
            key={t.id}
            className={cn(
              "rounded-2xl bg-white p-7 flex flex-col border",
              t.accent ? "border-ink shadow-[0_24px_60px_-24px_rgba(11,11,15,0.15)]" : "border-line"
            )}
          >
            <div className="flex items-baseline justify-between mb-1">
              <h3 className="font-semibold text-lg">{t.name}</h3>
              {t.accent && (
                <span className="text-[10px] font-mono uppercase tracking-widest bg-signal text-paper rounded-full px-2 py-0.5">
                  Most popular
                </span>
              )}
            </div>
            <p className="text-ink-muted text-sm mb-5">{t.blurb}</p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-5xl h-display tracking-tightest">${t.price}</span>
              <span className="text-ink-muted text-sm">/ {t.period}</span>
            </div>
            <ul className="space-y-3 mb-7 text-sm flex-1">
              {t.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-signal mt-0.5 shrink-0" />
                  <span className="text-ink-soft">{b}</span>
                </li>
              ))}
            </ul>
            <Link
              href={t.href}
              className={cn(
                "rounded-lg px-4 py-3 text-sm font-medium text-center transition",
                t.accent ? "bg-ink text-paper hover:bg-signal" : "bg-paper-warm text-ink hover:bg-ink hover:text-paper"
              )}
            >
              {t.cta}
            </Link>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-white p-7 md:p-9">
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-6">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-1">Optional retainer</p>
            <h3 className="font-semibold text-2xl tracking-tight">Editor — chat-edit your site forever</h3>
          </div>
          <p className="text-sm text-ink-muted max-w-md">
            After migration, keep editing in plain English. Each edit becomes a real git commit, deployed via Cloudflare. Cancel anytime.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {editor.map((e) => (
            <div key={e.name} className="rounded-xl border border-line bg-paper-warm p-6">
              <div className="flex items-baseline justify-between">
                <p className="font-semibold">{e.name}</p>
                <p className="text-2xl font-semibold tabular-nums">
                  ${e.price}<span className="text-ink-muted text-sm">/mo</span>
                </p>
              </div>
              <p className="text-sm text-ink-soft mt-2">{e.blurb}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
