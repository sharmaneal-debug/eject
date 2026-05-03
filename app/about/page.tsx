import type { Metadata } from "next";
import { Section, Eyebrow } from "@/components/section";
import Link from "next/link";

export const metadata: Metadata = {
 title: "About",
 description: "Eject is a productized service that migrates your Framer/Webflow/Wix site to a Next.js codebase you own.",
};

export default function Page() {
 return (
 <>
 <Section>
 <Eyebrow>About</Eyebrow>
 <h1 className="h-display text-4xl md:text-6xl tracking-tightest mb-7 max-w-3xl">
 A small team. <span className="text-ink/40">A short list of opinions.</span>
 </h1>

 <div className="grid md:grid-cols-2 gap-12 max-w-5xl prose-lite">
 <div>
 <h2 className="text-2xl h-section mb-3">Why this exists</h2>
 <p className="mb-4">
 In 2026, you can host a fast, beautiful website for almost nothing. Cloudflare Pages is free. Domains are $12 a year. Next.js + Tailwind is the most-used frontend stack on earth.
 </p>
 <p className="mb-4">
 And yet a million solo founders, indie operators, and small agencies pay <strong>$300–$2,800 a year</strong> to no-code platforms for static marketing sites. The platforms make exporting deliberately painful. That&apos;s how the lock-in works.
 </p>
 <p>
 We exist to do the unglamorous part: extract, rebuild, deploy, hand you the keys. Then leave.
 </p>
 </div>

 <div>
 <h2 className="text-2xl h-section mb-3">What we won&apos;t do</h2>
 <ul className="space-y-2 text-ink-soft">
 <li>· Lock you in. There&apos;s nothing to unlock. The GitHub repo is yours.</li>
 <li>· Sell your data. We don&apos;t train on it. We don&apos;t resell it.</li>
 <li>· Up-charge for &quot;features&quot; like robots.txt or redirects. Those are just files.</li>
 <li>· Ship a flaky chat editor. If we can&apos;t make it reliable, we won&apos;t bill you for it.</li>
 <li>· Take work we shouldn&apos;t. Heavy ecommerce, multi-language, gated apps. We say no.</li>
 </ul>
 </div>
 </div>
 </Section>

 <Section className="bg-paper-warm">
 <div className="grid md:grid-cols-2 gap-12 items-start max-w-5xl">
 <div>
 <Eyebrow>The opinions</Eyebrow>
 <h2 className="h-section text-3xl md:text-4xl mb-4 max-w-md">
 Three things we believe.
 </h2>
 <p className="text-ink-soft max-w-md">
 You can disagree. The pricing is the same.
 </p>
 </div>
 <div className="space-y-7">
 <div>
 <p className="font-mono text-xs uppercase tracking-widest text-signal mb-2">No. 1</p>
 <p className="font-medium text-lg mb-1">Hosting is a commodity. Stop renting it.</p>
 <p className="text-ink-soft">
 Cloudflare, Netlify, Vercel, GitHub Pages. Pick any. They&apos;re all faster than Webflow. Most are free.
 </p>
 </div>
 <div>
 <p className="font-mono text-xs uppercase tracking-widest text-signal mb-2">No. 2</p>
 <p className="font-medium text-lg mb-1">Your CMS shouldn&apos;t be your prison.</p>
 <p className="text-ink-soft">
 A markdown file in a git repo is portable, diffable, and free. A &quot;CMS plan&quot; isn&apos;t.
 </p>
 </div>
 <div>
 <p className="font-mono text-xs uppercase tracking-widest text-signal mb-2">No. 3</p>
 <p className="font-medium text-lg mb-1">Non-technical people can edit code now.</p>
 <p className="text-ink-soft">
 A chatbot that knows your codebase is the visual editor of 2026. We just had to build it.
 </p>
 </div>
 </div>
 </div>
 </Section>

 <Section>
 <div className="rounded-2xl bg-ink text-paper p-10 md:p-14 text-center">
 <h2 className="h-section text-3xl md:text-4xl mb-4">Migrate your site.</h2>
 <p className="text-paper/70 max-w-xl mx-auto mb-7">
 Free 5-min Loom audit. We send it within 24 hours. No call required.
 </p>
 <Link
 href="/migrate"
 className="inline-flex items-center justify-center rounded-lg bg-signal text-paper px-6 py-3 text-sm font-medium hover:bg-paper hover:text-ink transition"
 >
 Start a free audit →
 </Link>
 </div>
 </Section>
 </>
 );
}
