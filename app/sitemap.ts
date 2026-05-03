import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { listPosts } from "@/lib/posts";
import { listKitPages } from "@/lib/kit";

export default function sitemap(): MetadataRoute.Sitemap {
 const base = siteConfig.url;
 const now = new Date();
 const staticPaths = ["", "/pricing", "/how-it-works", "/calculator", "/blog", "/kit", "/about", "/privacy", "/terms"];
 const posts = listPosts().map((p) => `/blog/${p.slug}`);
 const kit = listKitPages().map((p) => `/kit/${p.slug}`);

 return [...staticPaths, ...posts, ...kit].map((path) => ({
 url: `${base}${path}`,
 lastModified: now,
 changeFrequency: "weekly",
 priority: path === "" ? 1 : path.startsWith("/blog") ? 0.8 : 0.7,
 }));
}
