import type { Metadata } from "next";
import { Section, Eyebrow } from "@/components/section";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How it works",
  description: "We move your website off Webflow, Framer, Wix, or Squarespace and onto free hosting. In 7 days. Here's exactly what happens.",
};

const steps = [
  {
    n: "01",
    title: "You paste your URL",
    body: "On our homepage. We scan your site for free in a few seconds — we tell you what platform you're on, how many pages you have, and what you're paying.",
    detail: "No email needed. No signup.",
  },
  {
    n: "02",
    title: "You pick a tier",
    body: "Two options. We move your site for $299. Or we move it AND give you the kit to keep editing it yourself with any AI for $499.",
    detail: "One payment. No subscription, ever.",
  },
  {
    n: "03",
    title: "We rebuild your site",
    body: "We copy your site exactly as it looks today — same fonts, same colors, same layout. We move every blog post, every page, every form. Nothing gets lost.",
    detail: "Average turnaround: 7 days.",
  },
  {
    n: "04",
    title: "We set up free hosting",
    body: "Your new site goes live on Cloudflare's free tier. Same speed (often faster). Free SSL. Free CDN. Zero monthly bill.",
    detail: "We handle the technical part. You just approve.",
  },
  {
    n: "05",
    title: "We move your domain over",
    body: "Same URL. Same Google rankings. Same email forwarding. Old links keep working. Your visitors don't notice anything changed.",
    detail: "We coordinate with you so it happens at a quiet time.",
  },
  {
    n: "06",
    title: "You get the keys",
    body: "Your website files are yours. Your domain is yours. Your hosting account is yours. There's no Eject login — we hand it over and walk away.",
    detail: "You can hire any developer. You can use any AI. It's all yours.",
  },
  {
    n: "07",
    title: "You edit it forever, by chatting",
    body: "We give you copy-paste instructions for ChatGPT, Claude, or Cursor (free tiers all work). Type \"change my hero to say X.\" Done. No coding.",
    detail: "Free editor support for 30 days, in case you get stuck.",
  },
];

export default function Page() {
  return (
    <>
      <Section className="pb-0">
        <Eyebrow>How it works</Eyebrow>
        <h1 className="h-display text-5xl md:text-7xl tracking-tightest max-w-4xl mb-5">
          From your old site <span className="text-signal">→</span>{" "}
          <span className="text-ink/40">free hosting, in a week.</span>
        </h1>
        <p className="text-ink-soft max-w-2xl text-lg">
          Seven steps. No magic. No lock-in. Below is exactly what happens after you say go.
        </p>
      </Section>

      <Section>
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
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div>
            <Eyebrow>Honest about the limits</Eyebrow>
            <h2 className="h-section text-3xl md:text-4xl mb-4 max-w-md">
              Some sites we won&apos;t take.
            </h2>
            <p className="text-ink-soft leading-relaxed max-w-md">
              We turn down work when it&apos;s the right call. If your site is a real online store
              with hundreds of products, or runs in multiple languages, or has customer logins —
              you need a developer, not a productized service. We&apos;ll tell you upfront and refund
              the deposit.
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-7">
            <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-4">
              We currently don&apos;t do
            </p>
            <ul className="space-y-3 text-sm text-ink-soft">
              <li>· Online stores with 200+ products and a real cart</li>
              <li>· Sites with member-only / login areas</li>
              <li>· Sites running in multiple languages</li>
              <li>· Shopify or WordPress (Webflow / Framer / Wix / Squarespace only)</li>
              <li>· Sites with custom subscription billing</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section>
        <div className="rounded-2xl bg-ink text-paper p-10 md:p-14 text-center">
          <h2 className="h-section text-3xl md:text-4xl mb-4">
            Ready to see what your site would look like?
          </h2>
          <p className="text-paper/70 max-w-xl mx-auto mb-7">
            Free scan. Takes a few seconds. No email needed.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-signal text-paper px-6 py-3 text-sm font-medium hover:bg-paper hover:text-ink transition"
          >
            Scan my site →
          </Link>
        </div>
      </Section>
    </>
  );
}
