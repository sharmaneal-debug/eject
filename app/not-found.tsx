import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-content px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">Page not found.</h1>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-12 items-center text-base text-accent underline underline-offset-4"
      >
        Home
      </Link>
    </div>
  );
}
