import type { Metadata } from "next";
import Link from "next/link";
import { listPosts } from "@/lib/posts";
import { Section, Eyebrow } from "@/components/section";

export const metadata: Metadata = {
 title: "Blog",
 description: "Migration guides, cost teardowns, and honest tradeoffs. No vibes.",
};

function formatDate(d: string) {
 if (!d) return "";
 try {
 return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
 } catch {
 return d;
 }
}

export default function Page() {
 const posts = listPosts();
 return (
 <>
 <Section className="pb-0">
 <Eyebrow>Blog</Eyebrow>
 <h1 className="h-display text-5xl md:text-7xl tracking-tightest max-w-4xl mb-5">
 Migration guides. <span className="text-ink/40">Cost teardowns.</span>
 </h1>
 <p className="text-ink-soft max-w-2xl text-lg">
 Honest writeups of what we&apos;re shipping and what it costs. No vibes.
 </p>
 </Section>

 <Section>
 {posts.length === 0 ? (
 <div className="rounded-2xl border border-line bg-paper-warm p-10 text-center text-ink-muted">
 No posts yet. Soon.
 </div>
 ) : (
 <ul className="divide-y divide-line border-y border-line">
 {posts.map((p) => (
 <li key={p.slug} className="py-8">
 <Link href={`/blog/${p.slug}`} className="group grid md:grid-cols-[160px_1fr] gap-6 items-baseline">
 <p className="text-xs font-mono uppercase tracking-widest text-ink-muted">{formatDate(p.date)}</p>
 <div>
 <h2 className="h-section text-2xl md:text-3xl tracking-tight mb-2 group-hover:text-signal transition">
 {p.title}
 </h2>
 <p className="text-ink-soft max-w-2xl leading-relaxed">{p.description}</p>
 {p.tags?.length ? (
 <p className="mt-3 text-xs font-mono text-ink-muted uppercase tracking-widest">
 {p.tags.slice(0, 3).join(" · ")}
 </p>
 ) : null}
 </div>
 </Link>
 </li>
 ))}
 </ul>
 )}
 </Section>
 </>
 );
}
