// Structured error log. Always prints one JSON line for the platform log.
// If ERROR_LOG_WEBHOOK_URL is set, also POSTs that same object. Never include
// secrets, request bodies, or payment details in `extra`.

type Extra = Record<string, string | number | boolean | null | undefined>;

export function logError(scope: string, err: unknown, extra?: Extra): void {
  const message = err instanceof Error ? err.message : String(err);
  const entry = {
    ts: new Date().toISOString(),
    scope: scope.slice(0, 80),
    message: message.slice(0, 500),
    ...stripExtra(extra),
  };
  console.error("[error]", JSON.stringify(entry));

  const url = process.env.ERROR_LOG_WEBHOOK_URL;
  if (!url) return;
  void fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
    signal: AbortSignal.timeout(2500),
  }).catch(() => {
    // The platform log line above is the record of last resort.
  });
}

function stripExtra(extra?: Extra): Extra {
  if (!extra) return {};
  const out: Extra = {};
  for (const [key, value] of Object.entries(extra)) {
    if (value == null || typeof value === "number" || typeof value === "boolean") {
      out[key] = value;
    } else if (typeof value === "string") {
      out[key] = value.slice(0, 300);
    }
  }
  return out;
}
