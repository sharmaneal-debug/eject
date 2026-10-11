import type { Metadata } from "next";
import { AnalyticsGate } from "@/components/analytics-gate";
import { CookieBanner } from "@/components/cookie-banner";
import "./globals.css";
import { buyNowHref } from "@/lib/checkout-gate";
import { ogImagePath, siteVerification } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const shareImage = ogImagePath(siteConfig.tagline, siteConfig.description);

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
 metadataBase: new URL(siteConfig.url),
 title: {
 default: `${siteConfig.name}. ${siteConfig.tagline}`,
 template: `%s · ${siteConfig.name}`,
 },
 description: siteConfig.description,
 verification: siteVerification(),
 openGraph: {
 title: siteConfig.tagline,
 description: siteConfig.description,
 url: siteConfig.url,
 siteName: siteConfig.name,
 type: "website",
 images: [{ url: shareImage, width: 1200, height: 630, alt: siteConfig.tagline }],
 },
 twitter: {
 card: "summary_large_image",
 title: siteConfig.tagline,
 description: siteConfig.description,
 images: [shareImage],
 },
 robots: { index: true, follow: true },
 icons: {
  icon: "/icon.svg",
  shortcut: "/favicon.ico",
 },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
 return (
 <html lang="en">
 <body className="flex min-h-screen min-w-0 flex-col overflow-x-clip antialiased">
 <Header buyHref={buyNowHref()} />
 <main className="min-w-0 flex-1">{children}</main>
 <Footer />
 <CookieBanner />
 <AnalyticsGate />
 </body>
 </html>
 );
}
