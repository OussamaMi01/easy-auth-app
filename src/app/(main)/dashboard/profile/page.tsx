// src/app/(main)/dashboard/profile/page.tsx

export const dynamic = 'force-dynamic';

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { User, Trash2, Shield, Mail, CheckCircle2, XCircle } from "lucide-react";
import { env } from "@/env";
import { getServerSession } from "@/lib/auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/server/db";
import { User as UserModel } from "@/server/db/model";
import { ProfileCard } from "@/components/settings/profile-card";
import { DeleteAccountForm } from "./delete-account-form";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Profile",
  description: "Manage your profile information",
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

export default async function ProfilePage() {
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
    image?: string;
    createdAt?: Date;
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
      image: doc.image,
      createdAt: doc.createdAt,
    };
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    redirect("/auth/signin");
  }

  const days = user.createdAt
    ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86_400_000)
    : 0;

  return (
    <>
      <div style={{ marginBottom: "28px" }}>
        <p className="d-section-label">// profile</p>
        <h1 className="d-page-title">Your Profile</h1>
        <p className="d-page-sub">Manage your personal information and account</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px", alignItems: "start" }}>

        {/* ── Main column ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Profile card */}
          <div className="d-card">
            <div className="d-card-header">
              <div className="d-card-icon" style={{ background: "var(--accent-dim)", border: "1px solid rgba(0,212,255,0.12)" }}>
                <User size={15} style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <p className="d-card-title">Profile Information</p>
                <p className="d-card-subtitle">Update your name, email, and avatar</p>
              </div>
            </div>
            <div className="d-card-body">
              <ProfileCard
                name={user.name || ""}
                email={user.email}
                userId={user._id}
                createdAt={user.createdAt || new Date()}
              />
            </div>
          </div>

          {/* Delete account — danger zone */}
          <div className="d-card" style={{ border: "1px solid rgba(255,77,109,0.25)" }}>
            <div className="d-card-header" style={{ borderColor: "rgba(255,77,109,0.15)" }}>
              <div className="d-card-icon" style={{ background: "var(--red-dim)", border: "1px solid rgba(255,77,109,0.2)" }}>
                <Trash2 size={15} style={{ color: "var(--red)" }} />
              </div>
              <div>
                <p className="d-card-title" style={{ color: "#ffb3c0" }}>Delete Account</p>
                <p className="d-card-subtitle">Permanently remove your account and all data</p>
              </div>
            </div>
            <div className="d-card-body">
              <div style={{ padding: "12px 14px", background: "var(--red-dim)", border: "1px solid rgba(255,77,109,0.18)", borderRadius: "8px", marginBottom: "16px" }}>
                <p style={{ fontSize: "12px", color: "#ffb3c0", lineHeight: 1.6 }}>
                  This action is <strong>permanent and irreversible</strong>. All your data, sessions,
                  and settings will be deleted immediately. You cannot undo this.
                </p>
              </div>
              <DeleteAccountForm />
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Account overview */}
          <div className="d-card">
            <div className="d-card-header">
              <div className="d-card-icon" style={{ background: "var(--surface-2)", border: "1px solid var(--border-bright)" }}>
                <User size={14} style={{ color: "var(--muted)" }} />
              </div>
              <div>
                <p className="d-card-title">Account Overview</p>
                <p className="d-card-subtitle">Current status</p>
              </div>
            </div>
            <div className="d-card-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <SidebarRow label="Name" value={user.name || "Not set"} />
              <SidebarRow label="Email" value={user.email} />
              <SidebarStatusRow label="Email" status={user.emailVerified} activeLabel="Verified" inactiveLabel="Pending" />
              <SidebarStatusRow label="2FA" status={user.totpEnabled} activeLabel="Enabled" inactiveLabel="Not set" />
              <div style={{ paddingTop: "8px", borderTop: "1px solid var(--border)" }}>
                <SidebarRow label="Member for" value={`${days} days`} />
                <div style={{ marginTop: "8px" }}>
                  <SidebarRow label="Joined" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="d-card">
            <div className="d-card-header">
              <div className="d-card-icon" style={{ background: "var(--surface-2)", border: "1px solid var(--border-bright)" }}>
                <Shield size={14} style={{ color: "var(--muted)" }} />
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
              <Link href="/dashboard/security" className="d-action">
                <Shield size={13} style={{ color: "var(--muted)" }} /> Security
              </Link>
              <Link href="/dashboard/settings" className="d-action">
                <Mail size={13} style={{ color: "var(--muted)" }} /> Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SidebarRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: "12px", color: "var(--muted)" }}>{label}</span>
      <span style={{ fontSize: "12px", color: "var(--text)", maxWidth: "160px", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );
}

function SidebarStatusRow({ label, status, activeLabel, inactiveLabel }: { label: string; status: boolean; activeLabel: string; inactiveLabel: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: "12px", color: "var(--muted)" }}>{label}</span>
      <span className={`badge ${status ? "badge-green" : "badge-amber"}`} style={{ fontSize: "10px" }}>
        {status ? <CheckCircle2 size={9} /> : <XCircle size={9} />}
        {status ? activeLabel : inactiveLabel}
      </span>
    </div>
  );
}