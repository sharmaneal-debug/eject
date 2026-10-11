import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { EjectMark } from "./eject-mark";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/80 backdrop-blur">
      <div className="mx-auto flex max-w-content items-center px-6 py-4">
        <Link href="/" className="inline-flex min-h-12 items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-ink text-paper">
            <EjectMark size={16} />
          </span>
          <span className="text-lg font-semibold tracking-tight">{siteConfig.name}</span>
        </Link>
      </div>
    </header>
  );
}
