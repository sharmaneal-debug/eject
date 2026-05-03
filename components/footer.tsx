import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-line/70 bg-paper">
      <div className="max-w-content mx-auto px-6 py-12 grid gap-8 md:grid-cols-4 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-ink text-paper font-mono text-xs">{">"}</span>
            <span className="font-semibold">{siteConfig.name}</span>
          </div>
          <p className="text-ink-muted leading-relaxed max-w-xs">{siteConfig.shortTagline}</p>
        </div>
        <div>
          <p className="font-medium mb-3">Service</p>
          <ul className="space-y-2 text-ink-muted">
            <li><Link className="hover:text-signal" href="/how-it-works">How it works</Link></li>
            <li><Link className="hover:text-signal" href="/pricing">Pricing</Link></li>
            <li><Link className="hover:text-signal" href="/calculator">Cost calculator</Link></li>
            <li><Link className="hover:text-signal" href="/">Scan my site</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-medium mb-3">Migrate from</p>
          <ul className="space-y-2 text-ink-muted">
            <li><Link className="hover:text-signal" href="/migrate/webflow">Webflow → Next.js</Link></li>
            <li><Link className="hover:text-signal" href="/migrate/framer">Framer → Next.js</Link></li>
            <li><Link className="hover:text-signal" href="/migrate/wix">Wix → Next.js</Link></li>
            <li><Link className="hover:text-signal" href="/migrate/squarespace">Squarespace → Next.js</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-medium mb-3">Company</p>
          <ul className="space-y-2 text-ink-muted">
            <li><Link className="hover:text-signal" href="/blog">Blog</Link></li>
            <li><Link className="hover:text-signal" href="/about">About</Link></li>
            <li><a className="hover:text-signal" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line/70 py-5 text-center text-xs text-ink-muted">
        © {new Date().getFullYear()} {siteConfig.name}. Not affiliated with Webflow, Framer, Wix, or Squarespace. We just help you leave.
      </div>
    </footer>
  );
}
