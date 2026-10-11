import { NextResponse } from "next/server";
import { buyNowHref } from "@/lib/checkout-gate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Client buttons land here so the destination follows CHECKOUT_OPEN at request time. */
export function GET(req: Request) {
  return NextResponse.redirect(new URL(buyNowHref(), req.url), 303);
}
