import type { Metadata } from "next";
import Link from "next/link";
import { Section, Eyebrow } from "@/components/section";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "14-day full refund. No arguments. Here's how it works.",
};

const LAST_UPDATED = "May 3, 2026";

export default function Page() {
  return (
    <>
      <Section className="pb-0">
        <Eyebrow>Refunds</Eyebrow>
        <h1 className="h-display text-4xl md:text-6xl tracking-tightest mb-5 max-w-3xl">
          14-day refund. <span className="text-ink/40">No arguments.</span>
        </h1>
        <p className="text-ink-soft text-lg max-w-2xl">
          Last updated: {LAST_UPDATED}.
        </p>
      </Section>

      <Section>
        <div className="max-w-3xl prose-lite space-y-6 text-ink-soft leading-relaxed">
          <p>
            We sell migrations. If we do the migration and you&apos;re not happy, we refund you. That&apos;s the whole policy. Below is the longer version with the small print.
          </p>

          <h2 className="h-section text-2xl text-ink mt-10">The promise</h2>
          <p>
            Within <strong className="text-ink">14 days of receiving your migration</strong> (the moment we send you the preview link or the final files, whichever comes first), if you&apos;re not happy with the result, email{" "}
            <a className="text-accent hover:text-signal" href={`mailto:${siteConfig.email}`}>
              {siteConfig.email}
            </a>
            {" "}and we&apos;ll refund 100% of what you paid. No phone call. No survey. No lecture.
          </p>

          <h2 className="h-section text-2xl text-ink mt-10">What &ldquo;not happy&rdquo; means</h2>
          <p>You don&apos;t need to justify it. But here are common reasons people use this:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>The rebuild doesn&apos;t look enough like the original</li>
            <li>An interactive element didn&apos;t carry over</li>
            <li>You changed your mind about migrating</li>
            <li>You realized you needed something we don&apos;t offer (e.g., heavy ecommerce)</li>
          </ul>

          <h2 className="h-section text-2xl text-ink mt-10">How long it takes</h2>
          <p>
            We process refunds within <strong className="text-ink">5 business days</strong>. The funds typically appear back on your card within 3&ndash;10 business days after that, depending on your bank. Stripe handles the actual refund.
          </p>

          <h2 className="h-section text-2xl text-ink mt-10">After the refund</h2>
          <p>If we refund you:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>You stop using the migrated files we sent you (delete the local copy, take down any deployment we made on your behalf)</li>
            <li>We stop hosting any preview link we created for you</li>
            <li>If we moved your domain to a hosting account, you keep the domain (you always owned it)</li>
            <li>We delete the snapshot of your old site within 30 days</li>
          </ul>

          <h2 className="h-section text-2xl text-ink mt-10">When the 14-day window starts</h2>
          <p>The clock starts when:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-ink">Express:</strong> we email you the preview link of the rebuilt site</li>
            <li><strong className="text-ink">Concierge:</strong> we email you the preview link, OR we deploy your site, whichever happens first</li>
          </ul>
          <p>
            If we&apos;re late delivering (more than 7 days for Concierge), the 14-day window doesn&apos;t start until we actually deliver.
          </p>

          <h2 className="h-section text-2xl text-ink mt-10">When refunds don&apos;t apply</h2>
          <p>We can&apos;t offer a refund in two narrow cases:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>If the request comes more than 14 days after delivery (we&apos;ve already done the work and you&apos;ve had time to use it)</li>
            <li>If you initiated a chargeback through your bank instead of contacting us first &mdash; the chargeback fee makes a refund-on-top a loss for us. Email us first; we will refund you the same way the bank would, faster.</li>
          </ul>

          <h2 className="h-section text-2xl text-ink mt-10">If something else broke</h2>
          <p>
            Outside the 14-day window, we&apos;re still on the hook for things we did wrong. If the site we delivered has a bug we shipped, email us with what&apos;s broken and we&apos;ll fix it for free as long as we made the original mistake. This isn&apos;t a refund &mdash; it&apos;s a fix.
          </p>
          <p>
            We don&apos;t fix changes you made yourself after handoff (e.g., the AI editor went sideways on a prompt). For those we charge an hourly rate, or you can solve it yourself for free with a different prompt.
          </p>

          <h2 className="h-section text-2xl text-ink mt-10">Contact</h2>
          <p>
            All refund requests go to{" "}
            <a className="text-accent hover:text-signal" href={`mailto:${siteConfig.email}`}>
              {siteConfig.email}
            </a>
            . A real human reads every one. We respond within one business day.
          </p>

          <p className="text-sm text-ink-muted mt-8 pt-6 border-t border-line">
            Eject is a service of {siteConfig.legalEntity.name}.
          </p>
        </div>
      </Section>

      <Section className="bg-paper-warm pt-10">
        <div className="rounded-2xl border border-line bg-white p-7 max-w-3xl">
          <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-2">Companion documents</p>
          <ul className="text-sm space-y-1 text-accent">
            <li><Link className="hover:text-signal" href="/privacy">Privacy Policy</Link></li>
            <li><Link className="hover:text-signal" href="/terms">Terms of Service</Link></li>
          </ul>
        </div>
      </Section>
    </>
  );
}
