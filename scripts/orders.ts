#!/usr/bin/env tsx
/**
 * List orders, scores, and cost-to-serve estimates.
 *
 *   pnpm orders
 *
 * Reads the same store the app uses (ORDERS_STORE / ORDERS_DIR, or the
 * local data/orders file). Does not print tokens or email addresses.
 */

import { getOrderStore } from "../lib/orders";

async function main() {
  const store = getOrderStore();
  const orders = await store.list();
  console.log(`${orders.length} order${orders.length === 1 ? "" : "s"} · ${store.label}${store.durable ? "" : " · not durable"}`);
  if (!orders.length) return;

  for (const order of orders) {
    const dollars = (order.amountCents / 100).toFixed(2);
    const score = order.score;
    const parts = [
      order.id,
      order.status,
      order.tier,
      `$${dollars}`,
      order.testMode,
      score ? score.eligibility : "unscored",
      score ? score.referral : "",
      score ? `${score.pageCount} pages` : "",
      score ? `serve $${score.costToServe.totalUsd.toFixed(2)}` : "",
      score ? `~${score.migration.totalHours}h` : "",
      order.siteUrl ?? "",
    ].filter(Boolean);
    console.log(parts.join("  "));
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
