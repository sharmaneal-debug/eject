import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { getPost, postSlugs, relatedPosts } from "@/lib/posts";
import { Section, Eyebrow } from "@/components/section";
import { CostCalculator } from "@/components/cost-calculator";
import { CustomPricingLink } from "@/components/custom-pricing-link";
import { JsonLd } from "@/components/json-ld";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
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
  return pageMetadata({
    title: p.title,
    description: p.description,
    path: `/blog/${slug}`,
    canonical: p.canonical || `/blog/${slug}`,
    type: "article",
  });
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
    <pre className="mb-6 max-w-full overflow-x-clip whitespace-pre-wrap break-words rounded-xl bg-ink p-4 text-base leading-relaxed text-paper not-prose">
      {children}
    </pre>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-signal pl-5 italic text-ink-soft my-7 py-1">{children}</blockquote>
  ),
  table: ({ children }: any) => (
    <div className="my-7 max-w-full overflow-x-clip rounded-xl border border-line">
      <table className="w-full table-fixed border-collapse text-base">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => <thead className="bg-paper-warm">{children}</thead>,
  th: ({ children }: any) => (
    <th className="border-b border-line p-3 text-left align-top font-semibold text-ink">{children}</th>
  ),
  td: ({ children }: any) => <td className="border-b border-line p-3 align-top text-base text-ink-soft">{children}</td>,
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
        <h1 className="h-display mb-5 max-w-4xl break-words text-3xl sm:text-4xl lg:text-5xl">{post.title}</h1>
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
          <aside className="mb-10 rounded-xl border border-line bg-paper-warm p-4 text-base leading-relaxed text-ink-soft">
            <p>Automated ${siteConfig.pricing.express.price}.</p>
            <p className="mt-2">We handle the migration for you, step by step.</p>
            <CustomPricingLink />
          </aside>
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
          <div className="grid gap-4 lg:grid-cols-3">
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
                <p className="text-base leading-relaxed text-ink-soft">{r.description}</p>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Final CTA */}
      <Section className="bg-paper-warm">
        <div className="rounded-2xl bg-ink p-5 text-paper sm:p-8">
          <p className="text-xs font-mono uppercase tracking-widest text-paper/50 mb-3">Ready to migrate?</p>
          <h2 className="h-section text-3xl md:text-4xl mb-4 max-w-2xl">
            Paste your URL. See what we&apos;d build for you.
          </h2>
          <p className="text-paper/70 max-w-xl mb-7">
            Free, instant scan. Real platform detection. Real annual cost. No email needed.
          </p>
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-lg bg-signal px-6 text-base font-medium text-paper hover:bg-paper hover:text-ink"
          >
            Scan my site →
          </Link>
        </div>
      </Section>
    </>
  );
}
