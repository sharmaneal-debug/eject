import { Section, Eyebrow } from "./section";
import Link from "next/link";

export function SocialProof() {
  return (
    <Section>
      <Eyebrow>Proof</Eyebrow>
      <h2 className="h-section text-3xl md:text-5xl max-w-3xl mb-4">
        No invented testimonials.
      </h2>
      <p className="text-ink-soft max-w-2xl text-lg leading-relaxed mb-8">
        This site doesn&apos;t quote customers we can&apos;t name, and it doesn&apos;t claim a PageSpeed point gain. The numbers we will stand behind are the vendor list prices in the calculator, each with a source URL and a checked date.
      </p>
      <Link href="/calculator" className="text-accent font-medium hover:text-signal">
        Open the calculator →
      </Link>
    </Section>
  );
}
