import type { Order } from "./orders";
import { opsStoreWarning, resolveStorePlan } from "./storage/plan";

export type OpsQueueRow = {
  id: string;
  state: string;
  attempts: number;
  runner: string | null;
  llm: string;
  lastError: string | null;
  siteUrl: string | null;
  email: string | null;
};

export type OpsStatus = {
  storeKind: string;
  storeLabel: string;
  durable: boolean;
  warning: string | null;
  queue: OpsQueueRow[];
};

export function buildOpsStatus(orders: Order[], env: Record<string, string | undefined> = process.env): OpsStatus {
  const plan = resolveStorePlan(env);
  const queue = orders
    .filter((order) => order.deliveryJob)
    .map((order) => ({
      id: order.id,
      state: order.deliveryJob!.state,
      attempts: order.deliveryJob!.attempts,
      runner: order.deliveryJob!.runner ?? null,
      llm: order.deliveryJob!.llm,
      lastError: order.deliveryJob!.lastError ?? null,
      siteUrl: order.siteUrl ?? null,
      email: order.email ?? null,
    }));
  return {
    storeKind: plan.kind,
    storeLabel: plan.label,
    durable: plan.durable,
    warning: opsStoreWarning(env),
    queue,
  };
}
