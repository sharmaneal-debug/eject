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
};

export type Post = PostMeta & { content: string };

export function listPosts(): PostMeta[] {
 if (!fs.existsSync(BLOG_DIR)) return [];
 const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
 return files
.map((file) => {
 const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
 const { data } = matter(raw);
 return {
 slug: (data.slug as string) || file.replace(/\.md$/, ""),
 title: data.title || "Untitled",
 description: data.description || "",
 date: data.date || "",
 author: data.author,
 tags: data.tags,
 ogImage: data.ogImage,
 canonical: data.canonical,
 } as PostMeta;
 })
.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): Post | null {
 if (!fs.existsSync(BLOG_DIR)) return null;
 const filePath = path.join(BLOG_DIR, `${slug}.md`);
 if (!fs.existsSync(filePath)) return null;
 const raw = fs.readFileSync(filePath, "utf8");
 const { data, content } = matter(raw);
 return {
 slug: (data.slug as string) || slug,
 title: data.title || slug,
 description: data.description || "",
 date: data.date || "",
 author: data.author,
 tags: data.tags,
 ogImage: data.ogImage,
 canonical: data.canonical,
 content,
 };
}

export function postSlugs(): string[] {
 return listPosts().map((p) => p.slug);
}
