import Link from "next/link";
import { siteConfig } from "@/lib/site";

const links = [
 { href: "/how-it-works", label: "How it works" },
 { href: "/pricing", label: "Pricing" },
 { href: "/calculator", label: "Calculator" },
 { href: "/blog", label: "Blog" },
];

export function Header() {
 return (
 <header className="border-b border-line/70 bg-paper/80 backdrop-blur sticky top-0 z-30">
 <div className="max-w-content mx-auto flex items-center justify-between px-6 py-4">
 <Link href="/" className="flex items-center gap-2 group">
 <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-ink text-paper font-mono text-sm">{">"}</span>
 <span className="font-semibold tracking-tight text-lg">{siteConfig.name}</span>
 </Link>
 <nav className="hidden md:flex items-center gap-7 text-sm text-ink-soft">
 {links.map((l) => (
 <Link key={l.href} href={l.href} className="hover:text-signal transition">
 {l.label}
 </Link>
 ))}
 </nav>
 <Link
 href="/"
 className="rounded-md bg-ink text-paper px-4 py-2 text-sm font-medium hover:bg-signal transition"
 >
 Scan my site
 </Link>
 </div>
 </header>
 );
}
