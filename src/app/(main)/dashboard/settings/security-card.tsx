// src/components/settings/security-card.tsx
"use client";

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, CheckCircle2 } from "lucide-react";
import { changePasswordAction } from "@/lib/user/user-actions";

interface SecurityCardProps {
  email: string;
  emailVerified: boolean;
  userId: string;
}

interface ActionState { success?: boolean; error?: string; }

export function SecurityCard({ email, emailVerified, userId }: SecurityCardProps) {
  const [state, action] = useFormState<ActionState, FormData>(changePasswordAction, {});
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const reqs = {
    minLength: next.length >= 8,
    hasUpper: /[A-Z]/.test(next),
    hasNumber: /\d/.test(next),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(next),
  };
  const allMet = Object.values(reqs).every(Boolean);
  const mismatch = !!next && !!confirm && next !== confirm;

  useEffect(() => {
    if (state.success) {
      toast.success("Password changed successfully.");
      setCurrent(""); setNext(""); setConfirm("");
    }
    if (state.error) toast.error(state.error);
  }, [state]);

  function handleSubmit(formData: FormData) { action(formData); }

  return (
    <form action={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Current password */}
      <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
        <p style={{ fontSize: "11px", letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--muted)", fontFamily: "var(--font-mono, monospace)" }}>current password</p>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", display: "flex" }}><Lock size={14} /></span>
          <input
            name="currentPassword"
            type={showCurrent ? "text" : "password"}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            placeholder="••••••••"
            className="auth-input has-right"
            required
          />
          <button type="button" onClick={() => setShowCurrent(v => !v)}
            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--muted)", cursor: "pointer", display: "flex" }}>
            {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      {/* New password */}
      <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
        <p style={{ fontSize: "11px", letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--muted)", fontFamily: "var(--font-mono, monospace)" }}>new password</p>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", display: "flex" }}><Lock size={14} /></span>
          <input
            name="newPassword"
            type={showNext ? "text" : "password"}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            placeholder="••••••••"
            className="auth-input has-right"
            required
          />
          <button type="button" onClick={() => setShowNext(v => !v)}
            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--muted)", cursor: "pointer", display: "flex" }}>
            {showNext ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>

        {/* Requirements */}
        {next.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", padding: "10px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "8px" }}>
            {[
              { key: "minLength", label: "8+ chars" },
              { key: "hasUpper",  label: "uppercase" },
              { key: "hasNumber", label: "number" },
              { key: "hasSpecial",label: "special char" },
            ].map(({ key, label }) => {
              const ok = reqs[key as keyof typeof reqs];
              return (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "12px", fontFamily: "var(--font-mono, monospace)", color: ok ? "var(--green)" : "var(--muted)" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: ok ? "var(--green)" : "var(--border-bright)", flexShrink: 0 }} />
                  {label}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirm password */}
      <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
        <p style={{ fontSize: "11px", letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--muted)", fontFamily: "var(--font-mono, monospace)" }}>confirm new password</p>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", display: "flex" }}><Lock size={14} /></span>
          <input
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            className={`auth-input has-right${mismatch ? " error" : ""}`}
            required
          />
          <button type="button" onClick={() => setShowConfirm(v => !v)}
            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--muted)", cursor: "pointer", display: "flex" }}>
            {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        {mismatch && <p style={{ fontSize: "12px", color: "var(--red)", fontFamily: "var(--font-mono, monospace)" }}>passwords don&apos;t match</p>}
      </div>

      <button
        type="submit"
        disabled={!allMet || !current || mismatch}
        style={{
          padding: "11px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: 500,
          background: "var(--accent)", color: "#000", border: "none", cursor: "pointer",
          opacity: (!allMet || !current || mismatch) ? 0.45 : 1, transition: "opacity 0.15s",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
        }}
      >
        <CheckCircle2 size={14} />
        Change Password
      </button>
    </form>
  );
}