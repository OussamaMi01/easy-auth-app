// src/app/(main)/_components/verificiation-warning.tsx
import { getServerSession } from "@/lib/auth";
import { authOptions } from "@/lib/auth-options";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export async function VerificationWarning() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user || user.emailVerified !== false) return null;

  return (
    <div className="dash-warning">
      <AlertTriangle size={15} className="dash-warning-icon" />
      <div>
        <p className="dash-warning-title">Account verification required</p>
        <p className="dash-warning-desc">
          A verification email has been sent to your address. Verify your account to access all features.
        </p>
      </div>
      <Link href="/verify-email" className="dash-warning-btn">
        verify →
      </Link>
    </div>
  );
}