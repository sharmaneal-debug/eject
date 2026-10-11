// Durable JSON collections for Renewal Watch and lead capture.
//
// Choice: Vercel Blob, one private JSON object per collection, when
// BLOB_READ_WRITE_TOKEN is set. Blob is durable on Vercel and does not need
// a second database. The token is read from the environment only.
//
// Fallback, in order:
// 1. A JSON file under DURABLE_STORE_DIR, or .data/ in the project, when
//    that directory is writable. This is the local/dev and test store.
// 2. Process memory, if the file write fails (typical on a serverless
//    instance with no token). Memory does not survive the next invocation.
//    Callers surface `durable: false` instead of pretending the write stuck.
//
// Do not put this fallback on a production deploy and expect reminders to
// keep their place. Set BLOB_READ_WRITE_TOKEN.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileStoreDir, resolveStorePlan, type StoreKind } from "./plan";

export type StoreDriver = "blob" | "file" | "memory" | "kv" | "postgres";

export type StoreInfo = {
  driver: StoreDriver;
  durable: boolean;
};

const memory = new Map<string, string>();
const locks = new Map<string, Promise<unknown>>();

function storeDir(): string {
  const dir = fileStoreDir();
  return path.isAbsolute(dir) ? dir : path.join(process.cwd(), dir);
}

function filePath(name: string): string {
  if (!/^[a-z0-9-]+$/.test(name)) throw new Error("invalid store name");
  return path.join(storeDir(), `${name}.json`);
}

export function withStoreLock<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(name) ?? Promise.resolve();
  const run = prev.then(fn, fn);
  locks.set(
    name,
    run.then(
      () => undefined,
      () => undefined,
    ),
  );
  return run;
}

function driverFor(kind: StoreKind): StoreDriver {
  if (kind === "kv" || kind === "blob" || kind === "postgres" || kind === "file") return kind;
  return "file";
}

export async function readCollection<T>(name: string, fallback: T): Promise<{ data: T; info: StoreInfo }> {
  const plan = resolveStorePlan();
  const driver = driverFor(plan.kind);
  try {
    const text = await readText(driver, name);
    if (text == null) return { data: fallback, info: { driver, durable: plan.durable } };
    return { data: JSON.parse(text) as T, info: { driver, durable: plan.durable } };
  } catch (err) {
    console.error("[store] read failed", (err as Error).message);
  }

  const cached = memory.get(name);
  if (cached) return { data: JSON.parse(cached) as T, info: { driver: "memory", durable: false } };
  return { data: fallback, info: { driver: "memory", durable: false } };
}

export async function writeCollection<T>(name: string, data: T): Promise<StoreInfo> {
  const text = JSON.stringify(data);
  const plan = resolveStorePlan();
  const driver = driverFor(plan.kind);
  try {
    await writeText(driver, name, text);
    return { driver, durable: plan.durable };
  } catch (err) {
    console.error("[store] write failed", (err as Error).message);
  }
  memory.set(name, text);
  return { driver: "memory", durable: false };
}

async function readText(driver: StoreDriver, name: string): Promise<string | null> {
  if (driver === "blob") return readBlob(name);
  if (driver === "kv") return readKv(name);
  if (driver === "postgres") return readPostgres(name);
  if (driver === "memory") return memory.get(name) ?? null;
  try {
    return await fs.readFile(filePath(name), "utf8");
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return null;
    throw err;
  }
}

async function writeText(driver: StoreDriver, name: string, text: string): Promise<void> {
  if (driver === "blob") return writeBlob(name, text);
  if (driver === "kv") return writeKv(name, text);
  if (driver === "postgres") return writePostgres(name, text);
  if (driver === "memory") {
    memory.set(name, text);
    return;
  }
  const dest = filePath(name);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, text, "utf8");
}

function kvEndpoint(): { url: string; token: string } {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("KV store needs KV_REST_API_URL and KV_REST_API_TOKEN.");
  return { url, token };
}

async function kvCall(command: unknown[]): Promise<unknown> {
  const { url, token } = kvEndpoint();
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
  });
  if (!response.ok) throw new Error(`KV request failed (${response.status}).`);
  const body = (await response.json()) as { result?: unknown; error?: string };
  if (body.error) throw new Error("KV request failed.");
  return body.result;
}

async function readKv(name: string): Promise<string | null> {
  const raw = await kvCall(["GET", `eject:collection:${name}`]);
  return typeof raw === "string" ? raw : null;
}

async function writeKv(name: string, text: string): Promise<void> {
  await kvCall(["SET", `eject:collection:${name}`, text]);
}

async function withPg<T>(fn: (client: import("pg").PoolClient) => Promise<T>): Promise<T> {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) throw new Error("Postgres store needs POSTGRES_URL or DATABASE_URL.");
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString, max: 1 });
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS eject_collections (
        name text PRIMARY KEY,
        payload jsonb NOT NULL
      )
    `);
    return await fn(client);
  } finally {
    client.release();
    await pool.end();
  }
}

async function readPostgres(name: string): Promise<string | null> {
  return withPg(async (client) => {
    const result = await client.query("SELECT payload FROM eject_collections WHERE name = $1", [name]);
    const row = result.rows[0] as { payload: unknown } | undefined;
    if (!row) return null;
    return typeof row.payload === "string" ? row.payload : JSON.stringify(row.payload);
  });
}

async function writePostgres(name: string, text: string): Promise<void> {
  await withPg((client) =>
    client.query(
      `INSERT INTO eject_collections (name, payload) VALUES ($1, $2::jsonb)
       ON CONFLICT (name) DO UPDATE SET payload = EXCLUDED.payload`,
      [name, text],
    ),
  );
}

async function readBlob(name: string): Promise<string | null> {
  const { get } = await import("@vercel/blob");
  const result = await get(blobPath(name), {
    access: "private",
    useCache: false,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  if (!result || !result.stream) return null;
  return await new Response(result.stream).text();
}

async function writeBlob(name: string, text: string): Promise<void> {
  const { put } = await import("@vercel/blob");
  await put(blobPath(name), text, {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
}

function blobPath(name: string): string {
  return `eject/${name}.json`;
}
