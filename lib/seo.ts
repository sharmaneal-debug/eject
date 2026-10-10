import type { Metadata } from "next";
import { siteConfig } from "./site";

export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
}): Metadata {
  const url = new URL(opts.path, siteConfig.url).toString();
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: opts.path },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
    },
    robots: opts.index === false ? { index: false, follow: false } : { index: true, follow: true },
  };
}
