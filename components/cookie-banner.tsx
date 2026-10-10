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
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white p-4">
      <p className="text-base text-ink-soft">
        This choice stays in your browser.{" "}
        <Link className="text-accent underline-offset-2 hover:underline" href="/privacy">
          Privacy
        </Link>
        .
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={() => choose("essential")} className="min-h-11 rounded-lg border border-line px-3 text-base">
          Essential only
        </button>
        <button type="button" onClick={() => choose("analytics")} className="min-h-11 rounded-lg bg-ink px-3 text-base text-paper">
          Allow analytics
        </button>
      </div>
    </div>
  );
}
