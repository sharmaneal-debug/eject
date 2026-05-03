import { Section, Eyebrow } from "./section";

const features = [
  {
    badge: "01",
    title: "Same site. Pixel for pixel.",
    body: "We don't redesign anything. We rebuild your site to look exactly like it does today — same fonts, same colors, same layout. Your customers won't notice a thing.",
  },
  {
    badge: "02",
    title: "We move your blog and pages",
    body: "Every blog post, every page, every form. All your content comes with you. Nothing gets lost. We hand you the new site with everything in place.",
  },
  {
    badge: "03",
    title: "Free hosting that just works",
    body: "Your new site lives on Cloudflare's free tier. Same speed (often faster). Free SSL. Free CDN. Zero monthly bill — forever.",
  },
  {
    badge: "04",
    title: "Your old domain still works",
    body: "We move your domain over. Your visitors don't know anything changed. Your Google rankings stay put. Old links keep working.",
  },
  {
    badge: "05",
    title: "Edit it with any AI you already use",
    body: "We give you copy-paste instructions for ChatGPT, Claude, or Cursor (free tiers work fine). Type 'change my hero to say X.' That's it. No coding.",
  },
  {
    badge: "06",
    title: "You own everything",
    body: "Your website files are yours. Your domain is yours. Your hosting account is yours. There's no Eject login. We hand you the keys and walk away.",
  },
];

export function FeatureGrid() {
  return (
    <Section className="bg-white border-y border-line">
      <Eyebrow>What you get</Eyebrow>
      <h2 className="h-section text-3xl md:text-5xl max-w-3xl mb-12">
        Everything moves over.{" "}
        <span className="text-ink/40">Nothing breaks.</span>
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
