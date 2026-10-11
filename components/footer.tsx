import Link from "next/link";
import { LEGAL_UPDATED } from "@/lib/legal";
import { siteConfig } from "@/lib/site";

const links = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/refunds", label: "Refunds" },
  { href: "/disclaimers", label: "Disclaimers" },
  { href: "/contact", label: "Contact" },
  { href: "/unsubscribe", label: "Unsubscribe" },
];

export function Footer() {
  return (
    <footer className="border-t border-line/70">
      <div className="mx-auto grid w-full max-w-content gap-2 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-6">
        <p className="min-w-0 text-base leading-snug text-ink-muted">
          © {new Date().getFullYear()} {siteConfig.legalEntity.name}. Operated by {siteConfig.legalEntity.name}. Last updated: {LEGAL_UPDATED}.
        </p>
        <nav className="flex flex-col sm:flex-row sm:flex-wrap sm:gap-x-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-11 items-center px-2 text-base text-ink-soft hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
