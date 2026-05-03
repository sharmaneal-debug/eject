import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { listPosts } from "@/lib/posts";

export default function sitemap(): MetadataRoute.Sitemap {
 const base = siteConfig.url;
 const now = new Date();
 const staticPaths = ["", "/pricing", "/how-it-works", "/calculator", "/migrate", "/blog", "/about"];
 const platformPaths = ["webflow", "framer", "wix", "squarespace"].map((p) => `/migrate/${p}`);
 const posts = listPosts().map((p) => `/blog/${p.slug}`);

 return [...staticPaths,...platformPaths,...posts].map((path) => ({
 url: `${base}${path}`,
 lastModified: now,
 changeFrequency: "weekly",
 priority: path === "" ? 1 : 0.7,
 }));
}
