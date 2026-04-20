// src/app/(auth)/reset-password/[token]/page.tsx
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { KeyRound, Shield } from "lucide-react";
import { APP_TITLE } from "@/lib/constants";
import { ResetPasswordForm } from "./reset-password-form";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your account",
};

interface Props {
  params: { token: string };
}

async function verifyToken(token: string): Promise<boolean> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-reset-token?token=${token}`,
      { cache: "no-store" }
    );
    const data = await res.json() as { valid: boolean };
    return data.valid === true;
  } catch {
    return false;
  }
}

export default async function ResetPasswordPage({ params }: Props) {
  const { token } = params;
  if (!token) redirect("/auth/forgot-password");

  const isValid = await verifyToken(token);

  return (
    <div className="auth-bg">
      <nav className="auth-nav">
        <Link href="/" className="auth-logo">
          <span className="auth-logo-icon"><Shield size={17} /></span>
          {APP_TITLE}
        </Link>
        <Link href="/auth/signin" className="auth-nav-link">Sign in →</Link>
      </nav>

      <div className="auth-card">
        <div className="auth-header">
          <div
            className="auth-icon-wrap"
            style={!isValid ? {
              background: "var(--red-dim)",
              border: "1px solid rgba(255,77,109,0.2)",
              color: "var(--red)",
            } : {}}
          >
            <KeyRound size={18} />
          </div>
          <h1 className="auth-title">
            {isValid ? "Set new password" : "Link expired"}
          </h1>
          <p className="auth-subtitle">
            {isValid
              ? "Enter your new password below."
              : "This reset link has expired or already been used."}
          </p>
        </div>

        {isValid ? (
          <ResetPasswordForm token={token} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{
              padding: "12px 14px",
              background: "var(--red-dim)",
              border: "1px solid rgba(255,77,109,0.2)",
              borderRadius: "8px",
              fontSize: "13px",
              color: "#ffb3c0",
              lineHeight: 1.6,
            }}>
              Reset links expire after 1 hour and can only be used once.
              Request a new one to continue.
            </div>
            <Link href="/auth/forgot-password" className="btn-auth btn-auth-primary" style={{ textDecoration: "none" }}>
              Request new reset link
            </Link>
            <Link href="/auth/signin" className="btn-auth btn-auth-ghost" style={{ textDecoration: "none" }}>
              Back to sign in
            </Link>
          </div>
        )}
      </div>

      <p className="auth-footer-note">
        Remembered it? <Link href="/auth/signin">Sign in</Link>
      </p>
    </div>
  );
}