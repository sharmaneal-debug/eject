import { getOrderStore, type Order } from "./orders";

export async function requirePaidKit(
  token: string | undefined,
): Promise<{ ok: true; order: Order } | { ok: false; reason: string }> {
  if (!token) {
    return {
      ok: false,
      reason: "The kit is for a paid simple-site order. Open the link from your checkout confirmation.",
    };
  }
  const order = await getOrderStore().getByToken(token);
  if (!order || order.status === "pending") {
    return { ok: false, reason: "That access link is not an active paid order." };
  }
  if (order.status === "refund_recommended" || order.score?.eligibility === "NOT_ELIGIBLE") {
    return {
      ok: false,
      reason: "This order is outside the simple-site scope, so the kit stays closed. Use the refund steps on your intake result.",
    };
  }
  if (!order.score || (order.status !== "queued" && order.status !== "delivered")) {
    return { ok: false, reason: "Submit your site URL first so we can confirm it is a simple site." };
  }
  return { ok: true, order };
}

export function kitHref(token: string, slug?: string): string {
  const path = slug ? `/kit/${slug}` : "/kit";
  return `${path}?token=${encodeURIComponent(token)}`;
}
