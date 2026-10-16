import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import type { ComplexityReport } from "./complexity";
import type { Tier } from "./stripe";
import { liveStripeAllowed } from "./stripe";
import { fileStoreDir, resolveStorePlan, type StoreKind } from "./storage/plan";

export type { StoreKind } from "./storage/plan";
export { resolveStorePlan } from "./storage/plan";

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
export type TestMode = "mock" | "stripe_test" | "stripe_live";
export type DeliveryJobState = "queued" | "running" | "dispatched" | "delivered" | "failed" | "skipped";
export type DeliveryLlm = "unset" | "ran" | "over_cap" | "unpriced";

export type DeliveryJob = {
  state: DeliveryJobState;
  attempts: number;
  enqueuedAt: string;
  updatedAt: string;
  nextAttemptAt?: string;
  lastError?: string;
  runner?: "inprocess" | "github";
  dispatchedAt?: string;
  deliveredAt?: string;
  llm: DeliveryLlm;
  alertedAt?: string;
};

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

export type OrderChannel = "self_serve" | "operator";

export type OrderEmailLog = {
  confirmation?: string;
  intake?: string;
  delivery?: string;
  /** Autonomous zip. Separate from the intake delivery note so that note cannot suppress the package. */
  package?: string;
  refund?: string;
};

export type OrderExpect = {
  deliveryState?: DeliveryJobState;
  attempts?: number;
  lastError?: string;
  /** Package email is unset, failed, skipped, or a send claim older than two minutes. */
  packageEmail?: "claimable";
};

const PACKAGE_SENDING_STALE_MS = 2 * 60 * 1000;

/** True when no live worker holds the customer zip send. */
export function packageSendClaimable(value: string | undefined, nowMs = Date.now()): boolean {
  if (!value || value === "failed" || value === "skipped") return true;
  if (value === "sending") return true;
  if (value.startsWith("sending:")) {
    const stamped = Date.parse(value.slice("sending:".length));
    return !Number.isFinite(stamped) || nowMs - stamped >= PACKAGE_SENDING_STALE_MS;
  }
  return false;
}

export type Order = {
  id: string;
  token?: string;
  tier: Tier;
  /** Automated is self-serve. Done for you payment links are created from the operator view. */
  channel: OrderChannel;
  status: OrderStatus;
  email?: string;
  name?: string;
  siteUrl?: string;
  emails?: OrderEmailLog;
  stripeSessionId?: string;
  amountCents: number;
  currency: string;
  /** True only after a live Stripe event was accepted. Pending orders stay false. */
  livemode: boolean;
  testMode: TestMode;
  deliveryJob?: DeliveryJob;
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
  channel?: OrderChannel;
  siteUrl?: string;
  email?: string;
  name?: string;
  testMode: TestMode;
  amountCents: number;
  currency: string;
};

export function buildPendingOrder(input: NewOrder): Order {
  return {
    ...input,
    channel: input.channel ?? "self_serve",
    id: newOrderId(),
    status: "pending",
    livemode: false,
    createdAt: new Date().toISOString(),
    siteUrl: input.siteUrl?.slice(0, 500) || undefined,
    email: input.email?.slice(0, 200) || undefined,
    name: input.name?.slice(0, 200) || undefined,
  };
}

function expectMatches(order: Order, expect: OrderExpect): boolean {
  if (expect.deliveryState !== undefined && order.deliveryJob?.state !== expect.deliveryState) return false;
  if (expect.attempts !== undefined && order.deliveryJob?.attempts !== expect.attempts) return false;
  if (expect.lastError !== undefined && order.deliveryJob?.lastError !== expect.lastError) return false;
  if (expect.packageEmail === "claimable" && !packageSendClaimable(order.emails?.package)) return false;
  return true;
}

export type OrderStore = {
  kind: StoreKind;
  durable: boolean;
  label: string;
  create(input: NewOrder): Promise<Order>;
  update(id: string, patch: Partial<Order>): Promise<Order>;
  /** Writes patch only when the stored order matches expect. Null means lost the claim. */
  compareAndUpdate(id: string, expect: OrderExpect, patch: Partial<Order>): Promise<Order | null>;
  get(id: string): Promise<Order | null>;
  getByToken(token: string): Promise<Order | null>;
  getBySession(sessionId: string): Promise<Order | null>;
  list(): Promise<Order[]>;
  appendLead(event: LeadRecord): Promise<void>;
  listLeads(): Promise<LeadRecord[]>;
};

type Env = Record<string, string | undefined>;

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

function nextLivemode(order: Order, patch: Partial<Order>): boolean {
  if (patch.livemode === true) return order.livemode === true || liveStripeAllowed();
  if (patch.livemode === false) return false;
  return order.livemode === true;
}

function applyPatch(order: Order, patch: Partial<Order>): Order {
  return {
    ...order,
    ...patch,
    id: order.id,
    livemode: nextLivemode(order, patch),
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
        const order = buildPendingOrder(input);
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
    async compareAndUpdate(id, expect, patch) {
      return lock(async () => {
        const db = await load();
        const index = db.orders.findIndex((order) => order.id === id);
        const current = db.orders[index];
        if (!current || !expectMatches(current, expect)) return null;
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
  const dir = fileStoreDir(env);
  return path.isAbsolute(dir) ? dir : path.join(process.cwd(), dir);
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
        const order = buildPendingOrder(input);
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
    async compareAndUpdate(id, expect, patch) {
      const token = randomBytes(16).toString("hex");
      const lockKey = `eject:deliver-lock:${id}`;
      const acquired = await call(["SET", lockKey, token, "NX", "PX", "120000"]);
      if (acquired !== "OK") return null;
      try {
        const current = await readOrder(id);
        if (!current || !expectMatches(current, expect)) return null;
        const next = applyPatch(current, patch);
        await index(next);
        return next;
      } finally {
        const held = await call(["GET", lockKey]);
        if (held === token) await call(["DEL", lockKey]);
      }
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
      const order = buildPendingOrder(input);
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
    async compareAndUpdate(id, expect, patch) {
      return withClient(async (client) => {
        await client.query("BEGIN");
        try {
          const result = await client.query("SELECT payload FROM eject_orders WHERE id = $1 FOR UPDATE", [id]);
          const current = (result.rows[0] as { payload: Order } | undefined)?.payload;
          if (!current || !expectMatches(current, expect)) {
            await client.query("ROLLBACK");
            return null;
          }
          const next = applyPatch(current, patch);
          await client.query("UPDATE eject_orders SET token = $2, stripe_session_id = $3, payload = $4::jsonb WHERE id = $1", [
            id,
            next.token ?? null,
            next.stripeSessionId ?? null,
            JSON.stringify(next),
          ]);
          await client.query("COMMIT");
          return next;
        } catch (err) {
          await client.query("ROLLBACK");
          throw err;
        }
      });
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
