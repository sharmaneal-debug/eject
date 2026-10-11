"use client";

import { useState } from "react";

export function UnsubscribeForm({ token }: { token: string }) {
  const [state, setState] = useState<"idle" | "working" | "done" | "already" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("working");
    setMessage(null);
    try {
      const res = await fetch("/api/renewal-watch/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const json = (await res.json()) as { ok?: boolean; already?: boolean; error?: string };
      if (!json.ok) {
        setState("error");
        setMessage(json.error || "That link is not valid.");
        return;
      }
      setState(json.already ? "already" : "done");
    } catch {
      setState("error");
      setMessage("Network hiccup. Try again.");
    }
  }

  if (state === "done" || state === "already") {
    return (
      <p className="rounded-xl border border-line bg-white p-6 text-ink-soft">
        {state === "already" ? "This subscription was already unsubscribed." : "Unsubscribed. We won't send the remaining reminders."}
      </p>
    );
  }

  if (!token) {
    return <p className="text-ink-soft">This page needs the link from a reminder email.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-line bg-white p-6">
      {message && <p className="text-sm text-signal mb-3">{message}</p>}
      <button
        type="submit"
        disabled={state === "working"}
        className="rounded-lg bg-ink text-paper px-5 py-3 text-sm font-medium hover:bg-signal transition disabled:opacity-60"
      >
        {state === "working" ? "Updating…" : "Unsubscribe"}
      </button>
    </form>
  );
}
