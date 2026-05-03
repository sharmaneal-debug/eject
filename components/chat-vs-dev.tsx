"use client";

import { useEffect, useState } from "react";
import { Section, Eyebrow } from "./section";
import { cn } from "@/lib/cn";

type Bubble = { kind: "user" | "ai"; text: string };

const SCRIPT: Bubble[] = [
  { kind: "user", text: "Add a photo of our team to the About page." },
  { kind: "ai", text: "Done. Saved as `team-2026.jpg`. Preview is live." },
  { kind: "user", text: "Change the price from $99 to $129 everywhere." },
  { kind: "ai", text: "Updated 3 places: pricing page, homepage hero, FAQ." },
  { kind: "user", text: "Remove Sarah's testimonial. Move the booking button to the top." },
  { kind: "ai", text: "Removed and moved. Want to deploy now?" },
];

const STEP_MS = 2000;
const RESET_DELAY_MS = 3500;

export function ChatVsDev() {
  const [shown, setShown] = useState<Bubble[]>([]);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    let i = 0;
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;

    function step() {
      if (cancelled) return;
      if (i >= SCRIPT.length) {
        timeout = setTimeout(() => {
          if (cancelled) return;
          setShown([]);
          setTyping(false);
          i = 0;
          timeout = setTimeout(step, 600);
        }, RESET_DELAY_MS);
        return;
      }
      const bubble = SCRIPT[i];
      if (bubble.kind === "ai") {
        setTyping(true);
        timeout = setTimeout(() => {
          if (cancelled) return;
          setTyping(false);
          setShown((prev) => [...prev, bubble]);
          i++;
          timeout = setTimeout(step, STEP_MS);
        }, 900);
      } else {
        setShown((prev) => [...prev, bubble]);
        i++;
        timeout = setTimeout(step, STEP_MS);
      }
    }

    timeout = setTimeout(step, 800);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  return (
    <Section>
      <Eyebrow>Editing your site</Eyebrow>
      <h2 className="h-section text-3xl md:text-5xl max-w-3xl mb-4">
        The old way: hire a designer.{" "}
        <span className="text-ink/40">The new way: just say it.</span>
      </h2>
      <p className="text-ink-soft max-w-2xl text-lg leading-relaxed mb-12">
        Once your site is yours, any AI chatbot can edit it. ChatGPT, Claude, Gemini, Cursor. Free tiers work. No subscription. No designer to email. No agency to schedule.
      </p>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Old way */}
        <div className="rounded-2xl border border-line bg-paper-warm p-7 md:p-9 flex flex-col">
          <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-5">
            Old way · hire a developer
          </p>
          <ul className="space-y-4 flex-1">
            {[
              { hour: "Mon 9:14 AM", text: "Email your developer with the change you want." },
              { hour: "Mon 4:30 PM", text: "Wait for them to reply. They're working on someone else's project." },
              { hour: "Tue 11:02 AM", text: "Clarify what you meant. Send a screenshot." },
              { hour: "Wed 2:18 PM", text: "Site updated. Get a $185 invoice." },
              { hour: "Thu 8:00 AM", text: "Notice you also wanted to change the phone number. Start the cycle again." },
            ].map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="font-mono text-xs text-ink-muted shrink-0 w-24 pt-1">{step.hour}</span>
                <span className="text-ink-soft leading-relaxed">{step.text}</span>
              </li>
            ))}
          </ul>
          <div className="mt-7 pt-5 border-t border-line text-sm text-ink-soft">
            <span className="font-medium text-ink">3 days, $185</span> for one set of edits. Plus you can&apos;t reach them on weekends.
          </div>
        </div>

        {/* New way: animated chat */}
        <div className="rounded-2xl border-2 border-ink bg-ink text-paper p-5 md:p-6 flex flex-col overflow-hidden shadow-[0_24px_60px_-24px_rgba(11,11,15,0.25)]">
          <div className="flex items-center justify-between px-2 py-2 mb-3">
            <p className="text-xs font-mono uppercase tracking-widest text-paper/60">
              New way · talk to your site
            </p>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-signal animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-paper/50">Live</span>
            </div>
          </div>

          <div className="flex-1 min-h-[420px] md:min-h-[460px] space-y-2.5 px-1 overflow-hidden flex flex-col justify-end">
            {shown.map((b, i) => (
              <ChatBubble key={i} bubble={b} />
            ))}
            {typing && <TypingIndicator />}
          </div>

          <div className="mt-4 pt-4 border-t border-paper/10">
            <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-paper/[0.06] border border-paper/10">
              <span className="text-paper/40 text-sm font-mono">{">"}</span>
              <span className="text-paper/40 text-sm">Type what you want changed…</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 grid md:grid-cols-3 gap-4 text-sm">
        <Bubble title="Free tier covers it" body="ChatGPT, Claude, Gemini, Cursor — every one has a free plan that handles website edits without paying a cent. No upsell trap." />
        <Bubble title="No human bottleneck" body="Your AI doesn't sleep, doesn't take weekends off, doesn't have a backlog. Type what you want; it ships." />
        <Bubble title="No tool to learn" body="If you can write a sentence, you can edit your site. The AI reads our instruction file and translates plain English into changes." />
      </div>
    </Section>
  );
}

function ChatBubble({ bubble }: { bubble: Bubble }) {
  const isUser = bubble.kind === "user";
  return (
    <div
      className={cn(
        "flex animate-[chatIn_0.4s_ease-out_forwards]",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-snug",
          isUser
            ? "bg-paper text-ink rounded-br-md"
            : "bg-paper/[0.08] text-paper rounded-bl-md border border-paper/10",
        )}
      >
        {bubble.text}
      </div>
      <style jsx>{`
        @keyframes chatIn {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start animate-[chatIn_0.3s_ease-out_forwards]">
      <div className="flex items-center gap-1 bg-paper/[0.08] border border-paper/10 rounded-2xl rounded-bl-md px-4 py-3">
        {[0, 0.2, 0.4].map((delay) => (
          <span
            key={delay}
            className="block h-1.5 w-1.5 rounded-full bg-paper/60 animate-bounce"
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
      </div>
    </div>
  );
}

function Bubble({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-line bg-paper-warm p-5">
      <p className="font-medium text-ink mb-1">{title}</p>
      <p className="text-ink-soft leading-relaxed">{body}</p>
    </div>
  );
}
