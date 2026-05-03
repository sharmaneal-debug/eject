import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { getKitPage, kitSlugs, listKitPages } from "@/lib/kit";
import { Section, Eyebrow } from "@/components/section";

export async function generateStaticParams() {
  return kitSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getKitPage(slug);
  if (!p) return {};
  return {
    title: `${p.title} · Express Kit`,
    description: p.description,
  };
}

const markdownComponents = {
  h1: () => null,
  h2: ({ children, ...rest }: any) => (
    <h2 {...rest} className="h-section text-2xl md:text-3xl mt-14 mb-4 tracking-tight scroll-mt-24">
      {children}
    </h2>
  ),
  h3: ({ children, ...rest }: any) => (
    <h3 {...rest} className="font-semibold text-lg md:text-xl tracking-tight mt-8 mb-3 scroll-mt-24">
      {children}
    </h3>
  ),
  p: ({ children }: any) => (
    <p className="text-ink-soft leading-[1.75] mb-5 text-[1.0625rem]">{children}</p>
  ),
  a: ({ href, children }: any) => (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      className="text-accent underline underline-offset-[3px] decoration-1 hover:text-signal hover:decoration-2"
    >
      {children}
    </a>
  ),
  ul: ({ children }: any) => <ul className="list-disc pl-6 mb-5 space-y-2 text-ink-soft text-[1.0625rem] leading-relaxed">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal pl-6 mb-5 space-y-2 text-ink-soft text-[1.0625rem] leading-relaxed">{children}</ol>,
  li: ({ children }: any) => <li className="leading-relaxed pl-1">{children}</li>,
  strong: ({ children }: any) => <strong className="font-semibold text-ink">{children}</strong>,
  em: ({ children }: any) => <em className="italic">{children}</em>,
  code: ({ children, className }: any) => {
    if (className) return <code className={className}>{children}</code>;
    return (
      <code className="font-mono text-[0.875em] bg-paper-warm border border-line rounded px-1.5 py-0.5">
        {children}
      </code>
    );
  },
  pre: ({ children }: any) => (
    <pre className="bg-ink text-paper rounded-xl p-5 overflow-x-auto text-sm leading-relaxed mb-6">
      {children}
    </pre>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-signal pl-5 italic text-ink-soft my-7 py-1 bg-paper-warm/40 rounded-r-lg pr-5">{children}</blockquote>
  ),
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-7 rounded-xl border border-line">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => <thead className="bg-paper-warm">{children}</thead>,
  th: ({ children }: any) => (
    <th className="border-b border-line text-left p-3 font-semibold text-ink whitespace-nowrap">{children}</th>
  ),
  td: ({ children }: any) => <td className="border-b border-line p-3 text-ink-soft align-top">{children}</td>,
  tr: ({ children }: any) => <tr className="even:bg-paper-warm/40">{children}</tr>,
  hr: () => <hr className="border-line my-10" />,
};

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getKitPage(slug);
  if (!page) notFound();

  const allPages = listKitPages();
  const currentIndex = allPages.findIndex((p) => p.slug === slug);
  const prev = currentIndex > 0 ? allPages[currentIndex - 1] : null;
  const next = currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null;

  return (
    <>
      <Section className="pb-0">
        <Link href="/kit" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-ink-muted hover:text-signal mb-7 transition">
          ← All kit pages
        </Link>
        <Eyebrow>{page.icon} · Express Kit</Eyebrow>
        <h1 className="h-display text-4xl md:text-6xl tracking-tightest mb-5 max-w-4xl">{page.title}</h1>
        <p className="text-ink-soft max-w-2xl text-lg md:text-xl leading-relaxed">{page.description}</p>
        {page.estimatedMinutes !== undefined && page.estimatedMinutes > 0 && (
          <div className="mt-7 flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-ink-muted">
            <span>About {page.estimatedMinutes} minutes</span>
          </div>
        )}
      </Section>

      <Section>
        <article className="max-w-[680px]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSlug]}
            components={markdownComponents}
          >
            {page.content}
          </ReactMarkdown>
        </article>
      </Section>

      <Section className="border-t border-line">
        <div className="grid md:grid-cols-2 gap-4 max-w-4xl">
          {prev ? (
            <Link
              href={`/kit/${prev.slug}`}
              className="rounded-2xl border border-line bg-paper-warm p-6 hover:border-ink transition group"
            >
              <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-2">← Previous</p>
              <p className="font-semibold text-lg group-hover:text-signal transition">{prev.title}</p>
            </Link>
          ) : <span />}
          {next && (
            <Link
              href={`/kit/${next.slug}`}
              className="rounded-2xl border border-line bg-paper-warm p-6 hover:border-ink transition group text-right"
            >
              <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-2">Next →</p>
              <p className="font-semibold text-lg group-hover:text-signal transition">{next.title}</p>
            </Link>
          )}
        </div>
      </Section>
    </>
  );
}
