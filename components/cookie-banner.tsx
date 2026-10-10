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
      <p className="text-sm text-ink-soft leading-relaxed">
        This choice stays in your browser. We do not load advertising or analytics scripts. Read the{" "}
        <Link className="text-accent" href="/privacy">privacy policy</Link>.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => choose("essential")} className="rounded-lg border border-line px-3 py-2 text-sm">
          Essential only
        </button>
        <button type="button" onClick={() => choose("analytics")} className="rounded-lg bg-ink text-paper px-3 py-2 text-sm">
          Allow analytics
        </button>
      </div>
    </div>
  );
}
