import type { Metadata } from "next";
import Link from "next/link";
import { Section, Eyebrow } from "@/components/section";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The agreement between you and ${siteConfig.legalEntity.name} when you use Eject.`,
};

const LAST_UPDATED = "May 3, 2026";

export default function Page() {
  return (
    <>
      <Section className="pb-0">
        <Eyebrow>Terms</Eyebrow>
        <h1 className="h-display text-4xl md:text-6xl tracking-tightest mb-5 max-w-3xl">
          Terms of Service
        </h1>
        <p className="text-ink-soft text-lg max-w-2xl">
          Last updated: {LAST_UPDATED}.
        </p>
      </Section>

      <Section>
        <div className="max-w-3xl prose-lite space-y-6 text-ink-soft leading-relaxed">
          <p>
            These terms (&ldquo;Terms&rdquo;) are the agreement between you and{" "}
            <strong className="text-ink">{siteConfig.legalEntity.name}</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;) when you use Eject (eject is the brand; Laniakea LLC is the company). By visiting the site, submitting a URL, or paying for a tier, you accept these Terms.
          </p>

          <h2 className="h-section text-2xl text-ink mt-10">1. The service</h2>
          <p>Eject offers two tiers:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-ink">Express ($49)</strong> &mdash; an automated rebuild of your existing website (Webflow, Framer, Wix, or Squarespace) into a self-hosted Next.js codebase. You receive a preview link, the source files, and an AI editing kit (instructions for using ChatGPT, Claude, or similar tools to edit your site).
            </li>
            <li>
              <strong className="text-ink">Concierge ($299)</strong> &mdash; the same output, but a human at {siteConfig.legalEntity.name} hand-polishes the rebuild, deploys it for you, and moves your domain over. Delivery within 7 days of payment.
            </li>
          </ul>
          <p>
            We reserve the right to refuse or refund any order if the site is outside our scope (e.g., heavy ecommerce, multi-language with translation pipelines, sites with member logins, sites that violate the law).
          </p>

          <h2 className="h-section text-2xl text-ink mt-10">2. Your responsibilities</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You confirm you have the right to migrate the site you submit (i.e., you own it or have written permission from the owner).</li>
            <li>You will not submit content that infringes third-party intellectual property, that is illegal, that promotes hate or violence, or that violates Stripe&apos;s Restricted Businesses list.</li>
            <li>You will provide accurate contact information so we can deliver the service.</li>
            <li>You are responsible for renewing your domain, hosting account, and any third-party services (Sanity, Resend, etc.) we set up on your behalf after handoff.</li>
          </ul>

          <h2 className="h-section text-2xl text-ink mt-10">3. Payment</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Both tiers are paid up front, in full, in US dollars, via Stripe. We do not store your card.</li>
            <li>Prices are listed at <Link className="text-accent hover:text-signal" href="/pricing">/pricing</Link> and are subject to change at any time. The price you paid is the price for your order; future price changes do not retroactively apply.</li>
            <li>Sales tax may be added based on your billing location.</li>
          </ul>

          <h2 className="h-section text-2xl text-ink mt-10">4. Refunds</h2>
          <p>
            <strong className="text-ink">14-day refund, no arguments.</strong> Within 14 days of receiving your migration (the moment we email you the kit, the preview link, or the final files, whichever comes first), if you&apos;re not satisfied with the result, email{" "}
            <a className="text-accent hover:text-signal" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>{" "}
            and we&apos;ll refund 100% of what you paid. No phone call, no survey, no justification required.
          </p>
          <p>
            Refunds process within 5 business days. The funds appear back on your card within 3–10 business days after that, depending on your bank. If you initiated a chargeback through your bank instead of contacting us first, we can&apos;t also refund (the chargeback fee makes it a loss for us); email us first and we&apos;ll process the refund the same way.
          </p>
          <p>
            If you&apos;re refunded, you stop using any files we sent and remove any preview deployment we built. We delete our snapshot of your old site within 30 days. Your domain stays yours; you&apos;ve always owned it.
          </p>
          <p>
            Outside the 14-day window, we still fix bugs we shipped at no charge. Changes you made yourself after handoff are not covered.
          </p>

          <h2 className="h-section text-2xl text-ink mt-10">5. What you own</h2>
          <p>
            After we deliver, you own:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>The source code we generated (Next.js project, Tailwind config, content files)</li>
            <li>Any content we migrated (your text, images, blog posts)</li>
            <li>Your domain (you have always owned it)</li>
            <li>Your hosting account (you set it up; it is in your name)</li>
          </ul>
          <p>
            We retain no rights to your migrated site. We do not require attribution. We do not lock you in. There is nothing for you to cancel after handoff.
          </p>

          <h2 className="h-section text-2xl text-ink mt-10">6. What we own</h2>
          <p>
            The Eject brand, marketing site, blog content, scanner, rebuilder pipeline, AI editing kit templates, and supporting tooling are owned by {siteConfig.legalEntity.name}. We grant you a non-exclusive license to use the AI editing kit (the instruction file and prompt library) for editing your own site. You may not redistribute it as a standalone product.
          </p>

          <h2 className="h-section text-2xl text-ink mt-10">7. Acceptable use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use Eject to migrate sites that violate intellectual property, defame others, or break the law</li>
            <li>Reverse-engineer, scrape, or abuse the scanner / rebuilder</li>
            <li>Resell our service as your own without prior written agreement</li>
            <li>Send abusive or threatening messages to our team</li>
          </ul>
          <p>We may suspend or terminate access for violations.</p>

          <h2 className="h-section text-2xl text-ink mt-10">8. Disclaimers</h2>
          <p>
            The service is provided &ldquo;as is.&rdquo; We do our best to deliver an accurate rebuild and to support you during onboarding, but we make no guarantee that:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Every animation or interactive element will be 1:1 with the original</li>
            <li>Every CMS field will map perfectly across platforms</li>
            <li>Your search rankings will not change (we set up redirects to minimize this)</li>
            <li>Cloudflare, Vercel, or any other third-party will be available 100% of the time</li>
          </ul>
          <p>
            We make no warranty of merchantability, fitness for a particular purpose, or non-infringement, except as required by applicable consumer-protection law.
          </p>

          <h2 className="h-section text-2xl text-ink mt-10">9. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, {siteConfig.legalEntity.name}&apos;s total liability for any claim arising out of or relating to these Terms or the service is capped at the amount you paid us in the 12 months preceding the claim. We are not liable for indirect, incidental, special, consequential, or punitive damages, including lost profits or lost data.
          </p>
          <p>This limitation does not apply to fraud, willful misconduct, or claims that cannot be limited by law.</p>

          <h2 className="h-section text-2xl text-ink mt-10">10. Indemnity</h2>
          <p>
            You agree to defend and hold {siteConfig.legalEntity.name} harmless from claims arising out of (a) the content you ask us to migrate, (b) your use of the migrated site after handoff, or (c) your violation of these Terms.
          </p>

          <h2 className="h-section text-2xl text-ink mt-10">11. Governing law &amp; disputes</h2>
          <p>
            These Terms are governed by the laws of the United States and the state of {siteConfig.legalEntity.name}&apos;s registration. Disputes will be resolved through binding individual arbitration, except that either party may bring small-claims court actions. You waive participation in class actions.
          </p>

          <h2 className="h-section text-2xl text-ink mt-10">12. Changes</h2>
          <p>
            We may update these Terms. The version in effect when you placed your order applies to that order. Material changes are posted here at least 30 days before they take effect; if you do not agree, stop using the service before the effective date.
          </p>

          <h2 className="h-section text-2xl text-ink mt-10">13. Contact</h2>
          <p>
            Questions or notices: email{" "}
            <a className="text-accent hover:text-signal" href={`mailto:${siteConfig.email}`}>
              {siteConfig.email}
            </a>
            .
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
          </ul>
        </div>
      </Section>
    </>
  );
}
