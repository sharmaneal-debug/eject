import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  author?: string;
  tags?: string[];
  ogImage?: string;
  canonical?: string;
  readingTimeMinutes?: number;
};

export type Post = PostMeta & {
  content: string;
  jsonLd: Record<string, unknown>[];
};

const SCRIPT_LD_RE = /<script\b[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi;

function extractJsonLd(content: string): { content: string; jsonLd: Record<string, unknown>[] } {
  const blocks: Record<string, unknown>[] = [];
  const cleaned = content.replace(SCRIPT_LD_RE, (_match, json: string) => {
    try {
      const parsed = JSON.parse(json.trim());
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        blocks.push(parsed as Record<string, unknown>);
      }
    } catch {
      // Malformed JSON; drop silently — never render as text either way.
    }
    return "";
  });
  return { content: cleaned, jsonLd: blocks };
}

function readingTime(text: string): number {
  // ~225 words/min for technical reading.
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 225));
}

function metaFromFile(filePath: string, slugOverride?: string): { meta: PostMeta; content: string; jsonLd: Record<string, unknown>[] } {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content: rawContent } = matter(raw);
  const slug = slugOverride ?? (data.slug as string) ?? path.basename(filePath, ".md");
  const { content, jsonLd } = extractJsonLd(rawContent);
  return {
    meta: {
      slug,
      title: data.title || "Untitled",
      description: data.description || "",
      date: data.date || "",
      author: data.author,
      tags: data.tags,
      ogImage: data.ogImage,
      canonical: data.canonical,
      readingTimeMinutes: readingTime(content),
    },
    content,
    jsonLd,
  };
}

export function listPosts(): PostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  return files
    .map((file) => metaFromFile(path.join(BLOG_DIR, file)).meta)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): Post | null {
  if (!fs.existsSync(BLOG_DIR)) return null;
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const { meta, content, jsonLd } = metaFromFile(filePath, slug);
  return { ...meta, content, jsonLd };
}

export function postSlugs(): string[] {
  return listPosts().map((p) => p.slug);
}

// Top N "related" posts (excluding the current one). Picks by tag overlap; falls
// back to most-recent. Used at the bottom of each blog post for internal linking.
export function relatedPosts(currentSlug: string, n = 3): PostMeta[] {
  const all = listPosts();
  const me = all.find((p) => p.slug === currentSlug);
  const others = all.filter((p) => p.slug !== currentSlug);
  if (!me) return others.slice(0, n);

  const myTags = new Set(me.tags ?? []);
  const scored = others.map((p) => {
    const overlap = (p.tags ?? []).filter((t) => myTags.has(t)).length;
    return { p, overlap };
  });
  scored.sort((a, b) => {
    if (a.overlap !== b.overlap) return b.overlap - a.overlap;
    return a.p.date < b.p.date ? 1 : -1;
  });
  return scored.slice(0, n).map((s) => s.p);
}
