import { Section, Eyebrow } from "./section";

const features = [
  {
    badge: "01",
    title: "We crawl your live site",
    body: "Paste your URL. Our pipeline (Playwright + design-token extraction + AI rebuild) reconstructs every page as a Next.js component. Real markup, real Tailwind, no iframe hacks.",
  },
  {
    badge: "02",
    title: "We migrate the CMS too",
    body: "Webflow CMS via API. Framer collections via DOM walk. Wix via manual extraction. Output: markdown in your repo, or Sanity/Payload if you prefer a CMS UI.",
  },
  {
    badge: "03",
    title: "We hand you the GitHub repo",
    body: "Under your account, not ours. There's no us in the middle. Hire any Next.js dev, fork it, fire us — the site keeps running because we never gated anything.",
  },
  {
    badge: "04",
    title: "We deploy to Cloudflare Pages",
    body: "Free tier covers 100k requests/day, unlimited bandwidth, free SSL, global CDN. Your only ongoing cost is the domain — that's the $5/year story.",
  },
  {
    badge: "05",
    title: "Forms, redirects, sitemaps — all wired",
    body: "Webflow forms get replaced by Resend. Old URLs get 301s so your SEO survives. Sitemap auto-generates. Robots.txt is a file you can actually edit.",
  },
  {
    badge: "06",
    title: "Edit it forever by chat (optional)",
    body: "Add the Editor retainer ($79/mo) and you keep updating your site in plain English. \"Change the hero headline to X.\" \"Add a testimonial here.\" Each edit becomes a real git commit.",
  },
];

export function FeatureGrid() {
  return (
    <Section className="bg-white border-y border-line">
      <Eyebrow>What ships</Eyebrow>
      <h2 className="h-section text-3xl md:text-5xl max-w-3xl mb-12">
        A migration. Not a license. <span className="text-ink/40">You own everything we ship.</span>
      </h2>
      <div className="grid md:grid-cols-2 gap-px bg-line rounded-2xl overflow-hidden border border-line">
        {features.map((f) => (
          <div key={f.badge} className="bg-white p-7 md:p-9">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-xs text-signal tracking-widest">{f.badge}</span>
              <span className="h-px flex-1 bg-line" />
            </div>
            <h3 className="font-semibold text-xl tracking-tight mb-2">{f.title}</h3>
            <p className="text-ink-soft leading-relaxed">{f.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
