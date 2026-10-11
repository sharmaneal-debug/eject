"use client";

import { useState } from "react";
import { ScanResults, type ScanData } from "./scan-results";

export function SiteScanForm() {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ScanData | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
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
      if (!json.ok) setError(json.error || "We couldn't find that website. Check the URL and try again.");
      else setData(json as ScanData);
    } catch {
      setError("Network hiccup. Try again?");
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="min-w-0">
      <form onSubmit={onSubmit} aria-label="Scan your site">
        <label className="block text-base font-medium" htmlFor="scan-url">
          Site URL
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            id="scan-url"
            type="text"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://your-site.com"
            inputMode="url"
            autoComplete="url"
            spellCheck={false}
            className="min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-base"
          />
          <button
            type="submit"
            disabled={scanning || !url.trim()}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-ink px-4 text-base font-medium text-paper hover:bg-signal disabled:opacity-50"
          >
            {scanning ? "Scanning…" : "Free scan"}
          </button>
        </div>
        <p className="mt-2 text-base text-ink-muted">{error ? error : "Free scan. No email. We read public pages only."}</p>
      </form>
      {data ? <ScanResults data={data} /> : null}
    </div>
  );
}
