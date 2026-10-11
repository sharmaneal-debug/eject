import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const EXACT = new Set(["/about", "/pricing", "/how-it-works", "/calculator", "/checkout", "/migrate", "/kit", "/blog"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const retired =
    EXACT.has(pathname) ||
    pathname.startsWith("/checkout/") ||
    pathname.startsWith("/migrate/") ||
    pathname.startsWith("/kit/") ||
    pathname.startsWith("/blog/");

  if (!retired) return NextResponse.next();

  return NextResponse.redirect(new URL("/", request.url), 307);
}

export const config = {
  matcher: [
    "/about",
    "/pricing",
    "/how-it-works",
    "/calculator",
    "/checkout",
    "/checkout/:path*",
    "/migrate",
    "/migrate/:path*",
    "/kit",
    "/kit/:path*",
    "/blog",
    "/blog/:path*",
  ],
};
