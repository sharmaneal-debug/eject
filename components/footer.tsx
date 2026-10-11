import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { LEGAL_UPDATED } from "@/lib/legal";
import { EjectMark } from "./eject-mark";

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
      <div className="mx-auto w-full max-w-content px-6 py-8">
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-ink text-paper">
            <EjectMark size={14} />
          </span>
          <span className="text-base font-semibold">{siteConfig.name}</span>
        </div>
        <ul className="flex flex-col">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                className="inline-flex min-h-12 items-center text-base text-ink-muted hover:text-signal"
                href={link.href}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-line/70 px-6 py-5 text-base text-ink-muted">
        © {new Date().getFullYear()} {siteConfig.legalEntity.name}. Operated by {siteConfig.legalEntity.name}.{" "}
        Last updated: {LEGAL_UPDATED}. Not affiliated with Webflow, Framer, Wix, or Squarespace.
      </div>
    </footer>
  );
}
