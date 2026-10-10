/**
 * One store choice for orders, marketing leads, and renewal watch.
 *
 * ORDERS_STORE forces file, kv, blob, or postgres.
 * Otherwise the first configured remote wins: KV, Blob, then Postgres.
 * With nothing set, local dev uses a JSON directory (durable). On Vercel
 * that file directory is /tmp and is not durable.
 */

export type StoreKind = "file" | "kv" | "blob" | "postgres";

type Env = Record<string, string | undefined>;

export function resolveStorePlan(env: Env = process.env): { kind: StoreKind; durable: boolean; label: string } {
  const choice = env.ORDERS_STORE?.toLowerCase();
  if (choice === "kv" || choice === "blob" || choice === "postgres" || choice === "file") {
    if (choice === "file") {
      return { kind: "file", durable: !env.VERCEL, label: env.VERCEL ? "file (/tmp, not durable on Vercel)" : "file" };
    }
    return { kind: choice, durable: true, label: choice };
  }
  if ((env.KV_REST_API_URL && env.KV_REST_API_TOKEN) || (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN)) {
    return { kind: "kv", durable: true, label: "kv" };
  }
  if (env.BLOB_READ_WRITE_TOKEN) return { kind: "blob", durable: true, label: "blob" };
  if (env.POSTGRES_URL || env.DATABASE_URL) return { kind: "postgres", durable: true, label: "postgres" };
  if (env.VERCEL) return { kind: "file", durable: false, label: "file (/tmp, not durable on Vercel)" };
  return { kind: "file", durable: true, label: "file" };
}

export function fileStoreDir(env: Env = process.env): string {
  if (env.DURABLE_STORE_DIR) return env.DURABLE_STORE_DIR;
  if (env.ORDERS_DIR) return env.ORDERS_DIR;
  if (env.VERCEL) return "/tmp/eject-store";
  return "data/orders";
}
