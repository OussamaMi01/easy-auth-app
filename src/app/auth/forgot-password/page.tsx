// src/app/(auth)/forgot-password/page.tsx

export const dynamic = 'force-dynamic';

import { redirect } from "next/navigation";
import { Metadata } from "next";
import { KeyRound, Shield, ArrowLeft } from "lucide-react";
import { SendResetEmail } from "./send-reset-email";
import { getServerSession } from "@/lib/auth";
import { authOptions } from "@/lib/auth-options";
import { APP_TITLE } from "@/lib/constants";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your password securely",
};

export default async function ForgotPasswordPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) redirect("/dashboard");

  return (
    <div className="auth-bg">
      <nav className="auth-nav">
        <Link href="/" className="auth-logo">
          <span className="auth-logo-icon"><Shield size={17} /></span>
          {APP_TITLE}
        </Link>
        <Link href="/auth/signin" className="auth-nav-link">
          Sign in →
        </Link>
      </nav>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-wrap">
            <KeyRound size={18} />
          </div>
          <h1 className="auth-title">Forgot password?</h1>
          <p className="auth-subtitle">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <SendResetEmail />

        <div style={{ marginTop: "16px", textAlign: "center" }}>
          <Link
            href="/auth/signin"
            style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              fontSize: "13px", color: "var(--muted)", textDecoration: "none",
              transition: "color 0.15s",
            }}
            className="auth-nav-link"
          >
            <ArrowLeft size={13} />
            Back to sign in
          </Link>
        </div>
      </div>

      <p className="auth-footer-note">
        Secure · 256-bit encryption ·{" "}
        <Link href="/terms">Terms</Link> ·{" "}
        <Link href="/privacy">Privacy</Link>
      </p>
    </div>
  );
}