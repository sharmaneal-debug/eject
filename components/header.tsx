import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { EjectMark } from "./eject-mark";

const links = [
  { href: "/pricing", label: "Pricing" },
  { href: "/how-it-works", label: "How it works" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-content items-center justify-between px-6 py-3">
        <Link href="/" className="flex min-h-11 items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-ink text-paper">
            <EjectMark size={16} />
          </span>
          <span className="text-lg font-semibold tracking-tight">{siteConfig.name}</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-ink-soft md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/checkout?tier=express"
          className="inline-flex min-h-11 items-center rounded-lg bg-ink px-4 text-sm font-medium text-paper hover:bg-signal"
        >
          Buy now
        </Link>
      </div>
    </header>
  );
}
