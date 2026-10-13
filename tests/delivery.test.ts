import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { test } from "node:test";
import { analyzeSnapshot, type CrawlSnapshot } from "../lib/complexity";
import { buildDelivery, materializeDelivery } from "../lib/delivery";
import { planDeliver, snapshotDirForSite } from "../lib/deliver-run";
import type { Order } from "../lib/orders";

const execFileAsync = promisify(execFile);

test("delivery repo includes the editing guide and a working lightweight editor", async () => {
  const html = "<html><head><title>Studio</title></head><body><h1>Hello</h1></body></html>";
  const snapshot: CrawlSnapshot = {
    requestedUrl: "https://example.com/",
    finalUrl: "https://example.com/",
    pages: [{ url: "https://example.com/", html, bytes: html.length }],
    sitemapPageCount: 1,
    scriptSamples: [],
    assetSamples: [],
  };
  const report = analyzeSnapshot(snapshot, { tier: "automated", amountUsd: 99 });
  const order: Order = {
    id: "ord_delivery_test",
    token: "tok_delivery",
    tier: "automated",
    channel: "self_serve",
    status: "paid",
    amountCents: 9900,
    currency: "usd",
    livemode: false,
    testMode: "mock",
    createdAt: new Date().toISOString(),
  };
  const packet = buildDelivery(order, report, snapshot);
  const agents = packet.repoFiles.find((file) => file.path === "AGENTS.md");
  const editing = packet.repoFiles.find((file) => file.path === "EDITING.md");
  const script = packet.repoFiles.find((file) => file.path === "scripts/chat-edit.mjs");
  assert.match(agents?.contents ?? "", /chat/i);
  assert.ok(editing?.contents.toLowerCase().includes("playbook"));
  assert.match(packet.repoFiles.find((file) => file.path === "README.md")?.contents ?? "", /Edit it by chatting/);
  assert.match(packet.note, /static HTML/);
  assert.match(packet.note, /pnpm deliver/);
  assert.equal(packet.note.includes("visual rebuild stays manual"), false);
  assert.ok(script);

  const dir = await mkdtemp(path.join(tmpdir(), "eject-delivery-"));
  try {
    await materializeDelivery(packet, dir);
    const { stdout } = await execFileAsync(process.execPath, ["scripts/chat-edit.mjs", "Change the hero headline to Spring workshops."], {
      cwd: dir,
    });
    assert.match(stdout, /edits\/inbox\.md/);
    const inbox = await readFile(path.join(dir, "edits", "inbox.md"), "utf8");
    assert.match(inbox, /Spring workshops/);
    const agentsFile = await readFile(path.join(dir, "AGENTS.md"), "utf8");
    assert.match(agentsFile, /AGENTS\.md|Agent instructions/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("deliver defaults to static-move and skips the model when the key is missing", () => {
  assert.equal(snapshotDirForSite("https://safia-light.webflow.io/"), path.join("data", "snapshots", "safia-light-webflow-io"));
  const base = {
    siteUrl: "https://example.com/",
    hasDeliveryPacket: true,
    snapshotReady: true,
    llm: false,
    hasApiKey: false,
    outDir: "out/orders/ord_1",
    snapshotDir: "data/snapshots/example-com",
    llmOutDir: "out/orders/ord_1-llm",
  };
  const ready = planDeliver(base);
  assert.deepEqual(ready.actions.map((action) => action.type), ["static-move"]);
  assert.equal(ready.error, undefined);

  const needsCrawl = planDeliver({ ...base, snapshotReady: false });
  assert.deepEqual(needsCrawl.actions.map((action) => action.type), ["crawl", "static-move"]);

  const llmSkipped = planDeliver({ ...base, llm: true, hasApiKey: false });
  assert.deepEqual(llmSkipped.actions.map((action) => action.type), ["static-move", "skip-llm"]);
  assert.equal(llmSkipped.error, undefined);

  const llmRebuild = planDeliver({ ...base, llm: true, hasApiKey: true });
  assert.deepEqual(llmRebuild.actions.map((action) => action.type), ["static-move", "rebuild"]);
  const rebuild = llmRebuild.actions.find((action) => action.type === "rebuild");
  assert.equal(rebuild && "outDir" in rebuild ? rebuild.outDir : "", "out/orders/ord_1-llm");

  const textOnly = planDeliver({ ...base, siteUrl: undefined, snapshotReady: false, llm: true, hasApiKey: false });
  assert.deepEqual(textOnly.actions.map((action) => action.type), ["text", "skip-llm"]);

  const missing = planDeliver({ ...base, siteUrl: undefined, snapshotReady: false, hasDeliveryPacket: false });
  assert.equal(missing.actions.length, 0);
  assert.match(missing.error ?? "", /site URL/);
});
