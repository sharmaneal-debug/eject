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

export type StoreDriver = "blob" | "file" | "memory";

export type StoreInfo = {
  driver: StoreDriver;
  durable: boolean;
};

const memory = new Map<string, string>();
const locks = new Map<string, Promise<unknown>>();

function storeDir(): string {
  return process.env.DURABLE_STORE_DIR || path.join(process.cwd(), ".data");
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

export async function readCollection<T>(name: string, fallback: T): Promise<{ data: T; info: StoreInfo }> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const text = await readBlob(name);
      if (text == null) return { data: fallback, info: { driver: "blob", durable: true } };
      return { data: JSON.parse(text) as T, info: { driver: "blob", durable: true } };
    } catch (err) {
      console.error("[store] blob read failed", (err as Error).message);
    }
  }

  try {
    const text = await fs.readFile(filePath(name), "utf8");
    return { data: JSON.parse(text) as T, info: { driver: "file", durable: true } };
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code && code !== "ENOENT") {
      console.error("[store] file read failed", code);
    }
  }

  const cached = memory.get(name);
  if (cached) return { data: JSON.parse(cached) as T, info: { driver: "memory", durable: false } };
  return { data: fallback, info: { driver: memoryDriverFallback(), durable: false } };
}

export async function writeCollection<T>(name: string, data: T): Promise<StoreInfo> {
  const text = JSON.stringify(data);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await writeBlob(name, text);
      return { driver: "blob", durable: true };
    } catch (err) {
      console.error("[store] blob write failed", (err as Error).message);
    }
  }

  try {
    const dest = filePath(name);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, text, "utf8");
    return { driver: "file", durable: true };
  } catch (err) {
    console.error("[store] file write failed", (err as Error).message);
  }

  memory.set(name, text);
  return { driver: "memory", durable: false };
}

function memoryDriverFallback(): StoreDriver {
  return process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "memory";
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
