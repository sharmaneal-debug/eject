import { randomUUID } from "node:crypto";
import { readCollection, withStoreLock, writeCollection, type StoreInfo } from "@/lib/storage/json-store";
import { siteConfig } from "@/lib/site";

export type StoredLead = {
  id: string;
  email: string;
  name: string;
  note: string;
  intent: string;
  source: string;
  page: string;
  createdAt: string;
};

type FileShape = { leads: StoredLead[] };

const NAME = "leads";
const EMPTY: FileShape = { leads: [] };
const MAX_LEADS = 5000;

export async function saveLead(input: {
  email: string;
  name?: string;
  note?: string;
  intent?: string;
  source?: string;
  page?: string;
}): Promise<{ lead: StoredLead; info: StoreInfo; forwarded: boolean }> {
  const lead: StoredLead = {
    id: randomUUID(),
    email: input.email.trim().toLowerCase(),
    name: (input.name ?? "").trim().slice(0, 120),
    note: (input.note ?? "").trim().slice(0, 2000),
    intent: (input.intent ?? "general").trim().slice(0, 60),
    source: (input.source ?? "site").trim().slice(0, 80),
    page: (input.page ?? "").trim().slice(0, 200),
    createdAt: new Date().toISOString(),
  };

  const info = await withStoreLock(NAME, async () => {
    const { data } = await readCollection<FileShape>(NAME, EMPTY);
    data.leads.push(lead);
    if (data.leads.length > MAX_LEADS) {
      data.leads.splice(0, data.leads.length - MAX_LEADS);
    }
    return writeCollection(NAME, data);
  });

  const forwarded = await forwardLead(lead);
  return { lead, info, forwarded };
}

async function forwardLead(lead: StoredLead): Promise<boolean> {
  const url = process.env.LEADS_WEBHOOK_URL;
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        event: "lead_captured",
        source: siteConfig.url,
        ts: lead.createdAt,
        data: {
          id: lead.id,
          email: lead.email,
          name: lead.name,
          note: lead.note,
          intent: lead.intent,
          page: lead.page,
          leadSource: lead.source,
        },
      }),
      signal: AbortSignal.timeout(3500),
    });
    return res.ok;
  } catch (err) {
    console.warn("[leads] forward failed:", (err as Error).message);
    return false;
  }
}
