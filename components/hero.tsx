import Link from "next/link";
import { Eyebrow } from "./section";

export function Hero() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-32 -left-20 h-[480px] w-[480px] rounded-full bg-signal/20 blur-3xl" />
        <div className="absolute top-40 right-[-120px] h-[420px] w-[420px] rounded-full bg-accent/15 blur-3xl" />
      </div>

      <div className="max-w-content mx-auto px-6 pt-20 pb-14 md:pt-32 md:pb-20">
        <Eyebrow>The exit ramp from no-code platforms</Eyebrow>

        <h1 className="h-display text-5xl md:text-7xl lg:text-8xl tracking-tightest max-w-5xl">
          Eject from Webflow.<br />
          <span className="text-signal">Own your site.</span>{" "}
          <span className="text-ink/40">Pay $5 a year.</span>
        </h1>

        <p className="mt-7 text-lg md:text-xl text-ink-soft max-w-2xl leading-relaxed">
          We migrate your Framer, Webflow, Wix, or Squarespace site to a clean Next.js codebase you own — deployed on Cloudflare Pages free tier. Edit it forever by chat.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link
            href="/migrate"
            className="rounded-md bg-ink text-paper px-5 py-3 text-sm font-medium hover:bg-signal transition"
          >
            Start a free 5-min audit →
          </Link>
          <Link
            href="/calculator"
            className="rounded-md border border-line bg-white px-5 py-3 text-sm font-medium hover:border-ink transition"
          >
            See your savings
          </Link>
          <span className="text-xs text-ink-muted ml-2 font-mono uppercase tracking-widest">
            Done-for-You from $1,499 · 7-day turnaround
          </span>
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-x-10 gap-y-4 text-xs text-ink-muted font-mono uppercase tracking-widest">
          <span>· Cloudflare Pages free</span>
          <span>· Next.js 15 + Tailwind</span>
          <span>· You own the GitHub repo</span>
          <span>· No lock-in, ever</span>
        </div>
      </div>
    </div>
  );
}
