// src/app/(auth)/forgot-password/send-reset-email.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import Link from "next/link";

export function SendResetEmail() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Failed to send reset email. Please try again.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success state ────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Success indicator */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: "12px", padding: "24px 16px", textAlign: "center",
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: "var(--green-dim)", border: "1px solid rgba(0,229,160,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <CheckCircle2 size={24} style={{ color: "var(--green)" }} />
          </div>
          <div>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>
              Check your inbox
            </p>
            <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.6 }}>
              We sent a reset link to{" "}
              <strong style={{ color: "var(--accent)", fontWeight: 500 }}>{email}</strong>
            </p>
          </div>
        </div>

        {/* Info box */}
        <div style={{
          display: "flex", alignItems: "flex-start", gap: "10px",
          padding: "12px 14px", background: "var(--accent-dim)",
          border: "1px solid rgba(0,212,255,0.12)", borderRadius: "8px",
        }}>
          <Mail size={13} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--accent)", marginBottom: "3px" }}>
              Didn&apos;t receive it?
            </p>
            <p style={{ fontSize: "12px", color: "var(--muted)", lineHeight: 1.55 }}>
              Check your spam folder or{" "}
              <button
                onClick={() => setSuccess(false)}
                style={{ color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontSize: "12px", padding: 0, textDecoration: "underline" }}
              >
                try again
              </button>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push("/signin")}
          className="btn-auth btn-auth-primary"
        >
          Back to Sign In
        </button>

        <p style={{ textAlign: "center", fontSize: "11px", color: "var(--muted)", fontFamily: "var(--font-mono, monospace)" }}>
          the reset link expires in 1 hour
        </p>
      </div>
    );
  }

  // ── Form state ───────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={14} className="alert-icon" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div className="field">
          <label htmlFor="email" className="field-label">Email address</label>
          <div className="input-wrap">
            <span className="input-icon"><Mail size={15} /></span>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="auth-input"
              disabled={loading}
            />
          </div>
        </div>

        {/* Security note */}
        <div style={{
          display: "flex", alignItems: "flex-start", gap: "10px",
          padding: "10px 12px", background: "var(--surface-2)",
          border: "1px solid var(--border)", borderRadius: "8px",
        }}>
          <span style={{
            width: 18, height: 18, borderRadius: "50%",
            background: "var(--accent-dim)", border: "1px solid rgba(0,212,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, fontSize: "10px", color: "var(--accent)", fontWeight: 700,
            fontFamily: "var(--font-mono, monospace)",
          }}>i</span>
          <p style={{ fontSize: "12px", color: "var(--muted)", lineHeight: 1.55 }}>
            <span style={{ color: "var(--text)", fontWeight: 500 }}>Security: </span>
            the reset link expires in 1 hour. Never share it with anyone.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-auth btn-auth-primary"
        >
          {loading
            ? <><span className="spinner" /> Sending…</>
            : "Send reset link"}
        </button>
      </form>

      <div className="auth-divider"><span>or</span></div>

      <Link
        href="/auth/signup"
        className="btn-auth btn-auth-ghost"
        style={{ textDecoration: "none", textAlign: "center" }}
      >
        Create new account
      </Link>
    </div>
  );
}