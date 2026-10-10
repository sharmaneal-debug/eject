import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import type { ComplexityReport } from "./complexity";
import type { Tier } from "./stripe";

/**
 * Order store.
 *
 * Pick a backend with ORDERS_STORE, or leave it unset:
 *   - kv        Vercel KV / Upstash REST (KV_REST_API_URL + KV_REST_API_TOKEN,
 *               or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN)
 *   - blob      one private JSON document via Vercel Blob (BLOB_READ_WRITE_TOKEN)
 *   - postgres  POSTGRES_URL or DATABASE_URL (tables are created on first use)
 *   - file      JSON files. Local default is data/orders (gitignored).
 *               On Vercel, with no remote store, this falls back to /tmp and is NOT durable.
 *
 * File is the safe local/test fallback. Set a remote store before taking real orders on Vercel.
 */

export type OrderStatus = "pending" | "paid" | "queued" | "delivered" | "refund_recommended";
export type TestMode = "mock" | "stripe_test";

export type DeliveryPacket = {
  mode: "manual" | "queued";
  llm: "absent" | "queued";
  assetsPullable: boolean;
  rebuildEase: string;
  hostingSteps: string[];
  editor: { cli: string; kitPath: string; note: string };
  repoFiles: Array<{ path: string; contents: string }>;
  repoDir?: string;
  note: string;
};

export type LeadRecord = {
  event: string;
  data: Record<string, unknown>;
  source?: string;
  ts?: string;
};

export type Order = {
  id: string;
  token?: string;
  tier: Tier;
  status: OrderStatus;
  email?: string;
  name?: string;
  siteUrl?: string;
  stripeSessionId?: string;
  amountCents: number;
  currency: string;
  livemode: false;
  testMode: TestMode;
  createdAt: string;
  paidAt?: string;
  kickoffAttemptedAt?: string;
  kickoffSentAt?: string;
  kickoffSkipReason?: string;
  score?: ComplexityReport;
  delivery?: DeliveryPacket;
};

export type NewOrder = {
  tier: Tier;
  siteUrl?: string;
  email?: string;
  name?: string;
  testMode: TestMode;
  amountCents: number;
  currency: string;
};

export type StoreKind = "file" | "kv" | "blob" | "postgres";

export type OrderStore = {
  kind: StoreKind;
  durable: boolean;
  label: string;
  create(input: NewOrder): Promise<Order>;
  update(id: string, patch: Partial<Order>): Promise<Order>;
  get(id: string): Promise<Order | null>;
  getByToken(token: string): Promise<Order | null>;
  getBySession(sessionId: string): Promise<Order | null>;
  list(): Promise<Order[]>;
  appendLead(event: LeadRecord): Promise<void>;
  listLeads(): Promise<LeadRecord[]>;
};

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

function requireEnv(env: Env, names: string[]): string {
  for (const name of names) {
    const value = env[name];
    if (value) return value;
  }
  throw new Error(`Order store is missing ${names.join(" or ")}.`);
}

export function newOrderId(): string {
  return `ord_${randomBytes(16).toString("hex")}`;
}

export function newOrderToken(): string {
  return `tok_${randomBytes(24).toString("base64url")}`;
}

type Db = { orders: Order[]; leads: LeadRecord[] };

function emptyDb(): Db {
  return { orders: [], leads: [] };
}

function applyPatch(order: Order, patch: Partial<Order>): Order {
  return {
    ...order,
    ...patch,
    id: order.id,
    livemode: false,
    createdAt: order.createdAt,
  };
}

function sortOrders(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

function createMemoryApi(load: () => Promise<Db>, save: (db: Db) => Promise<void>, plan: { kind: StoreKind; durable: boolean; label: string }): OrderStore {
  let chain: Promise<unknown> = Promise.resolve();
  const lock = <T>(fn: () => Promise<T>): Promise<T> => {
    const run = chain.then(fn, fn);
    chain = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  };

  return {
    kind: plan.kind,
    durable: plan.durable,
    label: plan.label,
    async create(input) {
      return lock(async () => {
        const db = await load();
        const order: Order = {
          ...input,
          id: newOrderId(),
          status: "pending",
          livemode: false,
          createdAt: new Date().toISOString(),
          siteUrl: input.siteUrl?.slice(0, 500) || undefined,
          email: input.email?.slice(0, 200) || undefined,
          name: input.name?.slice(0, 200) || undefined,
        };
        db.orders.push(order);
        await save(db);
        return order;
      });
    },
    async update(id, patch) {
      return lock(async () => {
        const db = await load();
        const index = db.orders.findIndex((order) => order.id === id);
        const current = db.orders[index];
        if (!current) throw new Error("order not found");
        const next = applyPatch(current, patch);
        db.orders[index] = next;
        await save(db);
        return next;
      });
    },
    async get(id) {
      const db = await load();
      return db.orders.find((order) => order.id === id) ?? null;
    },
    async getByToken(token) {
      const db = await load();
      return db.orders.find((order) => order.token === token) ?? null;
    },
    async getBySession(sessionId) {
      const db = await load();
      return db.orders.find((order) => order.stripeSessionId === sessionId) ?? null;
    },
    async list() {
      const db = await load();
      return sortOrders(db.orders);
    },
    async appendLead(event) {
      return lock(async () => {
        const db = await load();
        db.leads.push(event);
        if (db.leads.length > 2000) db.leads = db.leads.slice(-2000);
        await save(db);
      });
    },
    async listLeads() {
      const db = await load();
      return db.leads.slice(-200).reverse();
    },
  };
}

function fileDir(env: Env): string {
  if (env.ORDERS_DIR) return env.ORDERS_DIR;
  if (env.VERCEL) return path.join("/tmp", "eject-orders");
  return path.join(process.cwd(), "data", "orders");
}

function fileStore(env: Env, plan: { kind: StoreKind; durable: boolean; label: string }): OrderStore {
  const dir = fileDir(env);
  const file = path.join(dir, "orders.json");
  const load = async (): Promise<Db> => {
    try {
      const raw = await readFile(file, "utf8");
      const parsed = JSON.parse(raw) as Db;
      return { orders: parsed.orders ?? [], leads: parsed.leads ?? [] };
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === "ENOENT") return emptyDb();
      throw err;
    }
  };
  const save = async (db: Db) => {
    await mkdir(dir, { recursive: true });
    const tmp = path.join(dir, `orders.${process.pid}.tmp`);
    await writeFile(tmp, JSON.stringify(db), "utf8");
    await writeFile(file, await readFile(tmp));
    const { rm } = await import("node:fs/promises");
    await rm(tmp, { force: true });
  };
  return createMemoryApi(load, save, plan);
}

function kvConfig(env: Env): { url: string; token: string } {
  const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL;
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("KV order store needs KV_REST_API_URL and KV_REST_API_TOKEN (or the UPSTASH_REDIS_REST_* pair).");
  }
  return { url, token };
}

function kvStore(env: Env, plan: { kind: StoreKind; durable: boolean; label: string }): OrderStore {
  const { url, token } = kvConfig(env);
  const call = async (command: unknown[]): Promise<unknown> => {
    const response = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(command),
    });
    if (!response.ok) throw new Error(`KV request failed (${response.status}).`);
    const body = (await response.json()) as { result?: unknown; error?: string };
    if (body.error) throw new Error("KV request failed.");
    return body.result;
  };
  const readOrder = async (id: string): Promise<Order | null> => {
    const raw = await call(["GET", `eject:order:${id}`]);
    if (typeof raw !== "string" || !raw) return null;
    return JSON.parse(raw) as Order;
  };
  let chain: Promise<unknown> = Promise.resolve();
  const lock = <T>(fn: () => Promise<T>): Promise<T> => {
    const run = chain.then(fn, fn);
    chain = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  };
  const index = async (order: Order) => {
    await call(["SET", `eject:order:${order.id}`, JSON.stringify(order)]);
    await call(["SADD", "eject:orders", order.id]);
    if (order.token) await call(["SET", `eject:token:${order.token}`, order.id]);
    if (order.stripeSessionId) await call(["SET", `eject:session:${order.stripeSessionId}`, order.id]);
  };

  return {
    kind: plan.kind,
    durable: plan.durable,
    label: plan.label,
    create(input) {
      return lock(async () => {
        const order: Order = {
          ...input,
          id: newOrderId(),
          status: "pending",
          livemode: false,
          createdAt: new Date().toISOString(),
        };
        await index(order);
        return order;
      });
    },
    update(id, patch) {
      return lock(async () => {
        const current = await readOrder(id);
        if (!current) throw new Error("order not found");
        const next = applyPatch(current, patch);
        await index(next);
        return next;
      });
    },
    get: readOrder,
    async getByToken(token) {
      const id = await call(["GET", `eject:token:${token}`]);
      if (typeof id !== "string" || !id) return null;
      return readOrder(id);
    },
    async getBySession(sessionId) {
      const id = await call(["GET", `eject:session:${sessionId}`]);
      if (typeof id !== "string" || !id) return null;
      return readOrder(id);
    },
    async list() {
      const ids = (await call(["SMEMBERS", "eject:orders"])) as string[] | null;
      const orders: Order[] = [];
      for (const id of ids ?? []) {
        const order = await readOrder(id);
        if (order) orders.push(order);
      }
      return sortOrders(orders);
    },
    async appendLead(event) {
      await call(["RPUSH", "eject:leads", JSON.stringify(event)]);
      await call(["LTRIM", "eject:leads", "-2000", "-1"]);
    },
    async listLeads() {
      const rows = (await call(["LRANGE", "eject:leads", "-200", "-1"])) as string[] | null;
      return (rows ?? [])
        .map((row) => {
          try {
            return JSON.parse(row) as LeadRecord;
          } catch {
            return null;
          }
        })
        .filter((row): row is LeadRecord => Boolean(row))
        .reverse();
    },
  };
}

const BLOB_PATH = "eject/orders.json";

function blobStore(env: Env, plan: { kind: StoreKind; durable: boolean; label: string }): OrderStore {
  const token = requireEnv(env, ["BLOB_READ_WRITE_TOKEN"]);
  const load = async (): Promise<Db> => {
    const { get } = await import("@vercel/blob");
    const result = await get(BLOB_PATH, { access: "private", token, useCache: false });
    if (!result || result.statusCode !== 200 || !result.stream) return emptyDb();
    const text = await new Response(result.stream).text();
    const parsed = JSON.parse(text) as Db;
    return { orders: parsed.orders ?? [], leads: parsed.leads ?? [] };
  };
  const save = async (db: Db) => {
    const { put } = await import("@vercel/blob");
    await put(BLOB_PATH, JSON.stringify(db), {
      access: "private",
      token,
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 60,
    });
  };
  return createMemoryApi(load, save, plan);
}

function postgresStore(env: Env, plan: { kind: StoreKind; durable: boolean; label: string }): OrderStore {
  const connectionString = env.POSTGRES_URL || env.DATABASE_URL;
  if (!connectionString) throw new Error("Postgres order store needs POSTGRES_URL or DATABASE_URL.");
  let ready: Promise<void> | null = null;
  const withClient = async <T>(fn: (client: import("pg").PoolClient) => Promise<T>): Promise<T> => {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString, max: 2 });
    const client = await pool.connect();
    try {
      if (!ready) {
        ready = (async () => {
          await client.query(`
            CREATE TABLE IF NOT EXISTS eject_orders (
              id text PRIMARY KEY,
              token text UNIQUE,
              stripe_session_id text UNIQUE,
              payload jsonb NOT NULL
            )
          `);
          await client.query(`
            CREATE TABLE IF NOT EXISTS eject_leads (
              id bigserial PRIMARY KEY,
              payload jsonb NOT NULL,
              created_at timestamptz NOT NULL DEFAULT now()
            )
          `);
        })();
      }
      await ready;
      return await fn(client);
    } finally {
      client.release();
      await pool.end();
    }
  };
  const read = async (where: string, value: string): Promise<Order | null> =>
    withClient(async (client) => {
      const result = await client.query(`SELECT payload FROM eject_orders WHERE ${where} = $1`, [value]);
      const row = result.rows[0] as { payload: Order } | undefined;
      return row?.payload ?? null;
    });

  return {
    kind: plan.kind,
    durable: plan.durable,
    label: plan.label,
    async create(input) {
      const order: Order = {
        ...input,
        id: newOrderId(),
        status: "pending",
        livemode: false,
        createdAt: new Date().toISOString(),
      };
      await withClient((client) => client.query("INSERT INTO eject_orders (id, payload) VALUES ($1, $2::jsonb)", [order.id, JSON.stringify(order)]));
      return order;
    },
    async update(id, patch) {
      const current = await read("id", id);
      if (!current) throw new Error("order not found");
      const next = applyPatch(current, patch);
      await withClient((client) =>
        client.query("UPDATE eject_orders SET token = $2, stripe_session_id = $3, payload = $4::jsonb WHERE id = $1", [
          id,
          next.token ?? null,
          next.stripeSessionId ?? null,
          JSON.stringify(next),
        ]),
      );
      return next;
    },
    get: (id) => read("id", id),
    getByToken: (token) => read("token", token),
    getBySession: (sessionId) => read("stripe_session_id", sessionId),
    async list() {
      return withClient(async (client) => {
        const result = await client.query("SELECT payload FROM eject_orders");
        return sortOrders(result.rows.map((row: { payload: Order }) => row.payload));
      });
    },
    async appendLead(event) {
      await withClient((client) => client.query("INSERT INTO eject_leads (payload) VALUES ($1::jsonb)", [JSON.stringify(event)]));
    },
    async listLeads() {
      return withClient(async (client) => {
        const result = await client.query("SELECT payload FROM eject_leads ORDER BY id DESC LIMIT 200");
        return result.rows.map((row: { payload: LeadRecord }) => row.payload);
      });
    },
  };
}

let cached: { key: string; store: OrderStore } | null = null;

function cacheKey(env: Env): string {
  const plan = resolveStorePlan(env);
  return [plan.kind, plan.durable ? "1" : "0", env.ORDERS_DIR ?? "", env.VERCEL ?? ""].join("|");
}

export function resetOrderStoreForTests() {
  cached = null;
}

export function getOrderStore(env: Env = process.env): OrderStore {
  const key = cacheKey(env);
  if (cached?.key === key) return cached.store;
  const plan = resolveStorePlan(env);
  let store: OrderStore;
  if (plan.kind === "kv") store = kvStore(env, plan);
  else if (plan.kind === "blob") store = blobStore(env, plan);
  else if (plan.kind === "postgres") store = postgresStore(env, plan);
  else store = fileStore(env, plan);
  cached = { key, store };
  return store;
}
