import type { MetadataRoute } from "next";
import { listPosts } from "./posts";
import { siteConfig } from "./site";

/** Last content change for public pages that are not blog posts. */
export const PUBLIC_CONTENT_UPDATED = "2026-10-15";

/** Indexable pages. Noindex routes (kit, intake, ops, checkout receipts, unsubscribe) stay off the sitemap. */
const STATIC_PATHS = [
  "",
  "/pricing",
  "/book",
  "/contact",
  "/about",
  "/how-it-works",
  "/calculator",
  "/renewal-watch",
  "/blog",
  "/migrate",
  "/migrate/webflow",
  "/migrate/framer",
  "/migrate/wix",
  "/migrate/squarespace",
  "/demo",
  "/preview",
  "/early-access",
  "/privacy",
  "/terms",
  "/refunds",
  "/disclaimers",
];

export function sitemapEntries(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const pages = STATIC_PATHS.map((path) => ({
    url: `${base}${path}`,
    lastModified: PUBLIC_CONTENT_UPDATED,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));
  const posts = listPosts().map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: post.date || PUBLIC_CONTENT_UPDATED,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));
  return [...pages, ...posts];
}
