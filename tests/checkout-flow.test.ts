import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import Stripe from "stripe";
import { createCheckoutSession } from "../lib/checkout";
import { runPaidIntake } from "../lib/fulfillment";
import { requirePaidKit } from "../lib/kit-access";
import { getOrderStore, resetOrderStoreForTests } from "../lib/orders";
import { deliveryDirFor } from "../lib/delivery";
import { POST as checkoutPost } from "../app/api/checkout/route";
import { POST as mockComplete } from "../app/api/checkout/mock-complete/route";
import { POST as webhook } from "../app/api/stripe/webhook/route";

const saved = {
  ORDERS_STORE: process.env.ORDERS_STORE,
  ORDERS_DIR: process.env.ORDERS_DIR,
  EJECT_STRIPE_MODE: process.env.EJECT_STRIPE_MODE,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM: process.env.RESEND_FROM,
  VERCEL: process.env.VERCEL,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  KV_REST_API_URL: process.env.KV_REST_API_URL,
  KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
  POSTGRES_URL: process.env.POSTGRES_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  CHECKOUT_OPEN: process.env.CHECKOUT_OPEN,
};

function restoreEnv() {
  for (const [name, value] of Object.entries(saved)) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
  resetOrderStoreForTests();
}

async function useFileStore() {
  const dir = await mkdtemp(path.join(tmpdir(), "eject-orders-"));
  process.env.ORDERS_STORE = "file";
  process.env.ORDERS_DIR = dir;
  delete process.env.VERCEL;
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
  delete process.env.BLOB_READ_WRITE_TOKEN;
  delete process.env.POSTGRES_URL;
  delete process.env.DATABASE_URL;
  delete process.env.RESEND_API_KEY;
  delete process.env.RESEND_FROM;
  delete process.env.ANTHROPIC_API_KEY;
  resetOrderStoreForTests();
  return dir;
}

test("file store round-trips an order", async () => {
  const dir = await useFileStore();
  try {
    const store = getOrderStore();
    const created = await store.create({
      tier: "done_for_you",
      testMode: "stripe_test",
      amountCents: 19900,
      currency: "usd",
    });
    assert.equal(created.amountCents, 19900);
    assert.equal(created.livemode, false);
    await store.update(created.id, { status: "paid", token: "tok_roundtrip" });
    resetOrderStoreForTests();
    const loaded = await getOrderStore().getByToken("tok_roundtrip");
    assert.equal(loaded?.id, created.id);
    assert.equal(loaded?.tier, "done_for_you");
    const raw = await readFile(path.join(dir, "orders.json"), "utf8");
    assert.match(raw, /tok_roundtrip/);
  } finally {
    await rm(dir, { recursive: true, force: true });
    restoreEnv();
  }
});

test("closed checkout creates no order and no session", async () => {
  const dir = await useFileStore();
  delete process.env.CHECKOUT_OPEN;
  process.env.EJECT_STRIPE_MODE = "mock";
  resetOrderStoreForTests();
  try {
    const result = await createCheckoutSession({
      tier: "automated",
      origin: "http://localhost:3000",
      channel: "operator",
    });
    assert.equal(result.kind, "unavailable");
    assert.equal((await getOrderStore().list()).length, 0);
    const response = await checkoutPost(
      new Request("http://localhost:3000/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tier: "automated", email: "a@b.co" }),
      }),
    );
    assert.equal(response.status, 303);
    const location = response.headers.get("location") ?? "";
    assert.match(location, /\/early-access$/);
    assert.equal(location.includes("cs_"), false);
    assert.equal((await getOrderStore().list()).length, 0);
  } finally {
    await rm(dir, { recursive: true, force: true });
    restoreEnv();
  }
});

test("mock checkout, intake, and kit gate", async () => {
  const dir = await useFileStore();
  process.env.CHECKOUT_OPEN = "true";
  process.env.EJECT_STRIPE_MODE = "mock";
  resetOrderStoreForTests();
  const written: string[] = [];
  try {
    const automated = await createCheckoutSession({ tier: "automated", origin: "http://localhost:3000" });
    assert.equal(automated.kind, "redirect");
    if (automated.kind !== "redirect") return;
    const stored = await getOrderStore().get(automated.orderId);
    assert.equal(stored?.amountCents, 9900);
    assert.equal(stored?.tier, "automated");
    assert.match(automated.url, /\/checkout\/mock\?order=/);

    const publicDone = await createCheckoutSession({ tier: "done_for_you", origin: "http://localhost:3000" });
    assert.equal(publicDone.kind, "unavailable");
    const done = await createCheckoutSession({
      tier: "done_for_you",
      origin: "http://localhost:3000",
      channel: "operator",
    });
    assert.equal(done.kind, "redirect");
    if (done.kind === "redirect") {
      const paidByLink = await getOrderStore().get(done.orderId);
      assert.equal(paidByLink?.amountCents, 19900);
      assert.equal(paidByLink?.channel, "operator");
    }

    const response = await mockComplete(
      new Request("http://localhost:3000/api/checkout/mock-complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId: automated.orderId }),
      }),
    );
    const body = (await response.json()) as { ok: boolean; token?: string; orderId: string };
    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.ok(body.token?.startsWith("tok_"));

    const html = "<!doctype html><html><head><title>Studio</title></head><body><h1>Hello</h1></body></html>";
    const intake = await runPaidIntake(body.token!, "https://example.com", {
      lookupFn: async () => ["1.1.1.1"],
      fetchImpl: async (input) => {
        const url = String(input);
        if (url.includes("sitemap")) return new Response("missing", { status: 404 });
        return new Response(html, { status: 200, headers: { "content-type": "text/html" } });
      },
      now: () => 1_000,
    });
    assert.equal(intake.ok, true);
    if (!intake.ok) return;
    assert.equal(intake.order.score?.eligibility, "ELIGIBLE");
    assert.equal(intake.order.status, "delivered");
    const agents = intake.order.delivery?.repoFiles.find((file) => file.path === "AGENTS.md");
    const editor = intake.order.delivery?.repoFiles.find((file) => file.path === "scripts/chat-edit.mjs");
    assert.ok(agents?.contents.includes("You edit this website"));
    assert.ok(editor?.contents.includes("AGENTS.md"));
    written.push(deliveryDirFor(intake.order.id));

    const kit = await requirePaidKit(body.token);
    assert.equal(kit.ok, true);

    const blocked = await runPaidIntake("missing-token", "https://example.com");
    assert.equal(blocked.ok, false);

    const shop = await createCheckoutSession({ tier: "automated", origin: "http://localhost:3000" });
    assert.equal(shop.kind, "redirect");
    if (shop.kind !== "redirect") return;
    const shopPaid = await mockComplete(
      new Request("http://localhost:3000/api/checkout/mock-complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId: shop.orderId }),
      }),
    );
    const shopBody = (await shopPaid.json()) as { token?: string };
    const shopIntake = await runPaidIntake(shopBody.token!, "https://shop.example", {
      lookupFn: async () => ["1.1.1.1"],
      fetchImpl: async (input) => {
        const url = String(input);
        if (url.includes("sitemap")) return new Response("missing", { status: 404 });
        return new Response("<html><script src='https://cdn.shopify.com/s.js'></script></html>", { status: 200 });
      },
      now: () => 1_000,
    });
    assert.equal(shopIntake.ok, true);
    if (!shopIntake.ok) return;
    assert.equal(shopIntake.order.score?.referral, "refer_out");
    assert.equal(shopIntake.order.status, "refund_recommended");
    const locked = await requirePaidKit(shopBody.token);
    assert.equal(locked.ok, false);
  } finally {
    await rm(dir, { recursive: true, force: true });
    for (const folder of written) await rm(folder, { recursive: true, force: true });
    restoreEnv();
  }
});

test("webhook rejects livemode events and bad signatures", async () => {
  await useFileStore();
  const key = "sk_test_" + "b".repeat(20);
  const secret = "whsec_" + "c".repeat(24);
  process.env.STRIPE_SECRET_KEY = key;
  process.env.STRIPE_WEBHOOK_SECRET = secret;
  process.env.EJECT_STRIPE_MODE = "stripe_test";
  resetOrderStoreForTests();
  try {
    const stripe = new Stripe(key, { apiVersion: "2025-02-24.acacia" });
    const payload = JSON.stringify({
      id: "evt_test_live",
      object: "event",
      api_version: "2025-02-24.acacia",
      created: 1_700_000_000,
      livemode: true,
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_live",
          object: "checkout.session",
          livemode: true,
          payment_status: "paid",
          metadata: { tier: "automated", orderId: "ord_should_not_exist" },
        },
      },
    });
    const signature = stripe.webhooks.generateTestHeaderString({ payload, secret });
    const live = await webhook(
      new Request("http://localhost:3000/api/stripe/webhook", {
        method: "POST",
        headers: { "stripe-signature": signature },
        body: payload,
      }),
    );
    assert.equal(live.status, 400);
    const liveBody = (await live.json()) as { error?: string };
    assert.match(liveBody.error ?? "", /live mode/);
    assert.equal(await getOrderStore().get("ord_should_not_exist"), null);

    const bad = await webhook(
      new Request("http://localhost:3000/api/stripe/webhook", {
        method: "POST",
        headers: { "stripe-signature": "t=1,v1=deadbeef" },
        body: payload,
      }),
    );
    assert.equal(bad.status, 400);
    const badBody = (await bad.json()) as { error?: string };
    assert.match(badBody.error ?? "", /signature/);
  } finally {
    restoreEnv();
  }
});
