import { Section } from "./section";

export function ScopeLimits(_props?: { compact?: boolean }) {
  return (
    <Section>
      <h2 className="text-2xl">Simple sites only.</h2>
      <p className="mt-1 text-sm text-ink-soft">Stores and large CMS sites are referred out.</p>
    </Section>
  );
}
