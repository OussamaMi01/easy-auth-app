// src/app/(auth)/verify-email/page.tsx

export const dynamic = 'force-dynamic';

import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { authOptions } from "@/lib/auth-options";
import { VerifyCode } from "./verify-code";
import { connectDB } from "@/server/db";
import { User } from "@/server/db/model";
import { Shield, Mail } from "lucide-react";
import Link from "next/link";
import { APP_TITLE } from "@/lib/constants";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email address to continue.",
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

export default async function VerifyEmailPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.email) redirect("/auth/signin");
  const { id, email } = session.user;

  try {
    await connectDB();
    const user = await User.findById(id).lean();
    if (!user) redirect("/auth/signin");
    if (user.emailVerified) redirect("/dashboard");
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    redirect("/auth/signin");
  }

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
            <Mail size={18} />
          </div>
          <h1 className="auth-title">Check your inbox</h1>
          <p className="auth-subtitle">
            We sent an 8-digit code to{" "}
            <strong>{email}</strong>.
            <br />
            Can&apos;t find it? Check your spam folder.
          </p>
        </div>

        <VerifyCode email={email} userId={id} />
      </div>
    </div>
  );
}