
// src/app/(main)/dashboard/page.tsx

export const dynamic = 'force-dynamic';

import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { Shield, User, Mail, Calendar, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { env } from "@/env";
import { getServerSession } from "@/lib/auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/server/db";
import { User as UserModel } from "@/server/db/model";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Dashboard",
  description: "Your security-driven account overview",
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

function calcSecurityScore(emailVerified: boolean, totpEnabled: boolean) {
  return (emailVerified ? 40 : 0) + (totpEnabled ? 60 : 0);
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/signin");

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
    const doc = await UserModel.findById(session.user.id).lean();
    if (!doc) redirect("/api/auth/signout");
    user = {
      _id: doc._id.toString(),
      email: doc.email,
      emailVerified: doc.emailVerified,
      totpEnabled: doc.totpEnabled,
      name: doc.name,
      createdAt: doc.createdAt,
    };
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    console.error("Dashboard DB error:", error);
    return <DashboardError />;
  }

  const days = user.createdAt
    ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86_400_000)
    : 0;

  const score = calcSecurityScore(user.emailVerified, user.totpEnabled);
  const scoreColor = score >= 100 ? "#00e5a0" : score >= 40 ? "#f59e0b" : "#ff4d6d";

  return (
    <>
      {/* Page header */}
      <div style={{ marginBottom: "28px" }}>
       
        <h1 className="d-page-title">Dashboard</h1>
        <p className="d-page-sub">Welcome back, {user.name || user.email}</p>
      </div>

      {/* Security alert banner */}
      {score < 100 && (
        <div className="d-alert-banner">
          <AlertCircle size={15} style={{ color: "#f59e0b", flexShrink: 0, marginTop: 1 }} />
          <div className="d-alert-text">
            <p className="d-alert-title">Account security incomplete</p>
            <div className="d-alert-items">
              {!user.emailVerified && <span>→ verify your email address</span>}
              {!user.totpEnabled && <span>→ set up two-factor authentication</span>}
            </div>
          </div>
          <Link href="/dashboard/settings" className="d-alert-link">
            fix now →
          </Link>
        </div>
      )}

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>

        {/* Top row: profile + security */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>

          {/* Profile card */}
          <div className="d-card">
            <div className="d-card-header">
              <div className="d-card-icon" style={{ background: "rgba(0,212,255,0.07)", border: "1px solid rgba(0,212,255,0.12)" }}>
                <User size={16} style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <p className="d-card-title">Profile</p>
                <p className="d-card-subtitle">Account information</p>
              </div>
            </div>
            <div className="d-card-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {[
                  { label: "user id", value: user._id, mono: true },
                  { label: "created", value: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A" },
                  { label: "name", value: user.name || "not set" },
                  { label: "email", value: user.email },
                ].map(({ label, value, mono }) => (
                  <div key={label}>
                    <p className="d-field-label">{label}</p>
                    <div className={`d-field-value${mono ? " mono" : ""}`}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Security card */}
          <div className="d-card">
            <div className="d-card-header">
              <div className="d-card-icon" style={{ background: "rgba(255,77,109,0.07)", border: "1px solid rgba(255,77,109,0.15)" }}>
                <Shield size={16} style={{ color: "var(--red)" }} />
              </div>
              <div>
                <p className="d-card-title">Security</p>
                <p className="d-card-subtitle">Account protection status</p>
              </div>
            </div>
            <div className="d-card-body" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

              {/* Score bar */}
              <div className="score-bar-wrap">
                <div className="score-bar-top">
                  <span className="score-bar-label">security score</span>
                  <span className="score-bar-val" style={{ color: scoreColor }}>{score}%</span>
                </div>
                <div className="score-bar-track">
                  <div className="score-bar-fill" style={{ width: `${score}%`, background: scoreColor }} />
                </div>
              </div>

              {/* Email row */}
              <div className="d-sec-row">
                <div className="d-sec-row-left">
                  <Mail size={14} className="d-sec-row-icon" />
                  <div>
                    <p className="d-sec-row-label">Email Verification</p>
                    <p className="d-sec-row-desc">Verify your email for security</p>
                  </div>
                </div>
                <div className="d-sec-row-right">
                  <span className={`badge ${user.emailVerified ? "badge-green" : "badge-amber"}`}>
                    {user.emailVerified
                      ? <><CheckCircle2 size={10} /> verified</>
                      : <><XCircle size={10} /> pending</>}
                  </span>
                  {!user.emailVerified && (
                    <Link href="/verify-email" style={{ fontSize: "11px", color: "var(--accent)", fontFamily: "var(--font-mono)", textDecoration: "none", letterSpacing: "0.04em" }}>
                      fix →
                    </Link>
                  )}
                </div>
              </div>

              {/* TOTP row */}
              <div className="d-sec-row">
                <div className="d-sec-row-left">
                  <Shield size={14} className="d-sec-row-icon" />
                  <div>
                    <p className="d-sec-row-label">Two-Factor Auth</p>
                    <p className="d-sec-row-desc">TOTP via Authenticator app</p>
                  </div>
                </div>
                <div className="d-sec-row-right">
                  <span className={`badge ${user.totpEnabled ? "badge-green" : "badge-amber"}`}>
                    {user.totpEnabled
                      ? <><CheckCircle2 size={10} /> enabled</>
                      : <><XCircle size={10} /> not set</>}
                  </span>
                  <Link
                    href={user.totpEnabled ? "/dashboard/settings" : "/setup-totp"}
                    style={{ fontSize: "11px", color: "var(--accent)", fontFamily: "var(--font-mono)", textDecoration: "none", letterSpacing: "0.04em" }}
                  >
                    {user.totpEnabled ? "manage →" : "set up →"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row: stats + actions + tips */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>

          {/* Stats */}
          <div className="d-card">
            <div className="d-card-header">
              <div className="d-card-icon" style={{ background: "var(--accent-dim)", border: "1px solid rgba(0,212,255,0.1)" }}>
                <Calendar size={15} style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <p className="d-card-title">Stats</p>
                <p className="d-card-subtitle">Account metrics</p>
              </div>
            </div>
            <div className="d-card-body">
              <div className="d-stat-row">
                <div className="d-stat-left">
                  <div className="d-stat-icon"><Calendar size={14} /></div>
                  <div>
                    <p className="d-stat-label">Days active</p>
                    <p className="d-stat-sub">member since</p>
                  </div>
                </div>
                <span className="d-stat-val">{days}</span>
              </div>
              <div className="d-stat-row" style={{ marginTop: "12px" }}>
                <div className="score-bar-wrap">
                  <div className="score-bar-top">
                    <span className="score-bar-label">score</span>
                    <span className="score-bar-val" style={{ color: scoreColor }}>{score}%</span>
                  </div>
                  <div className="score-bar-track">
                    <div className="score-bar-fill" style={{ width: `${score}%`, background: scoreColor }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="d-card">
            <div className="d-card-header">
              <div className="d-card-icon" style={{ background: "var(--surface-2)", border: "1px solid var(--border-bright)" }}>
                <User size={15} style={{ color: "var(--muted)" }} />
              </div>
              <div>
                <p className="d-card-title">Quick Actions</p>
                <p className="d-card-subtitle">Common tasks</p>
              </div>
            </div>
            <div className="d-card-body" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Link href="/dashboard/settings" className="d-action">
                <User size={13} style={{ color: "var(--muted)" }} />
                Account Settings
              </Link>
              {!user.emailVerified && (
                <Link href="/verify-email" className="d-action highlight">
                  <Mail size={13} />
                  Verify Email
                </Link>
              )}
              {!user.totpEnabled && (
                <Link href="/setup-totp" className="d-action highlight">
                  <Shield size={13} />
                  Set Up 2FA
                </Link>
              )}
              <Link href="/api/auth/signout" className="d-action">
                <Shield size={13} style={{ color: "var(--muted)" }} />
                Sign Out
              </Link>
            </div>
          </div>

          {/* Tips */}
          <div className="d-card">
            <div className="d-card-header">
              <div className="d-card-icon" style={{ background: "var(--green-dim)", border: "1px solid rgba(0,229,160,0.15)" }}>
                <CheckCircle2 size={15} style={{ color: "var(--green)" }} />
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
                  "Enable two-factor authentication",
                  "Never share your credentials",
                  "Sign out from shared devices",
                ].map((tip) => (
                  <li key={tip}>
                    <span className="d-tips-dot" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function DashboardError() {
  return (
    <div className="d-error">
      <div className="d-error-card">
        <div className="d-error-icon" style={{ display: "flex", justifyContent: "center" }}>
          <AlertCircle size={40} />
        </div>
        <h2 className="d-error-title">Database Error</h2>
        <p className="d-error-desc">There was an error loading your account. Please try again.</p>
        <div className="d-error-actions">
          <Link href="/dashboard" className="d-btn-sm d-btn-sm-primary">Retry</Link>
          <Link href="/api/auth/signout" className="d-btn-sm d-btn-sm-ghost">Sign Out</Link>
        </div>
      </div>
    </div>
  );
}