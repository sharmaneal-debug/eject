import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { getPost, postSlugs, relatedPosts } from "@/lib/posts";
import { Section, Eyebrow } from "@/components/section";
import { CostCalculator } from "@/components/cost-calculator";
import { JsonLd } from "@/components/json-ld";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";
import { siteConfig } from "@/lib/site";

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
  const ogImageUrl = `${siteConfig.url}/og?title=${encodeURIComponent(p.title)}&subtitle=${encodeURIComponent(p.description)}&eyebrow=${encodeURIComponent(p.tags?.[0] ?? "Article")}`;
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: p.canonical },
    openGraph: {
      title: p.title,
      description: p.description,
      type: "article",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: p.title }],
    },
    twitter: { card: "summary_large_image", title: p.title, description: p.description, images: [ogImageUrl] },
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
  h1: () => null, // hero already renders the title
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
    // inline code only — block code is wrapped by <pre>
    if (className) return <code className={className}>{children}</code>;
    return (
      <code className="font-mono text-[0.875em] bg-paper-warm border border-line rounded px-1.5 py-0.5">
        {children}
      </code>
    );
  },
  pre: ({ children }: any) => (
    <pre className="bg-ink text-paper rounded-xl p-5 overflow-x-auto text-sm leading-relaxed mb-6 not-prose">
      {children}
    </pre>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-signal pl-5 italic text-ink-soft my-7 py-1">{children}</blockquote>
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
  const post = getPost(slug);
  if (!post) notFound();

  // Replace the calculator placeholder with the live component.
  const segments = post.content.split("<CostCalculatorEmbed />");
  const related = relatedPosts(post.slug, 3);

  return (
    <>
      <JsonLd
        data={[
          articleSchema({
            title: post.title,
            description: post.description,
            slug: post.slug,
            date: post.date,
            author: post.author,
            ogImage: post.ogImage,
          }),
          breadcrumbSchema([
            { name: "Home", url: siteConfig.url },
            { name: "Blog", url: `${siteConfig.url}/blog` },
            { name: post.title, url: `${siteConfig.url}/blog/${post.slug}` },
          ]),
          ...post.jsonLd,
        ]}
      />

      {/* Hero */}
      <Section className="pb-0">
        <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-ink-muted hover:text-signal mb-7 transition">
          ← All articles
        </Link>
        <Eyebrow>{post.tags?.[0] ?? "Article"}</Eyebrow>
        <h1 className="h-display text-4xl md:text-6xl tracking-tightest mb-5 max-w-4xl">{post.title}</h1>
        <p className="text-ink-soft max-w-2xl text-lg md:text-xl leading-relaxed">{post.description}</p>
        <div className="mt-7 flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-ink-muted">
          <span>{formatDate(post.date)}</span>
          {post.readingTimeMinutes && (
            <>
              <span>·</span>
              <span>{post.readingTimeMinutes} min read</span>
            </>
          )}
          {post.author && (
            <>
              <span>·</span>
              <span>{post.author}</span>
            </>
          )}
        </div>
      </Section>

      {/* Article body — narrow column for readability */}
      <Section>
        <article className="max-w-[680px]">
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
                <div className="my-12">
                  <CostCalculator />
                </div>
              )}
            </div>
          ))}
        </article>
      </Section>

      {/* Related posts */}
      {related.length > 0 && (
        <Section className="border-t border-line pt-16 pb-16">
          <Eyebrow>Keep reading</Eyebrow>
          <h2 className="h-section text-2xl md:text-3xl mb-10">More from the blog</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/blog/${r.slug}`}
                className="rounded-2xl border border-line bg-white p-6 hover:border-ink transition group"
              >
                <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-3">
                  {r.tags?.[0] ?? "Article"}
                </p>
                <h3 className="font-semibold text-lg tracking-tight mb-2 group-hover:text-signal transition">
                  {r.title}
                </h3>
                <p className="text-ink-soft text-sm leading-relaxed line-clamp-3">{r.description}</p>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Final CTA */}
      <Section className="bg-paper-warm">
        <div className="rounded-2xl bg-ink text-paper p-10 md:p-14">
          <p className="text-xs font-mono uppercase tracking-widest text-paper/50 mb-3">Ready to migrate?</p>
          <h2 className="h-section text-3xl md:text-4xl mb-4 max-w-2xl">
            Paste your URL. See what we&apos;d build for you.
          </h2>
          <p className="text-paper/70 max-w-xl mb-7">
            Free, instant scan. Real platform detection. Real annual cost. No email needed.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-signal text-paper px-6 py-3 text-sm font-medium hover:bg-paper hover:text-ink transition"
          >
            Scan my site →
          </Link>
        </div>
      </Section>
    </>
  );
}
