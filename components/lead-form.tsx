"use client";

import { useState } from "react";
import { trackEvent } from "./track-event";

export function LeadForm({ intent = "not-a-fit", source = "scope" }: { intent?: string; source?: string }) {
  const [email, setEmail] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setMessage(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          note: [siteUrl.trim() && `URL: ${siteUrl.trim()}`, note.trim()].filter(Boolean).join("\n"),
          intent,
          source,
          page: typeof window !== "undefined" ? window.location.pathname : "",
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string; persisted?: boolean };
      if (!json.ok) {
        setStatus("error");
        setMessage(json.error || "We couldn't save that.");
        return;
      }
      trackEvent("lead_captured", { intent, persisted: json.persisted ? 1 : 0 });
      setStatus("saved");
    } catch {
      setStatus("error");
      setMessage("Network hiccup. Try again.");
    }
  }

  if (status === "saved") {
    return (
      <div className="rounded-2xl border border-line bg-white p-7 md:p-8">
        <p className="font-mono text-xs uppercase tracking-widest text-signal mb-3">Saved</p>
        <h3 className="h-section text-2xl mb-2">We have your note.</h3>
        <p className="text-ink-soft text-sm leading-relaxed">
          If the site is outside our scope, we&apos;ll reply with who to talk to instead. We don&apos;t start a migration from this form.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-line bg-white p-7 md:p-8">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-muted mb-3">Not a fit?</p>
      <h3 className="h-section text-2xl mb-2">Tell us what you have.</h3>
      <p className="text-ink-soft text-sm leading-relaxed mb-5">
        Leave an email and a sentence. We save it, and we can forward it to the leads inbox if that&apos;s configured. This is a referral note, not a checkout.
      </p>
      <label className="block text-sm font-medium mb-2" htmlFor="lead-email">
        Email
      </label>
      <input
        id="lead-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm mb-4 focus:border-ink focus:outline-none"
      />
      <label className="block text-sm font-medium mb-2" htmlFor="lead-url">
        Site URL
      </label>
      <input
        id="lead-url"
        type="text"
        value={siteUrl}
        onChange={(e) => setSiteUrl(e.target.value)}
        placeholder="https://your-site.com"
        className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm mb-4 focus:border-ink focus:outline-none"
      />
      <label className="block text-sm font-medium mb-2" htmlFor="lead-note">
        What&apos;s on the site?
      </label>
      <textarea
        id="lead-note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={4}
        maxLength={2000}
        placeholder="Store with 400 products, or a 12-page portfolio…"
        className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm mb-4 focus:border-ink focus:outline-none"
      />
      {message && <p className="text-sm text-signal mb-3">{message}</p>}
      <button
        type="submit"
        disabled={status === "saving"}
        className="w-full rounded-lg bg-ink text-paper px-4 py-3 text-sm font-medium hover:bg-signal transition disabled:opacity-60"
      >
        {status === "saving" ? "Saving…" : "Save this lead"}
      </button>
    </form>
  );
}
