import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { Section, Eyebrow } from "@/components/section";
import { getOrderStore } from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Orders",
  robots: { index: false, follow: false },
};

function authorized(presented: string | null | undefined): boolean {
  const expected = process.env.OPS_ACCESS_TOKEN;
  if (!expected || !presented) return false;
  const left = Buffer.from(presented);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export default async function Page({ searchParams }: { searchParams: Promise<{ key?: string }> }) {
  const headerList = await headers();
  const { key } = await searchParams;
  if (!process.env.OPS_ACCESS_TOKEN) {
    return (
      <Section>
        <Eyebrow>Orders</Eyebrow>
        <h1 className="h-display text-4xl tracking-tightest mb-3">Operator view is off.</h1>
        <p className="text-ink-soft max-w-xl">Set OPS_ACCESS_TOKEN, then open this page with header x-ops-token or ?key=.</p>
      </Section>
    );
  }
  if (!authorized(headerList.get("x-ops-token") ?? key)) notFound();

  const store = getOrderStore();
  const orders = await store.list();
  const leads = await store.listLeads();

  return (
    <Section>
      <Eyebrow>Orders</Eyebrow>
      <h1 className="h-display text-4xl tracking-tightest mb-2">Orders</h1>
      <p className="text-sm text-ink-muted mb-8">
        Store: {store.label}. {store.durable ? "Durable." : "Not durable. Set KV, Blob, or Postgres before relying on this in production."}
      </p>
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full text-sm">
          <thead className="bg-paper-warm text-left">
            <tr>
              {["Order", "Tier", "Status", "Decision", "Pages", "Hours", "Cost to serve", "Site"].map((heading) => (
                <th key={heading} className="p-3 font-medium whitespace-nowrap">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-line">
                <td className="p-3 font-mono text-xs">{order.id}</td>
                <td className="p-3">{order.tier}</td>
                <td className="p-3">{order.status}</td>
                <td className="p-3">{order.score ? `${order.score.eligibility} / ${order.score.referral}` : "—"}</td>
                <td className="p-3">{order.score?.pageCount ?? "—"}</td>
                <td className="p-3">{order.score?.migration.totalHours ?? "—"}</td>
                <td className="p-3">{order.score ? `$${order.score.costToServe.totalUsd.toFixed(2)}` : "—"}</td>
                <td className="p-3 max-w-[16rem] truncate">{order.siteUrl || order.email || "—"}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td className="p-3 text-ink-muted" colSpan={8}>No orders stored.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-ink-muted mt-6">{leads.length} recent lead events stored alongside orders.</p>
    </Section>
  );
}
