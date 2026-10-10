import { siteConfig, doneForYouCapLabel } from "@/lib/site";
import { addUtcDays, daysUntilDate, formatLongDate } from "./dates";

export type MoveStep = {
  id: "90" | "60" | "30" | "7" | "0";
  daysBefore: number;
  date: string;
  title: string;
  detail: string;
  passed: boolean;
};

const STEP_COPY: { id: MoveStep["id"]; daysBefore: number; title: string; detail: string }[] = [
  {
    id: "90",
    daysBefore: 90,
    title: "Confirm this is a simple site",
    detail:
      "Open the live site. Eject only takes marketing pages, portfolios, and landing pages. If you see a cart, memberships, bookings, or a large blog/CMS, stop and hire a specialist instead of starting a move.",
  },
  {
    id: "60",
    daysBefore: 60,
    title: "Start the move",
    detail: `Pick ${siteConfig.pricing.express.name} ($${siteConfig.pricing.express.price}), an automated migration of a simple site that you review before DNS, or ${siteConfig.pricing.concierge.name} ($${siteConfig.pricing.concierge.price}), which we do by hand: ${doneForYouCapLabel()}. ${siteConfig.editing.lead} ${siteConfig.editing.included} There is no preview before you pay. Beyond the cap, we refer out or quote an add-on.`,
  },
  {
    id: "30",
    daysBefore: 30,
    title: "Review, then turn off auto-renew",
    detail:
      "Review the pages in scope and the DNS checklist. Turn off automatic renewal at the platform so the upcoming invoice does not charge. Do this in the platform's billing settings, not by deleting the site early.",
  },
  {
    id: "7",
    daysBefore: 7,
    title: "Point the domain when you are ready",
    detail:
      "Switch DNS only after the new site is on a host you control. Keep the old site until the new one answers on your domain.",
  },
  {
    id: "0",
    daysBefore: 0,
    title: "Renewal day",
    detail:
      "Confirm the platform did not bill you. If a charge already went through, use their cancellation flow rather than assuming the move cancelled it.",
  },
];

export function buildMovePlan(renewalDate: string, now = new Date()): {
  renewalDate: string;
  renewalLabel: string;
  daysUntil: number | null;
  steps: MoveStep[];
  summary: string;
} | null {
  const daysUntil = daysUntilDate(renewalDate, now);
  if (daysUntil == null) return null;

  const steps: MoveStep[] = STEP_COPY.map((step) => {
    const date = addUtcDays(renewalDate, -step.daysBefore) ?? renewalDate;
    const daysUntilStep = daysUntilDate(date, now);
    return {
      ...step,
      date,
      passed: daysUntilStep != null && daysUntilStep < 0,
    };
  });

  let summary: string;
  if (daysUntil < 0) {
    summary = `This date was ${formatLongDate(renewalDate)}. Use your next renewal date if the plan already renewed.`;
  } else if (daysUntil === 0) {
    summary = "Renewal is today. Confirm the platform will not charge you before you cancel.";
  } else if (daysUntil < 30) {
    summary = `${daysUntil} days left. Skip the early steps and review the site, turn off auto-renew, and only switch DNS when the new site is ready.`;
  } else {
    summary = `${daysUntil} days until renewal. The useful start line is 60 days out, after you confirm the site is a simple marketing, portfolio, or landing page.`;
  }

  return {
    renewalDate,
    renewalLabel: formatLongDate(renewalDate),
    daysUntil,
    steps,
    summary,
  };
}

export type ReminderSlot = "90" | "60" | "30";

/** Which reminder slot is due today. Null when no unsent window matches. */
export function dueReminder(daysUntil: number, alreadySent: readonly string[]): ReminderSlot | null {
  const windows: { id: ReminderSlot; min: number; max: number }[] = [
    { id: "90", min: 61, max: 90 },
    { id: "60", min: 31, max: 60 },
    { id: "30", min: 1, max: 30 },
  ];
  for (const window of windows) {
    if (daysUntil >= window.min && daysUntil <= window.max && !alreadySent.includes(window.id)) {
      return window.id;
    }
  }
  return null;
}
