import { getPlan, getPlatform, type PlatformId } from "@/lib/pricing/platforms";
import { isPlausibleRenewalDate } from "./dates";

export type ParsedRenewal = {
  platform: PlatformId | null;
  planId: string | null;
  planLabel: string | null;
  amountUsd: number | null;
  interval: "month" | "year" | null;
  renewalDate: string | null;
  notes: string[];
};

const PLATFORM_PATTERNS: { id: PlatformId; re: RegExp }[] = [
  { id: "squarespace", re: /\bsquarespace\b/i },
  { id: "webflow", re: /\bwebflow\b/i },
  { id: "framer", re: /\bframer\b/i },
  { id: "wix", re: /\bwix\b/i },
];

const MONTHS: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

const DATE_KEYWORDS = /renew(?:al|s|ed)?|billing|billed|due|expires?|expiration|next payment|invoice/i;

type Hit<T> = { value: T; index: number };

export function parseRenewalEmail(text: string, now = new Date()): ParsedRenewal {
  const notes: string[] = [];
  const source = text.replace(/\u00a0/g, " ").trim();
  if (!source) {
    return empty(notes.concat("Paste was empty."));
  }

  const platform = detectPlatform(source);
  const plan = detectPlan(source, platform);
  const amount = detectAmount(source);
  const date = detectDate(source, now);

  if (!platform) notes.push("No Framer, Webflow, Wix, or Squarespace mention found.");
  if (!plan.planLabel) notes.push("No plan name found.");
  if (plan.planLabel && !plan.planId) {
    notes.push(`"${plan.planLabel}" is not a current checked plan. Price needs verification.`);
  }
  if (amount.amountUsd == null) notes.push("No dollar amount found.");
  if (amount.amountUsd != null && !amount.interval) {
    notes.push("Amount found, but not whether it is monthly or yearly.");
  }
  if (!date) notes.push("No renewal date found.");

  return {
    platform,
    planId: plan.planId,
    planLabel: plan.planLabel,
    amountUsd: amount.amountUsd,
    interval: amount.interval,
    renewalDate: date,
    notes,
  };
}

function empty(notes: string[]): ParsedRenewal {
  return {
    platform: null,
    planId: null,
    planLabel: null,
    amountUsd: null,
    interval: null,
    renewalDate: null,
    notes,
  };
}

function detectPlatform(text: string): PlatformId | null {
  for (const entry of PLATFORM_PATTERNS) {
    if (entry.re.test(text)) return entry.id;
  }
  if (/\bbusiness elite\b/i.test(text)) return "wix";
  return null;
}

function detectPlan(
  text: string,
  platform: PlatformId | null,
): { planId: string | null; planLabel: string | null } {
  if (!platform) {
    const elite = text.match(/\bbusiness elite\b/i);
    if (elite) return { planId: "business-elite", planLabel: "Business Elite" };
    return { planId: null, planLabel: null };
  }

  const plans = getPlatform(platform)?.plans ?? [];
  const names = [...plans].sort((a, b) => b.name.length - a.name.length);
  for (const plan of names) {
    const re = new RegExp(`\\b${escapeRegExp(plan.name)}\\b`, "i");
    if (re.test(text)) return { planId: plan.id, planLabel: plan.name };
  }

  const legacy = [
    "commerce advanced",
    "commerce basic",
    "business elite",
    "ecommerce plus",
    "ecommerce standard",
    "business",
    "scale",
    "mini",
    "cms",
    "personal",
  ];
  for (const name of legacy) {
    if (new RegExp(`\\b${escapeRegExp(name)}\\b`, "i").test(text)) {
      const known = plans.find((p) => p.name.toLowerCase() === name || p.id === name.replace(/\s+/g, "-"));
      if (known && getPlan(platform, known.id)) return { planId: known.id, planLabel: known.name };
      return { planId: null, planLabel: titleCase(name) };
    }
  }

  return { planId: null, planLabel: null };
}

function detectAmount(text: string): { amountUsd: number | null; interval: "month" | "year" | null } {
  const hits: Hit<{ amount: number; interval: "month" | "year" | null }>[] = [];
  const money =
    /(?:(?:usd|us\$)\s*)?\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)|\b(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:usd)\b/gi;

  for (const match of text.matchAll(money)) {
    const raw = (match[1] || match[2] || "").replace(/,/g, "");
    const amount = Number(raw);
    if (!Number.isFinite(amount)) continue;
    const window = text.slice(Math.max(0, match.index! - 48), match.index! + match[0].length + 48);
    hits.push({ value: { amount, interval: intervalNear(window) }, index: match.index ?? 0 });
  }

  if (hits.length === 0) return { amountUsd: null, interval: null };

  const keywordIndexes = keywordIndexesIn(text);
  const ranked = [...hits].sort((a, b) => {
    const score = (hit: (typeof hits)[number]) => {
      const distance = keywordIndexes.length
        ? Math.min(...keywordIndexes.map((k) => Math.abs(k - hit.index)))
        : 10_000;
      const intervalBonus = hit.value.interval ? 0 : 200;
      return distance + intervalBonus;
    };
    return score(a) - score(b);
  });
  const best = ranked[0]!.value;
  return { amountUsd: Math.round(best.amount * 100) / 100, interval: best.interval };
}

function intervalNear(window: string): "month" | "year" | null {
  const year = /\b(per year|a year|each year|\/yr|\/year|annually|annual(?!\s+billing)|billed annually|for the year)\b/i.test(
    window,
  );
  const month = /\b(per month|a month|each month|\/mo|\/month|monthly|billed monthly)\b/i.test(window);
  const yearlyRate = /\bbilled yearly\b|\byearly billing\b|\bannual billing\b/i.test(window);
  if (year && !month) return "year";
  if (month || yearlyRate) return "month";
  if (year) return "year";
  return null;
}

function detectDate(text: string, now: Date): string | null {
  const hits: Hit<string>[] = [];

  for (const match of text.matchAll(/\b(20\d{2})-(\d{2})-(\d{2})\b/g)) {
    const iso = `${match[1]}-${match[2]}-${match[3]}`;
    if (isPlausibleRenewalDate(iso, now)) hits.push({ value: iso, index: match.index ?? 0 });
  }

  const monthName =
    /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?\,?\s+(20\d{2})\b/gi;
  for (const match of text.matchAll(monthName)) {
    const iso = toIso(Number(match[3]), MONTHS[match[1]!.toLowerCase()] ?? 0, Number(match[2]));
    if (iso && isPlausibleRenewalDate(iso, now)) hits.push({ value: iso, index: match.index ?? 0 });
  }

  const dayFirst =
    /\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(20\d{2})\b/gi;
  for (const match of text.matchAll(dayFirst)) {
    const iso = toIso(Number(match[3]), MONTHS[match[2]!.toLowerCase()] ?? 0, Number(match[1]));
    if (iso && isPlausibleRenewalDate(iso, now)) hits.push({ value: iso, index: match.index ?? 0 });
  }

  const numeric = /\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](20\d{2})\b/g;
  for (const match of text.matchAll(numeric)) {
    const window = text.slice(Math.max(0, (match.index ?? 0) - 40), (match.index ?? 0) + 8);
    if (!DATE_KEYWORDS.test(window)) continue;
    const iso = toIso(Number(match[3]), Number(match[1]), Number(match[2]));
    if (iso && isPlausibleRenewalDate(iso, now)) hits.push({ value: iso, index: match.index ?? 0 });
  }

  if (hits.length === 0) return null;
  const keywords = keywordIndexesIn(text);
  hits.sort((a, b) => {
    const dist = (hit: Hit<string>) =>
      keywords.length ? Math.min(...keywords.map((k) => Math.abs(k - hit.index))) : hit.index;
    return dist(a) - dist(b);
  });
  return hits[0]!.value;
}

function keywordIndexesIn(text: string): number[] {
  const indexes: number[] = [];
  const re = /renew(?:al|s|ed)?|billing date|next billing|amount due|total|will be charged|charged/gi;
  for (const match of text.matchAll(re)) indexes.push(match.index ?? 0);
  return indexes;
}

function toIso(year: number, month: number, day: number): string | null {
  if (!month) return null;
  const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const dt = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(dt.getTime())) return null;
  if (dt.getUTCMonth() + 1 !== month || dt.getUTCDate() !== day) return null;
  return iso;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function titleCase(value: string): string {
  return value.replace(/\b\w/g, (c) => c.toUpperCase());
}
