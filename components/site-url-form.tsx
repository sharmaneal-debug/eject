"use client";

import { useState } from "react";
import { SITE_URL_LABEL } from "@/lib/home-copy";
import type { Platform } from "@/lib/platform";

type ScanOk = {
  ok: true;
  url: string;
  platform: Platform;
  platformLabel: string;
};

type EstimatePanel = (props: { scan: ScanOk }) => React.ReactNode;

export function SiteUrlForm() {
  const [url, setUrl] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scan, setScan] = useState<ScanOk | null>(null);
  const [Panel, setPanel] = useState<EstimatePanel | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const value = url.trim();
    if (!value) return;
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value }),
      });
      const json = (await response.json()) as ScanOk | { ok: false; error?: string };
      if (!json.ok) {
        setScan(null);
        setError(json.error || "We couldn't find that website. Check the URL and try again.");
        return;
      }
      const loaded = await import("./move-estimate-panel");
      setPanel(() => loaded.MoveEstimatePanel);
      setScan({
        ok: true,
        url: json.url,
        platform: json.platform,
        platformLabel: json.platformLabel,
      });
    } catch {
      setScan(null);
      setError("Network hiccup. Try again?");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-8 min-w-0">
      <form onSubmit={onSubmit} aria-label={SITE_URL_LABEL}>
        <label htmlFor="site-url" className="sr-only">
          {SITE_URL_LABEL}
        </label>
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
          <input
            id="site-url"
            name="url"
            data-testid="site-url"
            type="text"
            inputMode="url"
            autoComplete="url"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder={SITE_URL_LABEL}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            className="min-h-12 min-w-0 flex-1 rounded-xl border border-line bg-white px-4 text-base text-ink outline-none placeholder:text-ink-muted focus-visible:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          />
          <button
            type="submit"
            disabled={pending || !url.trim()}
            className="min-h-12 shrink-0 rounded-xl bg-ink px-5 text-base font-medium text-paper hover:bg-signal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-50"
          >
            {pending ? "Checking…" : "Check"}
          </button>
        </div>
        {error ? (
          <p role="alert" className="mt-2 text-base text-signal">
            {error}
          </p>
        ) : null}
      </form>
      {Panel && scan ? <Panel scan={scan} /> : null}
    </div>
  );
}
