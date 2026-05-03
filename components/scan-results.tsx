"use client";

import Link from "next/link";
import { siteConfig } from "@/lib/site";

export type ScanData = {
 ok: true;
 url: string;
 platform: "webflow" | "framer" | "wix" | "squarespace" | "shopify" | "wordpress" | "other";
 platformLabel: string;
 title: string;
 description: string;
 pageCount: number;
 monthlyCostEstimate: number;
 annualCostEstimate: number;
 threeYearCostEstimate: number;
 ejectThreeYearCost: number;
 threeYearSavings: number;
 durationMs: number;
};

const SUPPORTED_PLATFORMS = ["webflow", "framer", "wix", "squarespace", "wordpress"];

export function ScanResults({ data }: { data: ScanData }) {
 const supported = SUPPORTED_PLATFORMS.includes(data.platform);
 const hostname = (() => {
 try {
 return new URL(data.url).hostname.replace(/^www\./, "");
 } catch {
 return data.url;
 }
 })();

 // Eject 3-year cost when going through Express tier (cheapest path).
 // Domain renewal is paid to your registrar either way. Same on both
 // sides. So we don't count it. Hosting + AI editor are genuinely $0.
 const ejectExpress3yr = siteConfig.pricing.express.price;

 return (
 <section
 id="scan-results"
 className="border-y border-line bg-paper-warm scroll-mt-24"
 >
 <div className="max-w-content mx-auto px-6 py-12 md:py-16">
 <div className="flex items-baseline justify-between flex-wrap gap-4 mb-2">
 <p className="text-xs font-mono uppercase tracking-widest text-ink-muted">
 ✓ Scanned in {(data.durationMs / 1000).toFixed(1)}s
 </p>
 <p className="text-xs font-mono text-ink-muted truncate max-w-md">{hostname}</p>
 </div>

 <h2 className="h-section text-3xl md:text-5xl mb-2 max-w-3xl">
 Here&apos;s what we found.
 </h2>
 {data.title && <p className="text-ink-soft text-lg mb-10 max-w-2xl">{data.title}</p>}

 <div className="grid md:grid-cols-3 gap-4 md:gap-5 mb-10">
 <Stat label="Your platform" value={data.platformLabel} sub={supported ? "We migrate this." : "We don't migrate this yet. See below."} />
 <Stat
 label="Pages we found"
 value={data.pageCount > 0 ? data.pageCount.toString() : ""}
 sub={data.pageCount > 0 ? "From your sitemap" : "We'll discover them when we crawl"}
 />
 <Stat
 label="What you're paying"
 value={`$${data.annualCostEstimate}/yr`}
 sub={`Roughly $${data.monthlyCostEstimate}/month. Typical ${data.platformLabel} plans`}
 accent
 />
 </div>

 {supported ? (
 <>
 <div className="rounded-2xl border border-line bg-white p-7 md:p-9 mb-10">
 <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-10 items-center">
 <div>
 <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-2">
 Over the next 3 years on {data.platformLabel}
 </p>
 <p className="text-4xl md:text-5xl h-display tracking-tightest">${data.threeYearCostEstimate.toLocaleString()}</p>
 </div>
 <div className="text-3xl text-ink/30 hidden md:block">→</div>
 <div>
 <p className="text-xs font-mono uppercase tracking-widest text-signal mb-2">
 Same site, on Eject Express
 </p>
 <p className="text-4xl md:text-5xl h-display tracking-tightest text-signal">
 ${ejectExpress3yr.toLocaleString()}
 </p>
 <p className="text-xs text-ink-muted mt-1 font-mono">
 $49 once. Run the playbook in an afternoon. No more bills.
 </p>
 </div>
 </div>
 {data.threeYearCostEstimate > ejectExpress3yr && (
 <div className="mt-6 pt-6 border-t border-line">
 <p className="text-sm">
 You&apos;d save{" "}
 <span className="font-semibold text-signal">
 ${(data.threeYearCostEstimate - ejectExpress3yr).toLocaleString()}
 </span>{" "}
 over 3 years. Forever after that, it&apos;s just the cost of your domain.
 </p>
 </div>
 )}
 </div>

 <div className="mb-12">
 <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-5">
 Two ways to do this
 </p>
 <div className="grid md:grid-cols-2 gap-px bg-line rounded-2xl overflow-hidden border border-line">
 <Path
 badge="Express · $49"
 title="Get the playbook. Rebuild your site yourself, with AI doing the work."
 steps={[
 "Pay $49",
 "Get a step-by-step playbook + AI prompts customized to your site",
 "Paste prompts into ChatGPT, Claude, or Cursor (free tiers all work)",
 "AI rebuilds your site, page by page. ~1 afternoon, hands-on",
 "Deploy on free hosting with the included 10-min guide",
 ]}
 />
 <Path
 badge="Concierge · $299"
 title="Don't want to run the playbook yourself? We do every step for you."
 steps={[
 "Pay $299",
 "We run the playbook on our infrastructure",
 "We deploy on free hosting in your name and move your domain",
 "You get a preview link to review",
 "Live in 7 days, one round of revisions included",
 ]}
 dark
 />
 </div>
 </div>

 <div className="grid md:grid-cols-2 gap-4">
 <Link
 href={`/checkout?tier=express&url=${encodeURIComponent(hostname)}`}
 className="rounded-2xl border-2 border-line bg-white p-7 hover:border-ink transition group"
 >
 <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-2">{siteConfig.pricing.express.name}</p>
 <p className="h-section text-3xl md:text-4xl mb-2">
 ${siteConfig.pricing.express.price}
 <span className="text-ink-muted text-base font-normal"> · one-time</span>
 </p>
 <p className="text-ink-soft text-sm mb-4">{siteConfig.pricing.express.blurb}</p>
 <p className="text-ink text-sm font-medium">
 {siteConfig.pricing.express.cta} <span className="group-hover:translate-x-1 inline-block transition">→</span>
 </p>
 </Link>
 <Link
 href={`/checkout?tier=concierge&url=${encodeURIComponent(hostname)}`}
 className="rounded-2xl border-2 border-ink bg-ink text-paper p-7 hover:bg-signal hover:border-signal transition group"
 >
 <div className="flex items-baseline justify-between mb-2">
 <p className="text-xs font-mono uppercase tracking-widest text-paper/60">{siteConfig.pricing.concierge.name}</p>
 <span className="text-[10px] font-mono uppercase tracking-widest bg-signal text-paper rounded-full px-2 py-0.5">
 Most popular
 </span>
 </div>
 <p className="h-section text-3xl md:text-4xl mb-2">
 ${siteConfig.pricing.concierge.price}
 <span className="text-paper/50 text-base font-normal"> · one-time</span>
 </p>
 <p className="text-paper/80 text-sm mb-4">{siteConfig.pricing.concierge.blurb}</p>
 <p className="text-paper text-sm font-medium">
 {siteConfig.pricing.concierge.cta} <span className="group-hover:translate-x-1 inline-block transition">→</span>
 </p>
 </Link>
 </div>
 </>
 ) : (
 <div className="rounded-2xl border border-line bg-white p-7 md:p-9">
 <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-2">Heads up</p>
 <p className="font-medium text-lg mb-2">
 Looks like your site is on {data.platformLabel}. We don&apos;t migrate that yet.
 </p>
 <p className="text-ink-soft mb-5">
 We currently move sites off Webflow, Framer, Wix, Squarespace, and WordPress. If your site is on something else, drop us a line and we&apos;ll tell you whether it&apos;s a fit.
 </p>
 <Link
 href={`mailto:${siteConfig.email}?subject=My site is on ${data.platformLabel}`}
 className="inline-flex items-center gap-2 text-accent text-sm font-medium hover:text-signal"
 >
 Email us about your site →
 </Link>
 </div>
 )}
 </div>
 </section>
 );
}

function Stat({ label, value, sub, accent = false }: { label: string; value: string; sub: string; accent?: boolean }) {
 return (
 <div className="rounded-xl border border-line bg-white p-5">
 <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-2">{label}</p>
 <p className={`text-3xl h-section tracking-tight mb-1 ${accent ? "text-signal" : "text-ink"}`}>{value}</p>
 <p className="text-xs text-ink-muted leading-snug">{sub}</p>
 </div>
 );
}

function Path({ badge, title, steps, dark = false }: { badge: string; title: string; steps: string[]; dark?: boolean }) {
 return (
 <div className={`p-7 md:p-9 ${dark ? "bg-ink text-paper" : "bg-white"}`}>
 <p className={`text-xs font-mono uppercase tracking-widest mb-4 ${dark ? "text-paper/60" : "text-signal"}`}>
 {badge}
 </p>
 <p className={`font-semibold text-xl tracking-tight mb-5 ${dark ? "text-paper" : "text-ink"}`}>
 {title}
 </p>
 <ol className={`space-y-2.5 text-sm ${dark ? "text-paper/80" : "text-ink-soft"}`}>
 {steps.map((s, i) => (
 <li key={i} className="flex gap-3">
 <span className={`font-mono text-xs shrink-0 w-5 ${dark ? "text-signal" : "text-signal"}`}>
 {String(i + 1).padStart(2, "0")}
 </span>
 <span className="leading-snug">{s}</span>
 </li>
 ))}
 </ol>
 </div>
 );
}
