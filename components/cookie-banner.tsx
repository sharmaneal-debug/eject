"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "eject-cookie-choice";

export function cookieChoice(): "analytics" | "essential" | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(KEY);
  if (value === "analytics" || value === "essential") return value;
  return null;
}

export function CookieBanner() {
  const [choice, setChoice] = useState<"analytics" | "essential" | null | "unknown">("unknown");

  useEffect(() => {
    setChoice(cookieChoice());
  }, []);

  function choose(next: "analytics" | "essential") {
    window.localStorage.setItem(KEY, next);
    setChoice(next);
    window.dispatchEvent(new Event("eject-cookie-choice"));
  }

  if (choice !== null) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-3xl rounded-2xl border border-line bg-white p-4 shadow-lg md:left-auto md:right-6">
      <p className="text-sm text-ink-soft leading-relaxed">
        Essential storage keeps this choice. Analytics runs only if you allow it. We do not sell personal information. Read the{" "}
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
