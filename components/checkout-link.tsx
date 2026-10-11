"use client";

import Link from "next/link";
import { trackEvent } from "./track-event";

export function CheckoutLink({
  tier,
  className,
  children,
}: {
  tier: "express" | "concierge";
  className?: string;
  children: React.ReactNode;
}) {
  const href = tier === "concierge" ? "/book" : "/start";
  return (
    <Link href={href} className={className} onClick={() => trackEvent(tier === "concierge" ? "book_click" : "checkout_click", { tier: "automated" })}>
      {children}
    </Link>
  );
}
