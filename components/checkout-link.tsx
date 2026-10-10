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
  return (
    <Link href={`/checkout?tier=${tier}`} className={className} onClick={() => trackEvent("checkout_click", { tier })}>
      {children}
    </Link>
  );
}
