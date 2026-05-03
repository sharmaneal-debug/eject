"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { ScanResults, type ScanData } from "./scan-results";

export function Hero() {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ScanData | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!url.trim()) return;
    setScanning(true);
    setData(null);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error || "couldn't scan that site. check the URL?");
      } else {
        setData(json as ScanData);
        // smooth scroll to results
        setTimeout(() => {
          const el = document.getElementById("scan-results");
          el?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    } catch {
      setError("something went wrong. try again?");
    } finally {
      setScanning(false);
    }
  }

  return (
    <>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute -top-40 -left-20 h-[520px] w-[520px] rounded-full bg-signal/20 blur-3xl" />
          <div className="absolute top-40 right-[-120px] h-[440px] w-[440px] rounded-full bg-accent/15 blur-3xl" />
        </div>

        <div className="max-w-content mx-auto px-6 pt-16 pb-12 md:pt-24 md:pb-16">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-ink-muted mb-5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal" />
            For people who own websites — not coders
          </div>

          <h1 className="h-display text-5xl md:text-7xl lg:text-[5.5rem] tracking-tightest max-w-5xl">
            Stop paying for your website{" "}
            <span className="text-ink/40">every month.</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-ink-soft max-w-2xl leading-relaxed">
            We move your Webflow, Framer, Wix, or Squarespace site to a free version you own forever.
            One payment. No monthly bill. It just works.
          </p>

          <form
            onSubmit={onSubmit}
            className="mt-10 max-w-2xl"
            aria-label="Scan your site"
          >
            <div
              className={cn(
                "flex items-center rounded-2xl bg-white border-2 transition shadow-[0_24px_60px_-24px_rgba(11,11,15,0.10)]",
                error ? "border-signal" : "border-ink/10 focus-within:border-ink"
              )}
            >
              <span className="pl-5 pr-2 text-ink-muted text-sm font-mono">https://</span>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value.replace(/^https?:\/\//i, ""))}
                placeholder="your-site.com"
                inputMode="url"
                autoComplete="url"
                spellCheck={false}
                className="flex-1 py-5 px-1 bg-transparent outline-none text-lg placeholder:text-ink-muted/60"
              />
              <button
                type="submit"
                disabled={scanning || !url.trim()}
                className={cn(
                  "m-2 rounded-xl px-5 py-3 text-sm font-medium transition whitespace-nowrap",
                  scanning
                    ? "bg-ink/30 text-paper cursor-wait"
                    : "bg-ink text-paper hover:bg-signal disabled:opacity-50"
                )}
              >
                {scanning ? "Scanning…" : "Scan my site →"}
              </button>
            </div>
            <p className="mt-3 text-sm text-ink-muted">
              {error ? (
                <span className="text-signal">{error}</span>
              ) : (
                "Free, instant, no email needed. We'll show you exactly what we'd do."
              )}
            </p>
          </form>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-ink-muted font-mono uppercase tracking-widest">
            <span>· From $49 one-time</span>
            <span>· Done in 7 days or less</span>
            <span>· No subscription, ever</span>
          </div>
        </div>
      </div>

      {data && <ScanResults data={data} />}
    </>
  );
}
