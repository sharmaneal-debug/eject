"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Bubble = { kind: "user" | "ai"; text: string };

const SCRIPT: Bubble[] = [
  { kind: "user", text: "Change the headline." },
  { kind: "ai", text: "Done. The headline changed." },
  { kind: "user", text: "Move the button up." },
  { kind: "ai", text: "Moved." },
];

export function EditDemo() {
  const [shown, setShown] = useState<Bubble[]>([]);
  const [typing, setTyping] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let index = 0;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    function step() {
      if (cancelled) return;
      if (index >= SCRIPT.length) {
        timer = setTimeout(() => {
          if (cancelled) return;
          setShown([]);
          setTyping(false);
          index = 0;
          timer = setTimeout(step, 500);
        }, 2400);
        return;
      }
      const bubble = SCRIPT[index]!;
      if (bubble.kind === "ai") {
        setTyping(true);
        timer = setTimeout(() => {
          if (cancelled) return;
          setTyping(false);
          setShown((prev) => [...prev, bubble]);
          index += 1;
          timer = setTimeout(step, 1400);
        }, 700);
      } else {
        setShown((prev) => [...prev, bubble]);
        index += 1;
        timer = setTimeout(step, 1200);
      }
    }

    timer = setTimeout(step, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const node = scroller.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [shown, typing]);

  return (
    <div className="overflow-hidden rounded-2xl bg-ink p-4 text-paper">
      <p className="text-base">Edit by chatting</p>
      <div ref={scroller} className="mt-3 h-56 space-y-2 overflow-y-auto">
        {shown.map((bubble, index) => (
          <div key={index} className={cn("flex", bubble.kind === "user" ? "justify-end" : "justify-start")}>
            <p
              className={cn(
                "max-w-[90%] rounded-2xl px-3 py-2 text-base leading-snug",
                bubble.kind === "user" ? "bg-paper text-ink" : "border border-white/15 bg-white/10",
              )}
            >
              {bubble.text}
            </p>
          </div>
        ))}
        {typing && <p className="text-base text-white/70">Writing…</p>}
      </div>
      <div className="mt-3 flex min-h-11 items-center rounded-lg border border-white/20 px-3 text-base text-white/70">
        Type a change
      </div>
    </div>
  );
}
