import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function KitLocked({ reason }: { reason: string }) {
  return (
    <div className="max-w-xl">
      <h1 className="h-display text-4xl md:text-5xl tracking-tightest mb-4">Kit locked.</h1>
      <p className="text-ink-soft text-lg leading-relaxed mb-6">{reason}</p>
      <p className="text-sm text-ink-muted mb-6">
        Questions: <a className="text-accent" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
      </p>
      <Link href="/pricing" className="text-sm text-ink-muted hover:text-ink">
        ← pricing
      </Link>
    </div>
  );
}
