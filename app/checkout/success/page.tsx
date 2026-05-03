import type { Metadata } from "next";
import Link from "next/link";
import { Section, Eyebrow } from "@/components/section";
import { FinalizeOnLoad } from "@/components/finalize-on-load";
import { getStripe, type Tier } from "@/lib/stripe";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "You're in",
  description: "Your kit lands in your inbox in 5 minutes.",
};

type PaidSession = {
  ok: true;
  email?: string;
  name?: string;
  tier: Tier;
  siteUrl?: string;
  amount?: number;
};

async function loadSession(sessionId: string | undefined): Promise<PaidSession | null> {
  if (!sessionId) return null;
  const stripe = getStripe();
  if (!stripe) return null;
  try {
    const s = await stripe.checkout.sessions.retrieve(sessionId);
    if (s.payment_status !== "paid") return null;
    const tier = (s.metadata?.tier ?? "express") as Tier;
    return {
      ok: true,
      email: s.customer_details?.email ?? s.customer_email ?? undefined,
      name: s.customer_details?.name ?? undefined,
      tier,
      siteUrl: s.metadata?.siteUrl || undefined,
      amount: typeof s.amount_total === "number" ? s.amount_total / 100 : undefined,
    };
  } catch {
    return null;
  }
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const sp = await searchParams;
  const session = await loadSession(sp.session_id);
  const tier = session?.tier ?? "express";
  const isExpress = tier === "express";

  return (
    <Section>
      <div className="max-w-2xl">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-signal/15 text-signal mb-6 font-mono text-xl">
          ✓
        </div>
        <Eyebrow>Payment received</Eyebrow>
        <h1 className="h-display text-4xl md:text-6xl tracking-tightest mb-5">
          {session?.name ? `${session.name.split(" ")[0]}, you're in.` : "You're in."}
        </h1>
        <p className="text-ink-soft text-lg leading-relaxed mb-2 max-w-lg">
          {isExpress
            ? "Your kit lands in your inbox in the next 5 minutes."
            : "A human emails you within the next 24 hours to confirm scope."}
        </p>
        {session?.siteUrl && (
          <p className="text-sm text-ink-muted mb-8 font-mono">
            For: <span className="text-ink">{session.siteUrl}</span>
          </p>
        )}

        {isExpress ? (
          <div className="rounded-2xl border border-line bg-paper-warm p-7 md:p-8 mb-8">
            <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-5">
              What&apos;s in the kit
            </p>
            <ul className="space-y-4 text-sm">
              <KitItem n="01" title="The playbook">
                A step-by-step guide customized to your site. Every page, every section,
                every component. Walks you through the rebuild from URL paste to live deploy.
              </KitItem>
              <KitItem n="02" title="AI agent prompts">
                The exact prompts to paste into ChatGPT, Claude, or Cursor. Free tiers all
                work. The AI does the actual rebuild work; the playbook tells it what to do.
              </KitItem>
              <KitItem n="03" title="Next.js + Tailwind starter">
                A starter template the AI fills in with your content. You don&apos;t need to
                know Next.js — the prompts handle the code.
              </KitItem>
              <KitItem n="04" title="10-minute deploy guide">
                Push to GitHub, connect Cloudflare Pages (or Vercel, or Netlify, or
                GitHub Pages — your pick), point your domain. We tell you exactly which
                buttons to click.
              </KitItem>
              <KitItem n="05" title="AI editing kit">
                After the migration, change anything by chatting. We give you the
                instruction file once; you paste it into the AI you use. Type
                &ldquo;move the booking button to the top.&rdquo; Done.
              </KitItem>
              <KitItem n="06" title="30 days of email support">
                Stuck on a step? Reply to the kickoff email. A real person responds
                within 24 hours.
              </KitItem>
            </ul>
            <p className="mt-6 pt-5 border-t border-line text-xs text-ink-muted">
              Don&apos;t see it in 5 minutes? Check spam, or email{" "}
              <a className="text-accent hover:text-signal" href="mailto:hi@ejectfrom.com">
                hi@ejectfrom.com
              </a>
              .
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-paper-warm p-7 md:p-8 mb-8">
            <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-5">
              What happens next
            </p>
            <ol className="space-y-4 text-sm">
              <KitItem n="Day 0" title="Kickoff email">
                Within 24 hours, a personal email confirming your site URL, asking
                anything specific you want preserved or changed, and when you want to
                launch.
              </KitItem>
              <KitItem n="Day 1–4" title="We run the playbook for you">
                On our infrastructure. We rebuild every page, port every blog post,
                wire up your forms.
              </KitItem>
              <KitItem n="Day 5" title="Preview link">
                You get a working preview. Click around, tell us what to change. One
                round of revisions included.
              </KitItem>
              <KitItem n="Day 7" title="Live and yours">
                We deploy on free hosting in your name, point your domain at it, and
                hand you the keys (GitHub repo, hosting account, AI editing kit).
              </KitItem>
            </ol>
          </div>
        )}

        <p className="text-sm text-ink-muted mb-2">
          Receipt sent to{" "}
          {session?.email ? (
            <span className="font-mono text-ink">{session.email}</span>
          ) : (
            "your email"
          )}
          .
        </p>
        {session?.amount !== undefined && (
          <p className="text-sm text-ink-muted">
            Charged: <span className="font-mono text-ink">${session.amount}</span>
          </p>
        )}

        <Link href="/" className="mt-10 inline-flex text-sm text-ink-muted hover:text-ink">
          ← back to home
        </Link>

        {sp.session_id && <FinalizeOnLoad sessionId={sp.session_id} />}
      </div>
    </Section>
  );
}

function KitItem({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="grid grid-cols-[64px_1fr] gap-4 items-start">
      <span className="font-mono text-xs text-signal pt-0.5 tracking-widest">{n}</span>
      <div>
        <p className="font-medium text-ink mb-1">{title}</p>
        <p className="text-ink-soft leading-relaxed">{children}</p>
      </div>
    </li>
  );
}
