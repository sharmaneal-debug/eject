import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { LEGAL_UPDATED } from "@/lib/legal";

const links = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/refunds", label: "Refunds" },
  { href: "/disclaimers", label: "Disclaimers" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-line/70 bg-paper">
      <div className="mx-auto w-full max-w-content px-6 py-4">
        <ul className="flex flex-wrap gap-x-5">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                className="inline-flex min-h-12 items-center text-base text-ink hover:text-signal"
                href={link.href}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-line/70 px-6 py-4 text-base text-ink">
        © {new Date().getFullYear()} {siteConfig.legalEntity.name}. Operated by {siteConfig.legalEntity.name}.{" "}
        Last updated: {LEGAL_UPDATED}. Not affiliated with Webflow, Framer, Wix, or Squarespace.
      </div>
    </footer>
  );
}
