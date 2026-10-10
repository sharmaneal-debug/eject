"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/site";
import { EjectMark } from "./eject-mark";

const links = [
  { href: "/pricing", label: "Pricing" },
  { href: "/calculator", label: "Calculator" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/renewal-watch", label: "Renewal watch" },
  { href: "/blog", label: "Blog" },
  { href: "/book", label: "Book a call" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-paper">
      <div className="mx-auto flex max-w-content items-center justify-between gap-2 px-4 py-2 sm:px-6">
        <Link href="/" className="flex min-h-11 items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-ink text-paper">
            <EjectMark size={16} />
          </span>
          <span className="text-lg font-semibold tracking-tight">{siteConfig.name}</span>
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          {links.slice(0, 3).map((link) => (
            <Link key={link.href} href={link.href} className="inline-flex min-h-11 items-center text-base text-ink-soft hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/checkout?tier=express"
            className="inline-flex min-h-11 items-center rounded-lg bg-ink px-4 text-base font-medium text-paper hover:bg-signal"
          >
            Buy now
          </Link>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-line px-3 text-base lg:hidden"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      {open && (
        <nav id="site-menu" className="border-t border-line px-4 py-2 lg:hidden">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="flex min-h-11 items-center text-base">
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
