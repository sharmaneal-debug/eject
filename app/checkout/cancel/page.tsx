import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/section";

export const metadata: Metadata = {
 title: "Checkout cancelled",
};

export default function Page() {
 return (
 <Section>
 <div className="max-w-xl">
 <h1 className="h-display text-4xl md:text-5xl tracking-tightest mb-4">
 No worries, <span className="text-ink/40">we didn&apos;t charge you.</span>
 </h1>
 <p className="text-ink-soft text-lg leading-relaxed mb-8">
 You backed out before paying. That&apos;s fine. If you have questions, hit us up at{" "}
 <a href="mailto:hi@eject.co" className="text-accent hover:text-signal">hi@eject.co</a>.
 </p>
 <div className="flex gap-3">
 <Link
 href="/"
 className="rounded-lg bg-ink text-paper px-5 py-3 text-sm font-medium hover:bg-signal transition"
 >
 Back to home
 </Link>
 <Link
 href="/pricing"
 className="rounded-lg border border-line bg-white px-5 py-3 text-sm font-medium hover:border-ink transition"
 >
 See pricing again
 </Link>
 </div>
 </div>
 </Section>
 );
}
