import { AUTOMATED_REFUND_PROMISE } from "@/lib/legal";

export function HonestScope() {
  return (
    <div className="max-w-xl space-y-3 text-lg text-ink-soft">
      <p>Simple sites only. About 10 pages. The automated move is $99, one time.</p>
      <p>{AUTOMATED_REFUND_PROMISE}</p>
      <p>We do not promise a visual match. We do not move a CMS or a shop.</p>
    </div>
  );
}
