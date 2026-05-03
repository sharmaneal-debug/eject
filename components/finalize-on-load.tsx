"use client";

import { useEffect, useRef } from "react";

// Fires the kickoff email by hitting /api/checkout/finalize once on page load.
// Stripe verifies the session was paid before the email goes out, so this is
// safe even if someone manually visits /checkout/success?session_id=...
export function FinalizeOnLoad({ sessionId }: { sessionId: string }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    fetch("/api/checkout/finalize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    }).catch(() => {
      /* non-fatal; user still sees the success page */
    });
  }, [sessionId]);
  return null;
}
