import Link from "next/link";
import { Section } from "@/components/section";

export default function NotFound() {
  return (
    <Section>
      <div className="max-w-xl">
        <p className="font-mono text-xs uppercase tracking-widest text-signal mb-4">404 — page not found</p>
        <h1 className="h-display text-4xl md:text-6xl tracking-tightest mb-4">
          That page <span className="text-ink/40">migrated.</span>
        </h1>
        <p className="text-ink-soft text-lg mb-8">Try one of these instead.</p>
        <ul className="space-y-2 text-accent">
          <li><Link href="/" className="hover:text-signal">Home</Link></li>
          <li><Link href="/calculator" className="hover:text-signal">Cost calculator</Link></li>
          <li><Link href="/pricing" className="hover:text-signal">Pricing</Link></li>
          <li><Link href="/migrate" className="hover:text-signal">Start a migration</Link></li>
        </ul>
      </div>
    </Section>
  );
}
