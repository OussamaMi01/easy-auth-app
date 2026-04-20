export const dynamic = 'force-dynamic';

// src/app/(main)/dashboard/settings/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Mail, Shield, User, CheckCircle2, XCircle, AlertTriangle, Key, Calendar } from "lucide-react";
import { env } from "@/env";
import { getServerSession } from "@/lib/auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/server/db";
import { User as UserModel } from "@/server/db/model";
import { VerifyCard } from "@/components/settings/verify-card";
import { ProfileCard } from "@/components/settings/profile-card";
import { SecurityCard } from "@/components/settings/security-card";
import { DisableTotpForm } from "./disable-totp-form";
import { RegenerateBackupCodesForm } from "./regenerate-backup-codes-form";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Account Settings",
  description: "Manage your account settings and security",
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

export default async function SettingsPage() {
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
  };

  try {
    await connectDB();
    const userDoc = await UserModel.findById(session.user.id).lean();
    if (!userDoc) redirect("/auth/signin");
    user = {
      _id: userDoc._id.toString(),
      email: userDoc.email,
      emailVerified: userDoc.emailVerified,
      totpEnabled: userDoc.totpEnabled,
      name: userDoc.name,
      createdAt: userDoc.createdAt,
    };
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    console.error("[settings] DB error:", error);
    redirect("/auth/signin");
  }

  const days = user.createdAt
    ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86_400_000)
    : 0;

  return (
    <>
      {/* Page header */}
      <div style={{ marginBottom: "28px" }}>
        <p className="d-section-label">// settings</p>
        <h1 className="d-page-title">Account Settings</h1>
        <p className="d-page-sub">Manage your account preferences and security</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px", alignItems: "start" }}>

        {/* ── Main column ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Email Verification */}
          <SCard
            icon={<Mail size={15} style={{ color: "var(--accent)" }} />}
            iconStyle={{ background: "var(--accent-dim)", border: "1px solid rgba(0,212,255,0.12)" }}
            title="Email Verification"
            desc="Verify your email address to secure your account"
            badge={user.emailVerified
              ? <span className="badge badge-green"><CheckCircle2 size={10} /> verified</span>
              : <span className="badge badge-amber"><XCircle size={10} /> pending</span>}
          >
            <VerifyCard email={user.email} emailVerified={user.emailVerified} userId={user._id} />
          </SCard>

          {/* Profile */}
          <SCard
            icon={<User size={15} style={{ color: "#a78bfa" }} />}
            iconStyle={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.15)" }}
            title="Profile Information"
            desc="Update your personal details"
          >
            <ProfileCard name={user.name || ""} email={user.email} userId={user._id} createdAt={user.createdAt || new Date()} />
          </SCard>

          {/* Security / password */}
          <SCard
            icon={<Shield size={15} style={{ color: "var(--red)" }} />}
            iconStyle={{ background: "var(--red-dim)", border: "1px solid rgba(255,77,109,0.15)" }}
            title="Password"
            desc="Change your account password"
          >
            <SecurityCard email={user.email} emailVerified={user.emailVerified} userId={user._id} />
          </SCard>

          {/* TOTP / 2FA */}
          <div className="d-card">
            <div className="d-card-header">
              <div className="d-card-icon" style={{ background: "var(--green-dim)", border: "1px solid rgba(0,229,160,0.15)" }}>
                <Shield size={15} style={{ color: "var(--green)" }} />
              </div>
              <div style={{ flex: 1 }}>
                <p className="d-card-title">Two-Factor Authentication</p>
                <p className="d-card-subtitle">TOTP via Google Authenticator or Authy</p>
              </div>
              <span className={`badge ${user.totpEnabled ? "badge-green" : "badge-amber"}`}>
                {user.totpEnabled
                  ? <><CheckCircle2 size={10} /> enabled</>
                  : <><XCircle size={10} /> not set</>}
              </span>
            </div>

            <div className="d-card-body" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {user.totpEnabled ? (
                <>
                  {/* Backup codes */}
                  <div style={{
                    padding: "16px",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Key size={13} style={{ color: "var(--muted)" }} />
                      <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)" }}>Backup Codes</p>
                    </div>
                    <p style={{ fontSize: "12px", color: "var(--muted)", lineHeight: 1.55 }}>
                      Generate a fresh set of backup codes. Your existing codes will be invalidated immediately.
                    </p>
                    <RegenerateBackupCodesForm />
                  </div>

                  {/* Disable TOTP */}
                  <div style={{
                    padding: "16px",
                    background: "var(--red-dim)",
                    border: "1px solid rgba(255,77,109,0.2)",
                    borderRadius: "10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <AlertTriangle size={13} style={{ color: "var(--red)" }} />
                      <p style={{ fontSize: "13px", fontWeight: 500, color: "#ffb3c0" }}>Disable Two-Factor Authentication</p>
                    </div>
                    <p style={{ fontSize: "12px", color: "var(--muted)", lineHeight: 1.55 }}>
                      This removes TOTP protection. You will be required to set it up again on next login.
                      Enter your current TOTP code to confirm.
                    </p>
                    <DisableTotpForm />
                  </div>
                </>
              ) : (
                <div style={{
                  padding: "16px",
                  background: "var(--accent-dim)",
                  border: "1px solid rgba(0,212,255,0.15)",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                }}>
                  <Shield size={15} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--accent)", marginBottom: "4px" }}>
                      Two-factor authentication is not set up
                    </p>
                    <p style={{ fontSize: "12px", color: "var(--muted)", lineHeight: 1.55, marginBottom: "12px" }}>
                      TOTP is required for all accounts. Set it up now to protect your account.
                    </p>
                    <Link href="/setup-totp" style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      padding: "7px 16px", borderRadius: "7px",
                      background: "var(--accent)", color: "#000",
                      fontSize: "12px", fontWeight: 500, textDecoration: "none",
                      transition: "opacity 0.15s",
                    }}>
                      <Shield size={12} />
                      Set Up TOTP Now
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Account Status */}
          <div className="d-card">
            <div className="d-card-header">
              <div className="d-card-icon" style={{ background: "var(--surface-2)", border: "1px solid var(--border-bright)" }}>
                <User size={14} style={{ color: "var(--muted)" }} />
              </div>
              <div>
                <p className="d-card-title">Account Status</p>
                <p className="d-card-subtitle">Current state</p>
              </div>
            </div>
            <div className="d-card-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <SidebarStatus label="Email" status={user.emailVerified} activeLabel="Verified" inactiveLabel="Pending" />
              <SidebarStatus label="Two-Factor Auth" status={user.totpEnabled} activeLabel="Enabled" inactiveLabel="Not set" />
              <div style={{ paddingTop: "8px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "8px" }}>
                <SidebarRow label="Created" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"} />
                <SidebarRow label="Member for" value={`${days} days`} />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="d-card">
            <div className="d-card-header">
              <div className="d-card-icon" style={{ background: "var(--surface-2)", border: "1px solid var(--border-bright)" }}>
                <Calendar size={14} style={{ color: "var(--muted)" }} />
              </div>
              <div>
                <p className="d-card-title">Quick Actions</p>
                <p className="d-card-subtitle">Common tasks</p>
              </div>
            </div>
            <div className="d-card-body" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Link href="/dashboard" className="d-action">
                <User size={13} style={{ color: "var(--muted)" }} /> Go to Dashboard
              </Link>
              {!user.emailVerified && (
                <Link href="/auth/verify-email" className="d-action highlight">
                  <Mail size={13} /> Verify Email
                </Link>
              )}
              {!user.totpEnabled && (
                <Link href="/auth/setup-totp" className="d-action highlight">
                  <Shield size={13} /> Set Up 2FA
                </Link>
              )}
              <Link href="/api/auth/signout" className="d-action">
                <Shield size={13} style={{ color: "var(--muted)" }} /> Sign Out
              </Link>
            </div>
          </div>

          {/* Security Tips */}
          <div className="d-card">
            <div className="d-card-header">
              <div className="d-card-icon" style={{ background: "var(--green-dim)", border: "1px solid rgba(0,229,160,0.15)" }}>
                <CheckCircle2 size={14} style={{ color: "var(--green)" }} />
              </div>
              <div>
                <p className="d-card-title">Security Tips</p>
                <p className="d-card-subtitle">Best practices</p>
              </div>
            </div>
            <div className="d-card-body">
              <ul className="d-tips">
                {[
                  "Use a strong, unique password",
                  "Keep your email verified",
                  "Always enable two-factor auth",
                  "Never share your credentials",
                  "Sign out from shared devices",
                ].map((tip) => (
                  <li key={tip}><span className="d-tips-dot" />{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SCard({
  icon, iconStyle, title, desc, badge, children,
}: {
  icon: React.ReactNode;
  iconStyle: React.CSSProperties;
  title: string;
  desc: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="d-card">
      <div className="d-card-header">
        <div className="d-card-icon" style={iconStyle}>{icon}</div>
        <div style={{ flex: 1 }}>
          <p className="d-card-title">{title}</p>
          <p className="d-card-subtitle">{desc}</p>
        </div>
        {badge}
      </div>
      <div className="d-card-body">{children}</div>
    </div>
  );
}

function SidebarStatus({
  label, status, activeLabel, inactiveLabel,
}: {
  label: string;
  status: boolean;
  activeLabel: string;
  inactiveLabel: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: "12px", color: "var(--muted)" }}>{label}</span>
      <span className={`badge ${status ? "badge-green" : "badge-amber"}`}>
        {status ? <CheckCircle2 size={9} /> : <XCircle size={9} />}
        {status ? activeLabel : inactiveLabel}
      </span>
    </div>
  );
}

function SidebarRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: "12px", color: "var(--muted)" }}>{label}</span>
      <span style={{ fontSize: "12px", color: "var(--text)" }}>{value}</span>
    </div>
  );
}