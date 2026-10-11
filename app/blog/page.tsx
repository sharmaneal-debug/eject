import type { Metadata } from "next";
import Link from "next/link";
import { listPosts } from "@/lib/posts";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description: "Notes on leaving a simple site.",
  path: "/blog",
});

export default function Page() {
  const posts = listPosts();
  return (
    <section className="mx-auto max-w-content min-w-0 px-4 py-10 sm:px-6 md:py-16">
      <h1 className="h-display text-4xl lg:text-6xl">Blog</h1>
      <p className="mt-4 text-lg text-ink-soft">Guides for simple sites.</p>
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`} className="flex min-h-11 flex-col justify-center py-4">
              <span className="text-base text-ink-muted">{post.date}</span>
              <span className="mt-1 text-xl font-semibold">{post.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
