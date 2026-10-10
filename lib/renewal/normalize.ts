import { getPlan, PLATFORM_IDS, type PlatformId } from "@/lib/pricing/platforms";
import { isPlausibleRenewalDate } from "./dates";
import { parseRenewalEmail } from "./parse-email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type RenewalInput = {
  email: string;
  platform: PlatformId;
  planId: string | null;
  planLabel: string | null;
  renewalDate: string;
  amountUsd: number | null;
  interval: "month" | "year" | null;
  source: "form" | "email-paste";
};

export function normalizeRenewalInput(
  body: unknown,
  now = new Date(),
): { ok: true; value: RenewalInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Send a JSON object." };
  const raw = body as Record<string, unknown>;
  const email = typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return { ok: false, error: "Enter a valid email address." };
  }

  const pasted = typeof raw.emailText === "string" ? raw.emailText.slice(0, 20_000) : "";
  const parsed = pasted ? parseRenewalEmail(pasted, now) : null;

  const platformRaw = typeof raw.platform === "string" && raw.platform ? raw.platform : parsed?.platform;
  if (!platformRaw || !PLATFORM_IDS.includes(platformRaw as PlatformId)) {
    return { ok: false, error: "Choose Framer, Webflow, Wix, or Squarespace. We couldn't read a platform from the paste." };
  }
  const platform = platformRaw as PlatformId;

  const planIdRaw = typeof raw.planId === "string" && raw.planId ? raw.planId : parsed?.planId;
  const plan = planIdRaw ? getPlan(platform, planIdRaw) : undefined;
  if (planIdRaw && !plan) {
    return { ok: false, error: "That plan isn't in the checked price list." };
  }

  const renewalDate =
    typeof raw.renewalDate === "string" && raw.renewalDate ? raw.renewalDate : parsed?.renewalDate ?? "";
  if (!isPlausibleRenewalDate(renewalDate, now)) {
    return { ok: false, error: "Enter a renewal date, or paste an email that includes one." };
  }

  let amountUsd: number | null = null;
  if (typeof raw.amountUsd === "number" && Number.isFinite(raw.amountUsd) && raw.amountUsd >= 0 && raw.amountUsd < 1_000_000) {
    amountUsd = Math.round(raw.amountUsd * 100) / 100;
  } else if (parsed?.amountUsd != null) {
    amountUsd = parsed.amountUsd;
  }

  const intervalRaw = raw.interval === "month" || raw.interval === "year" ? raw.interval : parsed?.interval ?? null;

  const planLabel =
    plan?.name ??
    (typeof raw.planLabel === "string" && raw.planLabel.trim() ? raw.planLabel.trim().slice(0, 80) : null) ??
    parsed?.planLabel ??
    null;

  return {
    ok: true,
    value: {
      email,
      platform,
      planId: plan?.id ?? null,
      planLabel,
      renewalDate,
      amountUsd,
      interval: amountUsd == null ? null : intervalRaw,
      source: pasted ? "email-paste" : "form",
    },
  };
}
