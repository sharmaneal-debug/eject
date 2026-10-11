import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { readCollection, withStoreLock, writeCollection } from "@/lib/storage/json-store";

export const runtime = "nodejs";

const ALLOWED = new Set(["scan", "checkout_click", "renewal_watch_signup", "lead_captured"]);
const MAX_EVENTS = 5000;

type StoredEvent = {
  id: string;
  name: string;
  props: Record<string, string | number | boolean | null>;
  ts: string;
};

type FileShape = { events: StoredEvent[] };

export async function POST(req: Request) {
  const limit = rateLimit({ key: `event:${clientIp(req)}`, windowMs: 60 * 60 * 1000, max: 60 });
  if (!limit.ok) return NextResponse.json({ ok: false }, { status: 429 });

  let body: { name?: unknown; props?: unknown };
  try {
    body = (await req.json()) as { name?: unknown; props?: unknown };
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (typeof body.name !== "string" || !ALLOWED.has(body.name)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const props: StoredEvent["props"] = {};
  if (body.props && typeof body.props === "object") {
    for (const [key, value] of Object.entries(body.props as Record<string, unknown>).slice(0, 8)) {
      if (!/^[a-z0-9_]{1,40}$/i.test(key)) continue;
      if (typeof value === "string") props[key] = value.slice(0, 80);
      else if (typeof value === "number" && Number.isFinite(value)) props[key] = value;
      else if (typeof value === "boolean" || value === null) props[key] = value;
    }
  }

  const event: StoredEvent = {
    id: randomUUID(),
    name: body.name,
    props,
    ts: new Date().toISOString(),
  };

  const info = await withStoreLock("events", async () => {
    const { data } = await readCollection<FileShape>("events", { events: [] });
    data.events.push(event);
    if (data.events.length > MAX_EVENTS) data.events.splice(0, data.events.length - MAX_EVENTS);
    return writeCollection("events", data);
  });

  return NextResponse.json({ ok: true, persisted: info.durable });
}
