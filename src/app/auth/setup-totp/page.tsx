// src/app/(auth)/setup-totp/page.tsx

export const dynamic = 'force-dynamic';

import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { authOptions } from "@/lib/auth-options";
import { initTotpSetupAction } from "@/lib/totp/totp-actions";
import { SetupTotpForm } from "./setup-totp-form";
import { Shield, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { APP_TITLE } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Set Up Two-Factor Authentication",
  description: "Secure your account with TOTP.",
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


export default async function SetupTotpPage() {
  let session;
  try { session = await getServerSession(authOptions); }
  catch (e) { if (isNextRedirect(e)) throw e; redirect("/auth/signin"); }

  if (!session?.user?.id) redirect("/auth/signin");
  if (!session.user.emailVerified) redirect("/auth/verify-email");
  if (session.user.totpEnabled) redirect("/dashboard");

  const setup = await initTotpSetupAction();
  if (setup.error || !setup.qrCodeUrl || !setup.secret) redirect("/auth/signin");

  return (
    <div className="auth-bg">
      <nav className="auth-nav">
        <Link href="/" className="auth-logo">
          <span className="auth-logo-icon"><Shield size={17} /></span>
          {APP_TITLE}
        </Link>
      </nav>

      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <div className="auth-icon-wrap">
            <ShieldCheck size={18} />
          </div>
          <h1 className="auth-title">Set up two-factor auth</h1>
          <p className="auth-subtitle">
            Required for all accounts. Scan the QR code with Google Authenticator
            or Authy, then enter the 6-digit code to activate.
          </p>
        </div>

        <SetupTotpForm qrCodeUrl={setup.qrCodeUrl} secret={setup.secret} />
      </div>
    </div>
  );
}