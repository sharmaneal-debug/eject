// Schema.org structured data builders. Each returns a JSON-LD object suitable
// for <JsonLd data={...} />. Keep these centralized so we can audit them.

import { siteConfig } from "./site";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/icon.svg`,
    description: siteConfig.description,
    email: siteConfig.email,
    sameAs: [`https://twitter.com/${siteConfig.twitter.replace(/^@/, "")}`].filter(Boolean),
    parentOrganization: {
      "@type": "Organization",
      name: siteConfig.legalEntity.name,
    },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    publisher: { "@type": "Organization", name: siteConfig.legalEntity.name },
  };
}

export function serviceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Website migration",
    name: "Eject",
    description: siteConfig.description,
    provider: { "@type": "Organization", name: siteConfig.legalEntity.name, url: siteConfig.url },
    areaServed: "Worldwide",
  };
}

export function articleSchema(post: {
  title: string;
  description: string;
  slug: string;
  date: string;
  author?: string;
  ogImage?: string;
}) {
  const url = `${siteConfig.url}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Organization", name: post.author || siteConfig.name },
    publisher: {
      "@type": "Organization",
      name: siteConfig.legalEntity.name,
      logo: { "@type": "ImageObject", url: `${siteConfig.url}/icon.svg` },
    },
    image: post.ogImage ? `${siteConfig.url}${post.ogImage}` : `${siteConfig.url}/og?title=${encodeURIComponent(post.title)}`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}
