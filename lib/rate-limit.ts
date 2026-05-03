// Lightweight in-memory rate limiter. Per-IP token bucket. Enough to prevent
// trivial abuse without a Redis dependency.
//
// Caveat: edge runtime spawns multiple isolates, so this is best-effort.
// A determined attacker can still exhaust budget by hitting different POPs.
// Sufficient for v1; upgrade to Upstash Redis when usage justifies it.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
};

export function rateLimit(opts: {
  key: string;
  windowMs: number;
  max: number;
}): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(opts.key);

  if (!bucket || bucket.resetAt < now) {
    const fresh = { count: 1, resetAt: now + opts.windowMs };
    buckets.set(opts.key, fresh);
    // Garbage-collect stale buckets periodically (cheap, runs every ~100 calls).
    if (buckets.size > 1000 && Math.random() < 0.01) {
      for (const [k, b] of buckets) {
        if (b.resetAt < now) buckets.delete(k);
      }
    }
    return { ok: true, remaining: opts.max - 1, resetAt: fresh.resetAt };
  }

  if (bucket.count >= opts.max) {
    return { ok: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { ok: true, remaining: opts.max - bucket.count, resetAt: bucket.resetAt };
}

export function clientIp(req: Request): string {
  // Vercel sets x-forwarded-for; first entry is the real client.
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}
