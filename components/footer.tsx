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
      <div className="mx-auto flex max-w-content flex-col gap-4 px-6 py-8 md:flex-row md:items-center md:justify-between">
        <p className="text-xs leading-relaxed text-ink-muted">
          © {new Date().getFullYear()} {siteConfig.legalEntity.name}. Operated by {siteConfig.legalEntity.name}. Last updated: {LEGAL_UPDATED}.
        </p>
        <nav className="flex flex-wrap gap-x-1 gap-y-1">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="inline-flex min-h-11 items-center px-2 text-sm text-ink-soft hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
