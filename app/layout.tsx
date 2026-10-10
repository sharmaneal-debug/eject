import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { siteConfig } from "@/lib/site";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const googleVerification = process.env.GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
 metadataBase: new URL(siteConfig.url),
 title: {
 default: `${siteConfig.name}. ${siteConfig.tagline}`,
 template: `%s · ${siteConfig.name}`,
 },
 description: siteConfig.description,
 icons: { icon: "/icon.svg" },
 verification: googleVerification ? { google: googleVerification } : undefined,
 openGraph: {
 title: siteConfig.tagline,
 description: siteConfig.description,
 url: siteConfig.url,
 siteName: siteConfig.name,
 type: "website",
 images: [{ url: `${siteConfig.url}/og`, width: 1200, height: 630, alt: siteConfig.tagline }],
 },
 twitter: {
 card: "summary_large_image",
 title: siteConfig.tagline,
 description: siteConfig.description,
 images: [`${siteConfig.url}/og`],
 },
 robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
 return (
 <html lang="en">
 <body className="min-h-screen flex flex-col antialiased">
 <Header />
 <main className="flex-1">{children}</main>
 <Footer />
 <Analytics />
 <SpeedInsights />
 </body>
 </html>
 );
}
