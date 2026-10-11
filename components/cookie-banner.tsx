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
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-3xl rounded-2xl border border-line bg-white p-4 shadow-lg md:left-auto md:right-6">
      <p className="text-base text-ink-soft leading-relaxed">
        This choice stays in your browser. We do not load advertising or analytics scripts. Read the{" "}
        <Link className="text-accent underline underline-offset-4" href="/privacy">privacy policy</Link>.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => choose("essential")} className="inline-flex min-h-12 items-center rounded-lg border border-line px-4 text-base">
          Essential only
        </button>
        <button type="button" onClick={() => choose("analytics")} className="inline-flex min-h-12 items-center rounded-lg bg-ink px-4 text-base text-paper">
          Allow analytics
        </button>
      </div>
    </div>
  );
}
