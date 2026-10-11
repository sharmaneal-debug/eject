"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "eject-cookie-choice";

function readChoice(): "analytics" | "essential" | null {
  try {
    const value = window.localStorage.getItem(KEY);
    if (value === "analytics" || value === "essential") return value;
  } catch {
    return null;
  }
  return null;
}

export function CookieBanner() {
  const [choice, setChoice] = useState<"analytics" | "essential" | null | "unknown">("unknown");

  useEffect(() => {
    setChoice(readChoice());
  }, []);

  function choose(next: "analytics" | "essential") {
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      // Private mode can block storage. Hide the notice for this view anyway.
    }
    setChoice(next);
  }

  if (choice !== null) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white px-4 py-3">
      <div className="mx-auto flex w-full max-w-content flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-base leading-snug text-ink">
          This choice stays in your browser. We do not load advertising or analytics scripts.{" "}
          <Link className="font-semibold text-ink underline decoration-2 underline-offset-2" href="/privacy">
            Privacy
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => choose("essential")} className="inline-flex min-h-11 items-center rounded-lg border border-line px-3 text-base text-ink">
            Essential only
          </button>
          <button type="button" onClick={() => choose("analytics")} className="inline-flex min-h-11 items-center rounded-lg bg-ink px-3 text-base text-paper">
            Allow analytics
          </button>
        </div>
      </div>
    </div>
  );
}
