import type { Metadata } from "next";
import { Section, Eyebrow } from "@/components/section";
import { ScopeLimits } from "@/components/scope-limits";
import { pageMetadata } from "@/lib/seo";
import { siteConfig, doneForYouCapLabel } from "@/lib/site";
import Link from "next/link";

const automated = siteConfig.pricing.express;
const byHand = siteConfig.pricing.concierge;

export const metadata: Metadata = pageMetadata({
  title: "How it works",
  description: `${siteConfig.editing.lead} ${automated.name} is $${automated.price}, an automated migration of a simple site. ${byHand.name} is $${byHand.price}, done by hand inside a cap. No preview before you pay.`,
  path: "/how-it-works",
});

const steps = [
  {
    n: "01",
    title: "You leave with a site you can edit by chatting",
    body: `${siteConfig.editing.lead} ${siteConfig.editing.included} That is the point of the move. The steps below are how a simple site gets there.`,
    detail: "ChatGPT, Claude, or Cursor. Your agent, not a seat we bill.",
  },
  {
    n: "02",
    title: "You paste a URL",
    body: "The scan reads the public homepage and reports the platform plus a rough page count. It does not rebuild the site, extract a CMS, or show a preview of a new design.",
    detail: "No email. No signup. Not a quote for stores or apps.",
  },
  {
    n: "03",
    title: "We both check the scope",
    body: "Eject takes marketing pages, portfolios, and landing pages. If the scan or a look at the site shows a cart, memberships, bookings, several languages, or a large blog, we stop. The list of what we refer out is on this page.",
    detail: "Out of scope means we don't take the money.",
  },
  {
    n: "04",
    title: `You pick ${automated.name} or ${byHand.name}`,
    body: `${automated.name} is $${automated.price}: we run an automated migration of a simple site, and you review it before DNS. ${byHand.name} is $${byHand.price}: a person does the move by hand, ${doneForYouCapLabel()}. You pay first. There is no preview of a rebuilt site before payment. Beyond the cap, we refer out or quote an add-on.`,
    detail: "One payment. We don't bill a monthly editor.",
  },
  {
    n: "05",
    title: "Automated pass, or a person, then your review",
    body: `${automated.name} produces the in-scope pages and you review them. ${byHand.name} is hand work inside the cap, including ${byHand.cap.revisionRounds} revision rounds and a ${byHand.cap.handoffMinutes}-minute handoff. Neither extracts a CMS. We don't promise a fixed number of days.`,
    detail: "You review before DNS. That review is not a preview before payment.",
  },
  {
    n: "06",
    title: "You put it on a host you control",
    body: `Both offers include a short deploy guide for a free static host. ${byHand.name} also helps you do that in an account in your name. Eject does not keep the hosting login.`,
    detail: "Cloudflare Pages, Vercel, Netlify, or GitHub Pages.",
  },
  {
    n: "07",
    title: "You point the domain, then you chat",
    body: "Same domain, at your registrar. Switch DNS only after you have reviewed the new pages. Later changes are a chat with your own AI, using the included agent instructions. We don't claim rankings will stay put or that PageSpeed will jump.",
    detail: "Email support for 30 days if you get stuck.",
  },
];

export default function Page() {
  return (
    <>
      <Section className="pb-0">
        <Eyebrow>How it works</Eyebrow>
        <h1 className="h-display text-5xl md:text-7xl tracking-tightest max-w-4xl mb-5">
          Edit by chatting. <span className="text-signal">After a simple-site move.</span>
        </h1>
        <p className="text-ink-soft max-w-2xl text-lg">
          {siteConfig.editing.included} {automated.name} is automated and reviewed before DNS. {byHand.name} is hand work inside a cap. No CMS extraction. No preview before you pay.
        </p>
      </Section>

      <Section>
        {steps.map((s) => (
          <div key={s.n} className="grid md:grid-cols-[140px_1fr] gap-x-8 py-10 border-b border-line">
            <div className="text-signal font-mono text-sm tracking-widest pt-1">{s.n}</div>
            <div>
              <h2 className="text-2xl md:text-3xl h-section mb-3 max-w-2xl">{s.title}</h2>
              <p className="text-ink-soft leading-relaxed max-w-2xl mb-3">{s.body}</p>
              <p className="text-xs font-mono uppercase tracking-widest text-ink-muted">{s.detail}</p>
            </div>
          </div>
        ))}
      </Section>

      <ScopeLimits />

      <Section>
        <div className="rounded-2xl bg-ink text-paper p-10 md:p-14 text-center">
          <h2 className="h-section text-3xl md:text-4xl mb-4">See if the scan even applies.</h2>
          <p className="text-paper/70 max-w-xl mx-auto mb-7">
            It names the platform. It does not build a new site.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-signal text-paper px-6 py-3 text-sm font-medium hover:bg-paper hover:text-ink transition"
          >
            Scan a URL →
          </Link>
        </div>
      </Section>
    </>
  );
}
