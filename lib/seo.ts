import type { Metadata } from "next";
import { siteConfig } from "./site";

export function ogImagePath(title: string, description: string): string {
  const params = new URLSearchParams();
  params.set("title", title.slice(0, 100));
  params.set("subtitle", description.slice(0, 120));
  return `/og?${params.toString()}`;
}

export function siteVerification(): Metadata["verification"] {
  const google = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  const bing = process.env.BING_SITE_VERIFICATION?.trim();
  if (!google && !bing) return undefined;
  return {
    ...(google ? { google } : {}),
    ...(bing ? { other: { "msvalidate.01": bing } } : {}),
  };
}

export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
  canonical?: string;
  type?: "website" | "article";
  image?: string;
  /** Skip the layout title template. Use when the title already includes the brand. */
  absoluteTitle?: boolean;
}): Metadata {
  const url = new URL(opts.path, siteConfig.url).toString();
  const image = opts.image ?? ogImagePath(opts.title, opts.description);
  const images = [{ url: image, width: 1200, height: 630, alt: opts.title }];
  return {
    title: opts.absoluteTitle ? { absolute: opts.title } : opts.title,
    description: opts.description,
    alternates: { canonical: opts.canonical ?? opts.path },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      type: opts.type ?? "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: [image],
    },
    robots: opts.index === false ? { index: false, follow: false } : { index: true, follow: true },
  };
}
