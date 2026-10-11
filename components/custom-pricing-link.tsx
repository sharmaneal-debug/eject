import Link from "next/link";

export function CustomPricingLink({ className }: { className?: string }) {
  return (
    <Link
      href="/book"
      className={
        className ??
        "inline-flex min-h-11 items-center text-base text-ink-muted underline-offset-4 hover:text-ink hover:underline"
      }
    >
      Contact us or book a call for custom pricing
    </Link>
  );
}
