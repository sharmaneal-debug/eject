/** UTC calendar-day difference. Positive when `isoDate` is in the future. */
export function daysUntilDate(isoDate: string, now = new Date()): number | null {
  const parsed = parseIsoDate(isoDate);
  if (!parsed) return null;
  const target = Date.UTC(parsed.y, parsed.m - 1, parsed.d);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((target - today) / 86_400_000);
}

export function parseIsoDate(value: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return { y, m, d };
}

export function isPlausibleRenewalDate(isoDate: string, now = new Date()): boolean {
  const days = daysUntilDate(isoDate, now);
  if (days == null) return false;
  return days >= -366 && days <= 366 * 5;
}

export function addUtcDays(isoDate: string, deltaDays: number): string | null {
  const parsed = parseIsoDate(isoDate);
  if (!parsed) return null;
  const dt = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
  dt.setUTCDate(dt.getUTCDate() + deltaDays);
  return dt.toISOString().slice(0, 10);
}

export function formatLongDate(isoDate: string): string {
  const parsed = parseIsoDate(isoDate);
  if (!parsed) return isoDate;
  return new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d)).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
