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
    <>
      <div className="h-14" aria-hidden="true" />
      <div data-cookie-banner className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white">
        <div className="mx-auto flex h-14 w-full max-w-content items-center gap-2 px-3 sm:px-6">
          <p className="min-w-0 flex-1 text-sm leading-tight text-ink">
            Stored in this browser.
            <br className="sm:hidden" /> No ad scripts.{" "}
            <Link className="underline underline-offset-2" href="/privacy">
              Privacy
            </Link>
          </p>
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              aria-label="Essential only"
              onClick={() => choose("essential")}
              className="inline-flex h-8 items-center rounded-md border border-line px-2 text-xs text-ink"
            >
              Essential
            </button>
            <button
              type="button"
              aria-label="Allow analytics"
              onClick={() => choose("analytics")}
              className="inline-flex h-8 items-center rounded-md bg-ink px-2 text-xs text-paper"
            >
              Allow
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
