// src/middleware.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  const isProtected = ["/dashboard", "/settings", "/profile"].some((p) =>
    pathname.startsWith(p)
  );
  const isPublicAuth = ["/auth/signin", "/auth/signup"].some((p) =>
    pathname.startsWith(p)
  );

  // ── 1. No session → signin ────────────────────────────────────────────────
  if (isProtected && !token) {
    const url = new URL("/auth/signin", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (token) {
    // ── 2. Email not verified → verify-email ───────────────────────────────
    if (!token.emailVerified && isProtected) {
      return NextResponse.redirect(new URL("/auth/verify-email", request.url));
    }

    // ── 3. TOTP enabled but MFA not passed this session → mfa-challenge ────
    if (
      token.emailVerified &&
      token.totpEnabled &&
      !token.mfaPassed &&
      isProtected
    ) {
      return NextResponse.redirect(new URL("/auth/mfa-challenge", request.url));
    }

    // ── 4. TOTP not set up yet → setup-totp ────────────────────────────────
    // Since MFA is required for all users, enforce setup after email verification
    if (
      token.emailVerified &&
      !token.totpEnabled &&
      isProtected
    ) {
      return NextResponse.redirect(new URL("/auth/setup-totp", request.url));
    }

    // ── 5. Fully authenticated → skip public auth pages ────────────────────
    if (isPublicAuth) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/auth/signin",
    "/auth/signup",
  ],
};