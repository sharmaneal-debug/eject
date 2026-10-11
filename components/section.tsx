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
 <section className={cn(bare ? "" : "py-10 md:py-16", className)}>
 <div className="mx-auto max-w-content min-w-0 px-4 sm:px-6">{children}</div>
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
