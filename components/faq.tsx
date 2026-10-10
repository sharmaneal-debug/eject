import { Section } from "./section";

export const faqItems = [
  { q: "What is $99?", a: "An automated move of a simple site. You own the files." },
  { q: "Will it look the same?", a: "We do not promise a pixel match." },
  { q: "Need it done for you?", a: "We handle the migration for you, step by step. Custom pricing." },
  { q: "Domain?", a: "The domain stays yours. DNS changes only when you ask." },
  { q: "Refund?", a: "Email us within 14 days of delivery." },
];

export function Faq() {
  return (
    <Section>
      <h2 className="text-sm font-mono uppercase tracking-widest text-ink-muted mb-3">FAQ</h2>
      <div className="max-w-xl">
        {faqItems.map((item) => (
          <details key={item.q} className="border-t border-line py-3">
            <summary className="cursor-pointer font-medium">{item.q}</summary>
            <p className="mt-1 text-sm text-ink-soft">{item.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
