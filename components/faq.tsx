import { Section, Eyebrow } from "./section";

const items = [
  {
    q: "Is this legal? Can I really export my Webflow / Framer site?",
    a: "Yes. You own the design rights to a site you commissioned or built. Webflow has an official code-export feature on Workspace plans. Framer has no official export but rebuilding from your live URL is something you're entitled to do — it's your design, your content, your domain. We get explicit written consent from every customer before crawling.",
  },
  {
    q: "Won't my SEO tank?",
    a: "Opposite, usually. We map every existing URL to its new equivalent with a 301 redirect, keep canonical tags identical, and migrate meta + OG tags 1:1. Lighthouse scores typically improve 30–50 points on Next.js + Cloudflare Pages because the static output is dramatically faster than Webflow's runtime.",
  },
  {
    q: "What happens to my CMS items?",
    a: "Webflow CMS exports cleanly via their API → MDX or Sanity. Framer collections are walked via DOM extraction. Wix has no API so we manually rebuild content. By default we ship MDX (markdown in your repo) — that's the simplest. If you want a CMS UI for non-technical authors, we set up Sanity (free tier) or Payload (free, self-hosted).",
  },
  {
    q: "I'm not technical. Will I be able to edit my site after?",
    a: "Yes. The optional Editor retainer ($79/mo) gives you a chatbox where you say things like \"change the hero headline to X\" or \"add a testimonial here,\" and the changes get committed to your repo and deployed automatically. You never see code unless you want to. If you cancel the editor, your site keeps running — only the chat layer goes away.",
  },
  {
    q: "What does Cloudflare Pages actually cost?",
    a: "$0/mo. The free tier covers 100k requests/day, unlimited bandwidth, free SSL, free CDN. The only ongoing cost on Eject is your domain registration, typically $10–$15/year. That's the \"$5 a year\" story (we round generously).",
  },
  {
    q: "How is this different from v0 or Lovable?",
    a: "v0, Lovable, Bolt, and Cursor are general-purpose AI coding tools — they're built to generate new sites, not migrate existing ones. We're a migration service first: we crawl your live URL, preserve your design, migrate your CMS, set up redirects, and hand you a deployed site with a working domain. We use AI tooling internally to ship faster, but the offering is the migration, not the codegen.",
  },
  {
    q: "What if I want to leave Eject later?",
    a: "Then leave. The GitHub repo is under your account. Cloudflare Pages is on your Cloudflare account. Your domain is yours. There's no us in the loop after handoff unless you've subscribed to the Editor retainer (which you can cancel monthly). We sell migrations, not rentals.",
  },
  {
    q: "How long does a Done-for-You migration take?",
    a: "7 days for Framer or Webflow (we have CMS API access). 10 days for Wix or Squarespace (manual content extraction). The clock starts when you've signed the intake and we've crawled your site — usually within 24 hours of paying.",
  },
];

export function Faq() {
  return (
    <Section>
      <Eyebrow>FAQ</Eyebrow>
      <h2 className="h-section text-3xl md:text-5xl max-w-3xl mb-12">
        The questions actually being asked.
      </h2>
      <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 max-w-5xl">
        {items.map((it) => (
          <div key={it.q}>
            <p className="font-semibold text-ink mb-2 text-lg tracking-tight">{it.q}</p>
            <p className="text-ink-soft leading-relaxed">{it.a}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
