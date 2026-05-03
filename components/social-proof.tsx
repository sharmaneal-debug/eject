import { Section, Eyebrow } from "./section";

const quotes = [
  {
    quote: "I'm paying $440 a month for a one-page website. This is insane.",
    source: "Webflow customer, on Reddit",
  },
  {
    quote: "32x price increase overnight. They gave me one week to decide.",
    source: "Failory founder, on X",
  },
  {
    quote: "Framer just killed my margins. My clients are on the high tier and I'm eating the cost.",
    source: "Agency owner, on Reddit",
  },
  {
    quote: "I'm not paying $30 extra a month just for redirects.",
    source: "Framer customer, 67 upvotes on Reddit",
  },
  {
    quote: "Webflow's amazing for design — but the pricing model just doesn't work for small businesses anymore.",
    source: "Webflow Forum",
  },
  {
    quote: "I'd happily pay extra to keep my site safe. The lock-in is the problem.",
    source: "Framer user, on vendor lock-in",
  },
];

export function SocialProof() {
  return (
    <Section className="bg-paper-warm">
      <Eyebrow>Why this matters</Eyebrow>
      <h2 className="h-section text-3xl md:text-5xl max-w-3xl mb-12">
        Real people, real bills.{" "}
        <span className="text-ink/40">All quotes from public threads.</span>
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {quotes.map((q, i) => (
          <figure
            key={i}
            className="rounded-xl border border-line bg-white p-6 hover:shadow-[0_24px_60px_-24px_rgba(11,11,15,0.10)] transition"
          >
            <blockquote className="text-ink text-lg leading-snug mb-4 tracking-tight">
              &ldquo;{q.quote}&rdquo;
            </blockquote>
            <figcaption className="text-ink-muted text-xs font-mono uppercase tracking-widest">
              {q.source}
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
