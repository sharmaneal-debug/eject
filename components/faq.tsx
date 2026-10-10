import { Section, Eyebrow } from "./section";
import { siteConfig, doneForYouCapLabel } from "@/lib/site";

const automated = siteConfig.pricing.express;
const byHand = siteConfig.pricing.concierge;

export const faqItems = [
  {
    q: "How do I edit the site after the move?",
    a: `${siteConfig.editing.lead} ${siteConfig.editing.included} You describe the change in ChatGPT, Claude, or Cursor. You review what the assistant edits. We don't run a hosted editor or bill a monthly seat for one.`,
  },
  {
    q: "Will my site look the same?",
    a: `${automated.name} ($${automated.price}) runs an automated migration of a simple site, and you review it before DNS. ${byHand.name} ($${byHand.price}) is a person matching the pages that are in scope. We don't promise a pixel-perfect clone.`,
  },
  {
    q: "What sites do you take?",
    a: `Marketing sites, portfolios, and landing pages on Framer, Webflow, Wix, or Squarespace. ${byHand.name} is capped at ${doneForYouCapLabel()}. Beyond that we refer out or quote an add-on. We don't take stores, member areas, bookings, multi-language sites, web apps, or a heavy CMS.`,
  },
  {
    q: "What is automated, and what does a person review?",
    a: `${automated.name} is an automated migration. You still review the pages before the domain moves. ${byHand.name} is done by hand inside the cap. Neither offer shows a rebuilt preview before you pay, and neither extracts a CMS.`,
  },
  {
    q: "Do you extract my CMS?",
    a: "No. If the site is a blog or a collection database, that work is a content migration and we refer it out. A few static pages of copy are in scope. A CMS is not.",
  },
  {
    q: "What about my domain?",
    a: `The domain stays yours. Both offers include a DNS checklist. We don't flip DNS until you say the new pages are ready.`,
  },
  {
    q: "Will my SEO or PageSpeed score go up?",
    a: "We don't know, and we won't quote a point gain. The move includes a checklist for redirects and titles. Rankings and PageSpeed can move either way. There is no '30–50 points' claim because we have not measured that.",
  },
  {
    q: "Where does the new site live?",
    a: "On a host you choose. Cloudflare Pages, Netlify, Vercel, and GitHub Pages all have free tiers that cover a simple static site. Eject does not host it. Your domain renewal is still paid to your registrar.",
  },
  {
    q: "What about my contact form?",
    a: `${byHand.name} includes one form inside the cap. ${automated.name} includes a simple form that sends to an inbox you control when the source site has one. We don't provision a form vendor for you, and we don't promise a submission quota.`,
  },
  {
    q: "Do you migrate Shopify, WordPress, or stores?",
    a: "No. Shopify and other carts are commerce projects. WordPress is usually a CMS. Both are outside this service. Email us and we'll say so plainly rather than take the job.",
  },
  {
    q: "Is there a preview before I pay?",
    a: `No. The free scan only reports the platform and a rough page count. You pay for ${automated.name} or ${byHand.name}, then the work starts. There is no rebuilt preview before payment.`,
  },
  {
    q: "What if I don't like it?",
    a: "Email us within 14 days of delivery. If the pages aren't what we described for a simple site, we refund the payment. Details are on the refunds page.",
  },
];

export function Faq() {
  return (
    <Section>
      <Eyebrow>FAQ</Eyebrow>
      <h2 className="h-section text-3xl md:text-5xl max-w-3xl mb-12">
        Edit by chatting. Then the practical questions.
      </h2>
      <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 max-w-5xl">
        {faqItems.map((it) => (
          <div key={it.q}>
            <p className="font-semibold text-ink mb-2 text-lg tracking-tight">{it.q}</p>
            <p className="text-ink-soft leading-relaxed">{it.a}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
