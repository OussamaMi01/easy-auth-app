// src/app/(auth)/mfa-challenge/page.tsx

export const dynamic = 'force-dynamic';

import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { authOptions } from "@/lib/auth-options";
import { MfaForm } from "./mfa-form";
import { Shield, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { APP_TITLE } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Two-Factor Authentication",
  description: "Verify your identity to continue.",
};

function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}


export default async function MfaChallengePage() {
  let session;
  try { session = await getServerSession(authOptions); }
  catch (e) { if (isNextRedirect(e)) throw e; redirect("/auth/signin"); }

  if (!session?.user?.id) redirect("/auth/signin");
  if (!session.user.emailVerified) redirect("/auth/verify-email");
  if (!session.user.totpEnabled) redirect("/auth/setup-totp");
  if (session.user.mfaPassed) redirect("/dashboard");

  return (
    <div className="auth-bg">
      <nav className="auth-nav">
        <Link href="/" className="auth-logo">
          <span className="auth-logo-icon"><Shield size={17} /></span>
          {APP_TITLE}
        </Link>
      </nav>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-wrap">
            <ShieldCheck size={18} />
          </div>
          <h1 className="auth-title">Two-factor authentication</h1>
          <p className="auth-subtitle">
            Open your authenticator app and enter the 6-digit code, or use a backup code.
          </p>
        </div>

        <MfaForm />
      </div>
    </div>
  );
}