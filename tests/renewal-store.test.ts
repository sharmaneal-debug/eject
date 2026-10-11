import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { GET as cron } from "../app/api/cron/renewal-reminders/route";
import { POST as unsubscribe } from "../app/api/renewal-watch/unsubscribe/route";
import { listSubscriptions, saveSubscription, unsubscribeByToken } from "../lib/renewal/subscriptions";
import { resetOrderStoreForTests, getOrderStore } from "../lib/orders";

const saved = {
  ORDERS_STORE: process.env.ORDERS_STORE,
  ORDERS_DIR: process.env.ORDERS_DIR,
  DURABLE_STORE_DIR: process.env.DURABLE_STORE_DIR,
  CRON_SECRET: process.env.CRON_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM: process.env.RESEND_FROM,
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
  KV_REST_API_URL: process.env.KV_REST_API_URL,
  KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
  POSTGRES_URL: process.env.POSTGRES_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  VERCEL: process.env.VERCEL,
};

function restore() {
  for (const [name, value] of Object.entries(saved)) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
  resetOrderStoreForTests();
}

test("renewal watch and orders share the file directory, and unsubscribe sticks", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "eject-shared-"));
  process.env.ORDERS_STORE = "file";
  process.env.ORDERS_DIR = dir;
  process.env.DURABLE_STORE_DIR = dir;
  delete process.env.BLOB_READ_WRITE_TOKEN;
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
  delete process.env.POSTGRES_URL;
  delete process.env.DATABASE_URL;
  delete process.env.VERCEL;
  resetOrderStoreForTests();
  try {
    const order = await getOrderStore().create({
      tier: "automated",
      testMode: "mock",
      amountCents: 9900,
      currency: "usd",
    });
    const { subscription, info } = await saveSubscription({
      email: "ada@example.com",
      platform: "webflow",
      planId: "cms",
      planLabel: "CMS",
      amountUsd: 23,
      interval: "month",
      renewalDate: "2026-12-01",
      source: "form",
    });
    assert.equal(info.driver, "file");
    assert.equal(info.durable, true);
    assert.equal((await getOrderStore().get(order.id))?.amountCents, 9900);

    const first = await unsubscribeByToken(subscription.unsubscribeToken);
    assert.deepEqual(first, { ok: true, already: false });
    const again = await unsubscribeByToken(subscription.unsubscribeToken);
    assert.deepEqual(again, { ok: true, already: true });
    const listed = await listSubscriptions();
    assert.equal(listed.subscriptions[0]?.status, "unsubscribed");

    const http = await unsubscribe(
      new Request("http://localhost/api/renewal-watch/unsubscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: "not-a-real-token-value" }),
      }),
    );
    assert.equal(http.status, 404);
  } finally {
    await rm(dir, { recursive: true, force: true });
    restore();
  }
});

test("renewal cron refuses a missing or wrong secret and does not send without RESEND_FROM", async () => {
  delete process.env.CRON_SECRET;
  delete process.env.RESEND_API_KEY;
  delete process.env.RESEND_FROM;
  const open = await cron(new Request("http://localhost/api/cron/renewal-reminders"));
  const openBody = (await open.json()) as { skipped?: string };
  assert.equal(openBody.skipped, "CRON_SECRET not set");

  process.env.CRON_SECRET = "cron-test-secret";
  const denied = await cron(
    new Request("http://localhost/api/cron/renewal-reminders", { headers: { authorization: "Bearer wrong" } }),
  );
  assert.equal(denied.status, 401);

  process.env.RESEND_API_KEY = "re_test_not_used";
  delete process.env.RESEND_FROM;
  const noFrom = await cron(
    new Request("http://localhost/api/cron/renewal-reminders", {
      headers: { authorization: "Bearer cron-test-secret" },
    }),
  );
  const noFromBody = (await noFrom.json()) as { skipped?: string };
  assert.equal(noFromBody.skipped, "RESEND_FROM not set");
  restore();
});
