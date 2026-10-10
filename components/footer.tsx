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
      <div className="mx-auto flex max-w-content flex-col gap-4 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-base leading-relaxed text-ink-muted">
          © {new Date().getFullYear()} {siteConfig.legalEntity.name}. Operated by {siteConfig.legalEntity.name}. Last updated: {LEGAL_UPDATED}.
        </p>
        <nav className="grid gap-1 sm:grid-cols-2 lg:flex lg:flex-wrap">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="inline-flex min-h-11 items-center text-base text-ink-soft hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
