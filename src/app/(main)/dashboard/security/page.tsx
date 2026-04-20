// src/app/(main)/dashboard/security/page.tsx
export const dynamic = 'force-dynamic';

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Shield, Key, Download, CheckCircle2, XCircle, Mail, User } from "lucide-react";
import { env } from "@/env";
import { getServerSession } from "@/lib/auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/server/db";
import { User as UserModel } from "@/server/db/model";
import { SecurityCard } from "@/components/settings/security-card";
import { RevokeSessionsForm } from "./revoke-sessions-form";
import { DownloadDataButton } from "./download-data-button";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Security",
  description: "Manage your account security",
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

export default async function SecurityPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/signin");
  if (!session.user.emailVerified) redirect("/auth/verify-email");
  if (!session.user.totpEnabled) redirect("/auth/setup-totp");
  if (!session.user.mfaPassed) redirect("/auth/mfa-challenge");

  let user: {
    _id: string;
    email: string;
    emailVerified: boolean;
    totpEnabled: boolean;
    name?: string;
    createdAt?: Date;
    updatedAt?: Date;
  };

  try {
    await connectDB();
    const doc = await UserModel.findById(session.user.id).lean();
    if (!doc) redirect("/auth/signin");
    user = {
      _id: doc._id.toString(),
      email: doc.email,
      emailVerified: doc.emailVerified,
      totpEnabled: doc.totpEnabled,
      name: doc.name,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    redirect("/auth/signin");
  }

  return (
    <>
      <div style={{ marginBottom: "28px" }}>
      
        <h1 className="d-page-title">Security</h1>
        <p className="d-page-sub">Manage your password, sessions, and account data</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px", alignItems: "start" }}>

        {/* ── Main column ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Change password */}
          <div className="d-card">
            <div className="d-card-header">
              <div className="d-card-icon" style={{ background: "var(--accent-dim)", border: "1px solid rgba(0,212,255,0.12)" }}>
                <Key size={15} style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <p className="d-card-title">Change Password</p>
                <p className="d-card-subtitle">Update your account password</p>
              </div>
            </div>
            <div className="d-card-body">
              <SecurityCard email={user.email} emailVerified={user.emailVerified} userId={user._id} />
            </div>
          </div>

          {/* Active sessions */}
          <div className="d-card">
            <div className="d-card-header">
              <div className="d-card-icon" style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.15)" }}>
                <Shield size={15} style={{ color: "#a78bfa" }} />
              </div>
              <div style={{ flex: 1 }}>
                <p className="d-card-title">Active Sessions</p>
                <p className="d-card-subtitle">Devices currently signed in to your account</p>
              </div>
            </div>
            <div className="d-card-body" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Current session */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 14px", background: "var(--surface-2)",
                border: "1px solid var(--border)", borderRadius: "9px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: "8px",
                    background: "var(--green-dim)", border: "1px solid rgba(0,229,160,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Shield size={14} style={{ color: "var(--green)" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)" }}>Current session</p>
                    <p style={{ fontSize: "11px", color: "var(--muted)", fontFamily: "var(--font-mono, monospace)", marginTop: "2px" }}>
                      {user.email} · active now
                    </p>
                  </div>
                </div>
                <span className="badge badge-green"><CheckCircle2 size={9} /> active</span>
              </div>

              <p style={{ fontSize: "12px", color: "var(--muted)", lineHeight: 1.6 }}>
                NextAuth v4 uses stateless JWT sessions — there is one active session per sign-in.
                Revoking signs you out of all devices immediately.
              </p>

              <RevokeSessionsForm />
            </div>
          </div>

          {/* Download data */}
          <div className="d-card">
            <div className="d-card-header">
              <div className="d-card-icon" style={{ background: "var(--green-dim)", border: "1px solid rgba(0,229,160,0.15)" }}>
                <Download size={15} style={{ color: "var(--green)" }} />
              </div>
              <div>
                <p className="d-card-title">Download Account Data</p>
                <p className="d-card-subtitle">Export a copy of your account information</p>
              </div>
            </div>
            <div className="d-card-body" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <p style={{ fontSize: "12px", color: "var(--muted)", lineHeight: 1.65 }}>
                Download a JSON file containing your account data — name, email, verification status,
                and creation date. Passwords and security secrets are never included.
              </p>
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px",
                padding: "12px", background: "var(--surface-2)",
                border: "1px solid var(--border)", borderRadius: "9px",
              }}>
                {[
                  { label: "id", value: user._id.slice(0, 16) + "…" },
                  { label: "email", value: user.email },
                  { label: "verified", value: user.emailVerified ? "yes" : "no" },
                  { label: "2fa", value: user.totpEnabled ? "enabled" : "not set" },
                  { label: "created", value: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A" },
                  { label: "updated", value: user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "N/A" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p style={{ fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", fontFamily: "var(--font-mono, monospace)", marginBottom: "3px" }}>{label}</p>
                    <p style={{ fontSize: "12px", color: "var(--text)", fontFamily: "var(--font-mono, monospace)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</p>
                  </div>
                ))}
              </div>
              <DownloadDataButton userId={user._id} email={user.email} name={user.name} emailVerified={user.emailVerified} totpEnabled={user.totpEnabled} createdAt={user.createdAt} updatedAt={user.updatedAt} />
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Security status */}
          <div className="d-card">
            <div className="d-card-header">
              <div className="d-card-icon" style={{ background: "var(--surface-2)", border: "1px solid var(--border-bright)" }}>
                <Shield size={14} style={{ color: "var(--muted)" }} />
              </div>
              <div>
                <p className="d-card-title">Security Status</p>
                <p className="d-card-subtitle">Protection overview</p>
              </div>
            </div>
            <div className="d-card-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Email Verified", status: user.emailVerified, active: "Verified", inactive: "Pending" },
                { label: "Two-Factor Auth", status: user.totpEnabled, active: "Enabled", inactive: "Not set" },
                { label: "MFA Passed", status: session.user.mfaPassed ?? false, active: "This session", inactive: "No" },
              ].map(({ label, status, active, inactive }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", color: "var(--muted)" }}>{label}</span>
                  <span className={`badge ${status ? "badge-green" : "badge-amber"}`} style={{ fontSize: "10px" }}>
                    {status ? <CheckCircle2 size={9} /> : <XCircle size={9} />}
                    {status ? active : inactive}
                  </span>
                </div>
              ))}

              {/* Score bar */}
              <div style={{ paddingTop: "8px", borderTop: "1px solid var(--border)" }}>
                {(() => {
                  const score = (user.emailVerified ? 40 : 0) + (user.totpEnabled ? 60 : 0);
                  const color = score >= 100 ? "var(--green)" : score >= 40 ? "var(--amber)" : "var(--red)";
                  return (
                    <div className="score-bar-wrap">
                      <div className="score-bar-top">
                        <span className="score-bar-label">security score</span>
                        <span className="score-bar-val" style={{ color }}>{score}%</span>
                      </div>
                      <div className="score-bar-track">
                        <div className="score-bar-fill" style={{ width: `${score}%`, background: color }} />
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="d-card">
            <div className="d-card-header">
              <div className="d-card-icon" style={{ background: "var(--surface-2)", border: "1px solid var(--border-bright)" }}>
                <Key size={14} style={{ color: "var(--muted)" }} />
              </div>
              <div>
                <p className="d-card-title">Quick Links</p>
                <p className="d-card-subtitle">Related pages</p>
              </div>
            </div>
            <div className="d-card-body" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Link href="/dashboard" className="d-action">
                <User size={13} style={{ color: "var(--muted)" }} /> Dashboard
              </Link>
              <Link href="/dashboard/profile" className="d-action">
                <User size={13} style={{ color: "var(--muted)" }} /> Profile
              </Link>
              <Link href="/dashboard/settings" className="d-action">
                <Mail size={13} style={{ color: "var(--muted)" }} /> Settings
              </Link>
              <Link href="/dashboard/settings#totp" className="d-action">
                <Shield size={13} style={{ color: "var(--muted)" }} /> Manage 2FA
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}