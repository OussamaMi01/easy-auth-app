// src/app/(auth)/reset-password/[token]/reset-password-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Props { token: string; }

export function ResetPasswordForm({ token }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const reqs = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  const allMet = Object.values(reqs).every(Boolean);
  const mismatch = !!password && !!confirm && password !== confirm;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!allMet) { setError("Password doesn't meet all requirements."); return; }
    if (mismatch) { setError("Passwords don't match."); return; }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/confirm-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json() as { success?: boolean; error?: string };

      if (!res.ok || !data.success) {
        setError(data.error ?? "Failed to reset password. Please try again.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      toast.success("Password reset successfully!");
      setTimeout(() => router.push("/auth/signin"), 2000);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "16px 0", textAlign: "center" }}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: "var(--green-dim)", border: "1px solid rgba(0,229,160,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <CheckCircle2 size={24} style={{ color: "var(--green)" }} />
        </div>
        <div>
          <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>
            Password reset!
          </p>
          <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.6 }}>
            Your password has been updated. Redirecting to sign in…
          </p>
        </div>
        <span className="spinner" style={{ borderTopColor: "var(--accent)", borderColor: "var(--border)" }} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={14} className="alert-icon" />
          {error}
        </div>
      )}

      {/* New password */}
      <div className="field">
        <label htmlFor="password" className="field-label">New password</label>
        <div className="input-wrap">
          <span className="input-icon"><Lock size={15} /></span>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="auth-input has-right"
            required
            autoFocus
          />
          <button type="button" className="input-icon-right" onClick={() => setShowPassword(v => !v)}>
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        {/* Requirements */}
        {password.length > 0 && (
          <div className="pw-reqs">
            {[
              { key: "minLength", label: "8+ chars" },
              { key: "hasUpper",  label: "uppercase" },
              { key: "hasNumber", label: "number" },
              { key: "hasSpecial",label: "special char" },
            ].map(({ key, label }) => {
              const ok = reqs[key as keyof typeof reqs];
              return (
                <div key={key} className={`pw-req ${ok ? "pw-req-ok" : "pw-req-no"}`}>
                  <span className={`pw-dot ${ok ? "pw-dot-ok" : "pw-dot-no"}`} />
                  {label}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirm password */}
      <div className="field">
        <label htmlFor="confirm" className="field-label">Confirm new password</label>
        <div className="input-wrap">
          <span className="input-icon"><Lock size={15} /></span>
          <input
            id="confirm"
            type={showConfirm ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            className={`auth-input has-right${mismatch ? " error" : ""}`}
            required
          />
          <button type="button" className="input-icon-right" onClick={() => setShowConfirm(v => !v)}>
            {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {mismatch && (
          <p style={{ fontSize: "12px", color: "var(--red)", fontFamily: "var(--font-mono, monospace)", marginTop: "4px" }}>
            passwords don&apos;t match
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !allMet || mismatch || !confirm}
        className="btn-auth btn-auth-primary"
      >
        {loading ? <><span className="spinner" /> Resetting…</> : "Reset password"}
      </button>
    </form>
  );
}