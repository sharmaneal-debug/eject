"use client";

import { useEffect, useState } from "react";

const PHASES = ["Scan", "Move", "Edit by chatting"] as const;

export function BoxScreen() {
  const [phase, setPhase] = useState(0);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduce(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (reduce) {
      setPhase(2);
      return;
    }
    const timer = window.setInterval(() => {
      setPhase((current) => (current + 1) % PHASES.length);
    }, 2400);
    return () => window.clearInterval(timer);
  }, [reduce]);

  const step = reduce ? 2 : phase;
  const headline = step === 2 ? "Hello" : "Studio";

  return (
    <button
      type="button"
      className="block w-full max-w-md min-w-0 cursor-pointer overflow-hidden rounded-2xl border border-line bg-white text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      aria-label={`How it works, step ${step + 1}: ${PHASES[step]}. Tap for the next step.`}
      onClick={() => setPhase((current) => (current + 1) % PHASES.length)}
    >
      <span className="sr-only" aria-live="polite">
        {PHASES[step]}
      </span>
      <span className="flex h-8 items-center gap-1.5 border-b border-line px-3" aria-hidden="true">
        <span className="h-2 w-2 rounded-full bg-line" />
        <span className="h-2 w-2 rounded-full bg-line" />
        <span className="h-2 w-2 rounded-full bg-line" />
      </span>
      <span className="grid min-w-0 sm:grid-cols-2">
        <span className="relative block min-h-[7.5rem] min-w-0 p-4">
          {step === 0 ? <span className="eject-scan" aria-hidden="true" /> : null}
          <span className="block text-xl font-semibold">{headline}</span>
          {step === 1 ? (
            <span className="mt-3 flex gap-2" aria-hidden="true">
              <span className="h-10 w-8 rounded border border-line bg-paper" />
              <span className="h-10 w-8 rounded border border-line bg-paper" />
            </span>
          ) : (
            <span className="mt-3 block" aria-hidden="true">
              <span className="block h-2 w-24 max-w-full rounded bg-line" />
              <span className="mt-2 block h-2 w-16 max-w-full rounded bg-line" />
            </span>
          )}
        </span>
        <span className="flex min-h-11 min-w-0 items-center border-t border-line p-3 sm:border-l sm:border-t-0">
          {step === 2 ? (
            <span className="max-w-full rounded-2xl bg-paper-warm px-3 py-2 text-base leading-snug">
              Change the headline to Hello
            </span>
          ) : (
            <span className="text-base text-ink-soft">{PHASES[step]}</span>
          )}
        </span>
      </span>
    </button>
  );
}
