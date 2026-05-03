import type { Metadata } from "next";
import Link from "next/link";
import { Section, Eyebrow } from "@/components/section";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.legalEntity.name} collects, uses, and protects your information when you use Eject.`,
};

const LAST_UPDATED = "May 3, 2026";

export default function Page() {
  return (
    <>
      <Section className="pb-0">
        <Eyebrow>Privacy</Eyebrow>
        <h1 className="h-display text-4xl md:text-6xl tracking-tightest mb-5 max-w-3xl">
          Privacy Policy
        </h1>
        <p className="text-ink-soft text-lg max-w-2xl">
          Last updated: {LAST_UPDATED}.
        </p>
      </Section>

      <Section>
        <div className="max-w-3xl prose-lite space-y-6 text-ink-soft leading-relaxed">
          <p>
            Eject is a service operated by <strong className="text-ink">{siteConfig.legalEntity.name}</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;). This policy explains what we collect, why, who we share it with, and what choices you have.
          </p>

          <h2 className="h-section text-2xl text-ink mt-10">1. What we collect</h2>
          <p>We collect three categories of information:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-ink">Site scan inputs.</strong> The URL you enter into our scanner, plus what we discover about that site (platform, page count, public metadata). The URL is logged so we can improve the scanner; it is not associated with your identity unless you also submit your email.
            </li>
            <li>
              <strong className="text-ink">Account &amp; checkout details.</strong> Your name, email address, the URL of the site you want migrated, your selected tier (Express or Concierge), and any notes you send us. This is collected through our intake form and through Stripe Checkout when you pay.
            </li>
            <li>
              <strong className="text-ink">Payment information.</strong> We do not collect or store payment cards ourselves. Stripe processes payments and holds card data subject to its own privacy policy. We receive a tokenized record of the transaction (amount, last four digits, billing country).
            </li>
          </ul>

          <h2 className="h-section text-2xl text-ink mt-10">2. How we use it</h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide the service you paid for (rebuild your site, send you a preview link, hand off the final files)</li>
            <li>Send transactional emails (kickoff confirmations, preview-link delivery, support replies)</li>
            <li>Improve the scanner and rebuilder by reviewing aggregate patterns</li>
            <li>Comply with legal obligations (tax reporting, fraud prevention, responding to lawful requests)</li>
          </ul>
          <p>
            We do not sell your information. We do not use your information to train any AI model. We do not advertise to you based on what you submitted.
          </p>

          <h2 className="h-section text-2xl text-ink mt-10">3. Who we share it with</h2>
          <p>We share information with a small number of vendors strictly to operate the service:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-ink">Stripe</strong> &mdash; payment processing</li>
            <li><strong className="text-ink">Resend</strong> &mdash; transactional email delivery</li>
            <li><strong className="text-ink">Vercel</strong> &mdash; site hosting</li>
            <li><strong className="text-ink">Cloudflare</strong> &mdash; DNS, email forwarding, edge caching</li>
            <li><strong className="text-ink">Google (Sheets)</strong> &mdash; lead and customer database</li>
            <li><strong className="text-ink">Anthropic</strong> &mdash; AI model used to rebuild your site (only the captured page contents are sent; not your email or payment details)</li>
          </ul>
          <p>
            Each of these vendors has its own privacy policy and security practices. We use them at the lowest tier necessary and review their data-processing terms.
          </p>

          <h2 className="h-section text-2xl text-ink mt-10">4. Your site&apos;s content</h2>
          <p>
            When we crawl your site to rebuild it, we capture the publicly rendered HTML, CSS, fonts, and images. This is the same content any visitor or search engine sees. We do not crawl behind logins, do not scrape private databases, and do not store more than we need to complete your migration.
          </p>
          <p>
            After we hand off your migrated files, we retain a copy of the snapshot for 30 days for support purposes. After 30 days the snapshot is deleted unless you ask us to keep it longer.
          </p>

          <h2 className="h-section text-2xl text-ink mt-10">5. Cookies</h2>
          <p>
            Our marketing site uses minimal cookies: only what is required for the site to function (e.g., session state during checkout). We do not use advertising cookies, cross-site tracking, or third-party analytics that build a profile of you.
          </p>

          <h2 className="h-section text-2xl text-ink mt-10">6. Your rights</h2>
          <p>
            Depending on where you live, you may have the right to access, correct, delete, or export your personal information, or to object to certain processing. To exercise any of these rights, email{" "}
            <a className="text-accent hover:text-signal" href={`mailto:${siteConfig.email}`}>
              {siteConfig.email}
            </a>
            . We respond within 30 days.
          </p>
          <p>
            If you are in the EU/UK, our legal basis for processing is performance of contract (when you have purchased) and legitimate interest (for scans you submit without paying). You can withdraw consent at any time.
          </p>

          <h2 className="h-section text-2xl text-ink mt-10">7. Data retention</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Scan logs: retained 12 months, then aggregated and personal data deleted</li>
            <li>Customer records (paid orders): retained 7 years for tax and legal reasons</li>
            <li>Support emails: retained 3 years</li>
            <li>Marketing newsletter list (if you opt in): until you unsubscribe</li>
          </ul>

          <h2 className="h-section text-2xl text-ink mt-10">8. Security</h2>
          <p>
            We use HTTPS everywhere, encrypted-at-rest databases (Stripe, Google Sheets), and limit access to customer data to {siteConfig.legalEntity.name} team members who need it to do their job. No service is perfectly secure; if a breach affects you, we will notify you within 72 hours of confirmation.
          </p>

          <h2 className="h-section text-2xl text-ink mt-10">9. Children</h2>
          <p>
            Eject is not directed to children under 13 (or under 16 in the EU). We do not knowingly collect personal information from children. If we learn we have, we will delete it.
          </p>

          <h2 className="h-section text-2xl text-ink mt-10">10. Changes to this policy</h2>
          <p>
            We may update this policy from time to time. We will post the new version here with the updated date at the top. If a change materially reduces your rights, we will email customers at least 30 days before it takes effect.
          </p>

          <h2 className="h-section text-2xl text-ink mt-10">11. Contact</h2>
          <p>
            Questions about this policy? Email{" "}
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
            <li><Link className="hover:text-signal" href="/terms">Terms of Service</Link></li>
          </ul>
        </div>
      </Section>
    </>
  );
}
