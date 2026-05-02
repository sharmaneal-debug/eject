import type { Metadata } from "next";
import { Section, Eyebrow } from "@/components/section";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How it works",
  description: "From your live URL to a Next.js codebase on Cloudflare Pages in 7 days. Here's the pipeline.",
};

const steps = [
  {
    n: "01",
    title: "You paste your URL",
    body: "Webflow, Framer, Wix, Squarespace — anything we can render. We confirm we have written consent to migrate.",
    detail: "We don't crawl until you check the box.",
  },
  {
    n: "02",
    title: "We crawl every page",
    body: "Headless Playwright walks every internal link, captures rendered DOM + CSS + fonts + images + meta tags. We pull design tokens (colors, type scale, spacing).",
    detail: "Average site: 30–90 seconds. Heavy CMS sites: a few minutes.",
  },
  {
    n: "03",
    title: "We migrate your CMS",
    body: "Webflow CMS via API (you give us a read-only token). Framer collections via DOM walk. Wix via manual content extraction. Output defaults to MDX in your repo. Sanity / Payload available on request.",
    detail: "Every collection. Every field. Every reference.",
  },
  {
    n: "04",
    title: "AI rebuilds as Next.js components",
    body: "Captured pages get reconstructed as real Next.js + Tailwind components. Not iframes. Not screenshots. Real markup that any dev can edit.",
    detail: "Powered by Claude Sonnet + a battle-tested rebuild prompt.",
  },
  {
    n: "05",
    title: "We wire forms, redirects, sitemaps",
    body: "Old form endpoints get replaced by Resend. Every old URL gets a 301 redirect (so SEO survives). Sitemap auto-generates from your routes. Robots.txt is a file you can edit.",
    detail: "Yes, robots.txt is included. Without a $30 add-on.",
  },
  {
    n: "06",
    title: "We deploy to Cloudflare Pages",
    body: "Connected to your GitHub repo. Auto-deploys on every push. SSL is free. CDN is free. The free tier covers 100k requests/day with unlimited bandwidth.",
    detail: "Vercel works too if you prefer. Same DNS flip.",
  },
  {
    n: "07",
    title: "We hand you the GitHub repo",
    body: "Under your account, not ours. We don't keep a copy. We don't gate any feature flags. There's no us in the loop after handoff — unless you opt into the Editor retainer.",
    detail: "You own the code. You own the domain. You own the hosting.",
  },
  {
    n: "08",
    title: "Optional: chat-edit forever",
    body: "Add the Editor retainer ($79/mo) and you keep updating your site by typing in plain English. \"Change the hero headline.\" \"Add this testimonial.\" Each edit becomes a real git commit, deployed via Cloudflare.",
    detail: "Cancel anytime. The site keeps running on autopilot.",
  },
];

export default function Page() {
  return (
    <>
      <Section className="pb-0">
        <Eyebrow>How it works</Eyebrow>
        <h1 className="h-display text-5xl md:text-7xl tracking-tightest max-w-4xl mb-5">
          From URL in <span className="text-signal">→</span> Next.js out.{" "}
          <span className="text-ink/40">In about 7 days.</span>
        </h1>
        <p className="text-ink-soft max-w-2xl text-lg">
          Eight steps. No magic. Below is exactly what we do — including the unglamorous parts (DNS, redirects, sitemaps).
        </p>
      </Section>

      <Section>
        <div className="grid md:grid-cols-[140px_1fr] gap-x-8">
          <div />
          <div className="h-px bg-line" />
        </div>
        {steps.map((s) => (
          <div
            key={s.n}
            className="grid md:grid-cols-[140px_1fr] gap-x-8 py-10 border-b border-line"
          >
            <div className="text-signal font-mono text-sm tracking-widest pt-1">{s.n}</div>
            <div>
              <h3 className="text-2xl md:text-3xl h-section mb-3 max-w-2xl">{s.title}</h3>
              <p className="text-ink-soft leading-relaxed max-w-2xl mb-3">{s.body}</p>
              <p className="text-xs font-mono uppercase tracking-widest text-ink-muted">{s.detail}</p>
            </div>
          </div>
        ))}
      </Section>

      <Section className="bg-paper-warm">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <Eyebrow>The honest part</Eyebrow>
            <h2 className="h-section text-3xl md:text-4xl mb-4 max-w-md">
              Not every site is a fit.
            </h2>
            <p className="text-ink-soft leading-relaxed max-w-md">
              We turn down work when it&apos;s the right call. Heavy ecommerce (200+ SKUs), multi-language sites with localization workflows, and member-gated apps need engineering, not a productized service. We&apos;ll tell you upfront and refund the deposit.
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-7">
            <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-4">
              Sites we currently say no to
            </p>
            <ul className="space-y-3 text-sm text-ink-soft">
              <li>· Shopify migrations (we&apos;re Webflow/Framer/Wix/Squarespace only)</li>
              <li>· Sites with 200+ products and a real cart</li>
              <li>· Member-only apps with custom auth</li>
              <li>· Multi-language sites with translation pipelines (yet)</li>
              <li>· Webflow ecommerce sites with subscriptions (yet)</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section>
        <div className="rounded-2xl bg-ink text-paper p-10 md:p-14 text-center">
          <h2 className="h-section text-3xl md:text-4xl mb-4">
            Want to see this on your real site?
          </h2>
          <p className="text-paper/70 max-w-xl mx-auto mb-7">
            Free 5-min Loom audit. We&apos;ll show your real Lighthouse score, your real annual cost, and what we&apos;d ship.
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
