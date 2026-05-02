import { Section, Eyebrow } from "./section";

const quotes = [
  {
    quote: "Webflow: $59/month. Framer: $256/month for the same use case. 4x cost.",
    source: "r/Framer thread, 69 upvotes",
  },
  {
    quote: "$440/month for a one-pager. We're considering switching from Webflow to WordPress.",
    source: "r/webflow, 69 upvotes",
  },
  {
    quote: "32x price increase overnight. They gave me 1 week to decide.",
    source: "Failory founder, viral X tweet",
  },
  {
    quote: "Framer just killed my agency margins. My clients on Scale, I'm eating the cost.",
    source: "r/Framer agency owner",
  },
  {
    quote: "I'm not paying $30 extra just for robots.txt and redirects.",
    source: "r/Framer, 67 upvotes",
  },
  {
    quote: "I'd happily pay extra to keep Framer in my stack — but the lock-in is killing me.",
    source: "r/Framer, vendor lock-in thread",
  },
];

export function SocialProof() {
  return (
    <Section className="bg-ink text-paper">
      <Eyebrow>What people are actually saying</Eyebrow>
      <h2 className="h-section text-3xl md:text-5xl max-w-3xl mb-12 text-paper">
        We didn&apos;t invent this pain.{" "}
        <span className="text-paper/50">We&apos;re just doing something about it.</span>
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {quotes.map((q, i) => (
          <figure
            key={i}
            className="rounded-xl border border-paper/10 bg-paper/[0.04] p-6 hover:bg-paper/[0.07] transition"
          >
            <blockquote className="text-paper text-lg leading-snug mb-4 tracking-tight">
              “{q.quote}”
            </blockquote>
            <figcaption className="text-paper/50 text-xs font-mono uppercase tracking-widest">
              {q.source}
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="text-paper/40 text-xs mt-8 max-w-3xl">
        Quotes are from public Reddit threads, X tweets, and Webflow Forum posts in 2024–2026. No customers shown — we&apos;re too new.
      </p>
    </Section>
  );
}
