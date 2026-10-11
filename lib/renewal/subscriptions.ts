import { randomBytes, randomUUID } from "node:crypto";
import type { PlatformId } from "@/lib/pricing/platforms";
import { readCollection, withStoreLock, writeCollection, type StoreInfo } from "@/lib/storage/json-store";

export type RenewalSubscription = {
  id: string;
  email: string;
  platform: PlatformId;
  planId: string | null;
  planLabel: string | null;
  amountUsd: number | null;
  interval: "month" | "year" | null;
  renewalDate: string;
  status: "active" | "unsubscribed";
  unsubscribeToken: string;
  remindersSent: string[];
  createdAt: string;
  source: "form" | "email-paste";
};

type FileShape = { subscriptions: RenewalSubscription[] };

const NAME = "renewal-subscriptions";
const EMPTY: FileShape = { subscriptions: [] };

export async function listSubscriptions(): Promise<{ subscriptions: RenewalSubscription[]; info: StoreInfo }> {
  const { data, info } = await readCollection<FileShape>(NAME, EMPTY);
  return { subscriptions: data.subscriptions ?? [], info };
}

export async function saveSubscription(
  input: Omit<RenewalSubscription, "id" | "unsubscribeToken" | "remindersSent" | "createdAt" | "status"> & {
    status?: RenewalSubscription["status"];
  },
): Promise<{ subscription: RenewalSubscription; info: StoreInfo }> {
  return withStoreLock(NAME, async () => {
    const { data } = await readCollection<FileShape>(NAME, EMPTY);
    const subscription: RenewalSubscription = {
      ...input,
      id: randomUUID(),
      status: input.status ?? "active",
      unsubscribeToken: randomBytes(24).toString("hex"),
      remindersSent: [],
      createdAt: new Date().toISOString(),
    };
    data.subscriptions.push(subscription);
    const info = await writeCollection(NAME, data);
    return { subscription, info };
  });
}

export async function updateSubscription(
  id: string,
  patch: (current: RenewalSubscription) => RenewalSubscription,
): Promise<StoreInfo | null> {
  return withStoreLock(NAME, async () => {
    const { data } = await readCollection<FileShape>(NAME, EMPTY);
    const index = data.subscriptions.findIndex((s) => s.id === id);
    if (index < 0) return null;
    data.subscriptions[index] = patch(data.subscriptions[index]!);
    return writeCollection(NAME, data);
  });
}

export async function unsubscribeByToken(
  token: string,
): Promise<{ ok: true; already: boolean } | { ok: false }> {
  if (!token || token.length < 16) return { ok: false };
  return withStoreLock(NAME, async () => {
    const { data } = await readCollection<FileShape>(NAME, EMPTY);
    const found = data.subscriptions.find((s) => s.unsubscribeToken === token);
    if (!found) return { ok: false as const };
    if (found.status === "unsubscribed") return { ok: true as const, already: true };
    found.status = "unsubscribed";
    await writeCollection(NAME, data);
    return { ok: true as const, already: false };
  });
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!user || !domain) return "your email";
  const visible = user.slice(0, 1);
  return `${visible}***@${domain}`;
}
