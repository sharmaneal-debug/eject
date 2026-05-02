import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { getPost, postSlugs } from "@/lib/posts";
import { Section, Eyebrow } from "@/components/section";
import { CostCalculator } from "@/components/cost-calculator";

export async function generateStaticParams() {
  return postSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: p.canonical },
    openGraph: { title: p.title, description: p.description, type: "article" },
  };
}

function formatDate(d: string) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch {
    return d;
  }
}

const markdownComponents = {
  h1: () => null, // page already shows the title in hero
  h2: ({ children, ...rest }: any) => (
    <h2 {...rest} className="h-section text-3xl md:text-4xl mt-14 mb-5 tracking-tight">
      {children}
    </h2>
  ),
  h3: ({ children, ...rest }: any) => (
    <h3 {...rest} className="font-semibold text-xl md:text-2xl tracking-tight mt-8 mb-3">
      {children}
    </h3>
  ),
  p: ({ children }: any) => (
    <p className="text-ink-soft leading-relaxed mb-5">{children}</p>
  ),
  a: ({ href, children }: any) => (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      className="text-accent underline decoration-from-font underline-offset-[3px] hover:text-signal"
    >
      {children}
    </a>
  ),
  ul: ({ children }: any) => <ul className="list-disc pl-6 mb-5 space-y-1.5 text-ink-soft">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal pl-6 mb-5 space-y-1.5 text-ink-soft">{children}</ol>,
  li: ({ children }: any) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }: any) => <strong className="font-semibold text-ink">{children}</strong>,
  em: ({ children }: any) => <em className="italic">{children}</em>,
  code: ({ children }: any) => (
    <code className="font-mono text-sm bg-paper-warm border border-line rounded px-1.5 py-0.5">
      {children}
    </code>
  ),
  pre: ({ children }: any) => (
    <pre className="bg-ink text-paper rounded-xl p-5 overflow-x-auto text-sm leading-relaxed mb-6">
      {children}
    </pre>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-2 border-signal pl-5 italic text-ink-soft my-6">{children}</blockquote>
  ),
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-6">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }: any) => (
    <th className="border-b-2 border-line text-left p-3 font-semibold text-ink">{children}</th>
  ),
  td: ({ children }: any) => <td className="border-b border-line p-3 text-ink-soft">{children}</td>,
  hr: () => <hr className="border-line my-12" />,
};

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  // Replace the calculator placeholder with the live component.
  const segments = post.content.split("<CostCalculatorEmbed />");

  return (
    <>
      <Section className="pb-0">
        <Eyebrow>{post.tags?.[0] ?? "Article"}</Eyebrow>
        <h1 className="h-display text-4xl md:text-6xl tracking-tightest mb-5 max-w-4xl">{post.title}</h1>
        <p className="text-ink-soft max-w-2xl text-lg leading-relaxed">{post.description}</p>
        <div className="mt-7 flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-ink-muted">
          <span>{formatDate(post.date)}</span>
          {post.author && <><span>·</span><span>{post.author}</span></>}
        </div>
      </Section>

      <Section className="max-w-3xl">
        <article className="max-w-3xl">
          {segments.map((seg, i) => (
            <div key={i}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug]}
                components={markdownComponents}
              >
                {seg}
              </ReactMarkdown>
              {i < segments.length - 1 && (
                <div className="my-12 not-prose">
                  <CostCalculator />
                </div>
              )}
            </div>
          ))}
        </article>
      </Section>

      <Section className="bg-paper-warm">
        <div className="rounded-2xl bg-ink text-paper p-10 md:p-14">
          <p className="text-xs font-mono uppercase tracking-widest text-paper/50 mb-3">Ready to migrate?</p>
          <h2 className="h-section text-3xl md:text-4xl mb-4 max-w-2xl">
            Free 5-min Loom audit of your site.
          </h2>
          <p className="text-paper/70 max-w-xl mb-7">
            Real Lighthouse score. Real annual cost. Real Next.js preview. We send it within 24 hours.
          </p>
          <Link
            href="/migrate"
            className="inline-flex items-center justify-center rounded-lg bg-signal text-paper px-6 py-3 text-sm font-medium hover:bg-paper hover:text-ink transition"
          >
            Start a free audit →
          </Link>
        </div>
      </Section>
    </>
  );
}
