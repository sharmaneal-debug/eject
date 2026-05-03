import type { Metadata } from "next";
import { CostCalculator } from "@/components/cost-calculator";
import { Section, Eyebrow } from "@/components/section";

export const metadata: Metadata = {
 title: "Cost calculator. See what you'd save",
 description:
 "Plug in your Webflow / Framer / Wix / Squarespace plan. See what you'd save by moving to a website you own. One-time payment, free hosting, free AI editing.",
};

export default function Page() {
 return (
 <>
 <Section className="pb-0">
 <Eyebrow>Cost calculator</Eyebrow>
 <h1 className="h-display text-5xl md:text-7xl tracking-tightest max-w-4xl mb-5">
 Plug in your numbers.{" "}
 <span className="text-signal">See what you&apos;d save.</span>
 </h1>
 <p className="text-ink-soft max-w-2xl text-lg">
 Most small businesses are paying $300–$1,200 a year for a website that&apos;s mostly text. With Eject you pay once. Then nothing.
 </p>
 </Section>
 <Section>
 <CostCalculator />
 <div className="mt-12 grid md:grid-cols-3 gap-5 text-sm text-ink-soft">
 <div className="rounded-xl border border-line bg-paper-warm p-6">
 <p className="font-medium text-ink mb-1">What we count</p>
 <p>Your platform plan + extra seats above the first. We don&apos;t double-count the domain. You pay that to your registrar either way.</p>
 </div>
 <div className="rounded-xl border border-line bg-paper-warm p-6">
 <p className="font-medium text-ink mb-1">Eject ongoing cost</p>
 <p><span className="font-semibold text-signal">$0/year.</span> Cloudflare hosting is free. Editing your site with ChatGPT or Claude free tier is free. There&apos;s nothing to pay us after the one-time fee.</p>
 </div>
 <div className="rounded-xl border border-line bg-paper-warm p-6">
 <p className="font-medium text-ink mb-1">When this isn&apos;t honest</p>
 <p>If your site does 1M+ pageviews a month or has 200+ products, you&apos;d need Cloudflare&apos;s $5/mo Pro tier. That&apos;s rare for small business sites. Most never hit it.</p>
 </div>
 </div>
 </Section>
 </>
 );
}
