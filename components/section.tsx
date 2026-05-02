import { cn } from "@/lib/cn";

export function Section({
  children,
  className,
  bare = false,
}: {
  children: React.ReactNode;
  className?: string;
  bare?: boolean;
}) {
  return (
    <section className={cn(bare ? "" : "py-20 md:py-28", className)}>
      <div className="max-w-content mx-auto px-6">{children}</div>
    </section>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-ink-muted mb-5">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal" />
      {children}
    </div>
  );
}
