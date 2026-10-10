"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const payload = JSON.stringify({
      message: error.message,
      digest: error.digest ?? "",
      path: window.location.pathname,
    });
    void fetch("/api/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    }).catch(() => {});
  }, [error]);

  return (
    <div className="max-w-xl mx-auto px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-widest text-signal mb-4">Something broke</p>
      <h1 className="h-display text-4xl tracking-tightest mb-4">This page hit an error.</h1>
      <p className="text-ink-soft mb-8">The error was logged. You can try the page again, or go back home.</p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-ink text-paper px-4 py-2 text-sm font-medium hover:bg-signal"
        >
          Try again
        </button>
        <Link href="/" className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:border-ink">
          Home
        </Link>
      </div>
    </div>
  );
}
