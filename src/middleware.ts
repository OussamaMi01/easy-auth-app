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

  // Define protected routes
  const isProtected = ["/dashboard", "/settings", "/profile"].some((p) =>
    pathname.startsWith(p)
  );
  const isPublicAuth = ["/auth/signin", "/auth/signup"].some((p) =>
    pathname.startsWith(p)
  );

  // MFA related routes that should be accessible during setup
  const isMfaRoute = ["/auth/setup-totp", "/auth/mfa-challenge"].some((p) =>
    pathname.startsWith(p)
  );

  const isVerifyEmailRoute = pathname.startsWith("/auth/verify-email");
  const isLogoutRoute = pathname.startsWith("/api/auth/signout");

  // ── 1. No session → signin (except for public routes) ────────────────────
  if (isProtected && !token) {
    const url = new URL("/auth/signin", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (token) {
    // Debug logging
    console.log("[Middleware] Token:", {
      email: token.email,
      emailVerified: token.emailVerified,
      totpEnabled: token.totpEnabled,
      mfaPassed: token.mfaPassed,
    });

    // ── 2. Email not verified → verify-email ───────────────────────────────
    // Skip for logout route
    if (!isLogoutRoute && !token.emailVerified && isProtected && !isVerifyEmailRoute && !isMfaRoute) {
      return NextResponse.redirect(new URL("/auth/verify-email", request.url));
    }

    // ── 3. Email verified but TOTP not enabled → setup-totp ─────────────────
    // This is only for users who haven't set up MFA yet
    // Skip for MFA routes, verify-email, and logout
    if (
      !isLogoutRoute &&
      token.emailVerified &&
      !token.totpEnabled &&
      isProtected &&
      !isMfaRoute &&
      !isVerifyEmailRoute
    ) {
      return NextResponse.redirect(new URL("/auth/setup-totp", request.url));
    }

    // ── 4. TOTP enabled but MFA not passed this session → mfa-challenge ────
    // Skip for MFA routes, verify-email, and logout
    if (
      !isLogoutRoute &&
      token.emailVerified &&
      token.totpEnabled &&
      !token.mfaPassed &&
      isProtected &&
      !isMfaRoute &&
      !isVerifyEmailRoute
    ) {
      return NextResponse.redirect(new URL("/auth/mfa-challenge", request.url));
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
    "/auth/setup-totp",
    "/auth/mfa-challenge",
    "/auth/verify-email",
  ],
};