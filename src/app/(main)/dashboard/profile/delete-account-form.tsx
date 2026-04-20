// src/app/(main)/dashboard/profile/delete-account-form.tsx
"use client";

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { Trash2, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { deleteAccountAction } from "@/lib/user/user-actions";

interface ActionState { success?: boolean; error?: string; }

export function DeleteAccountForm() {
  const router = useRouter();
  const [state, action] = useFormState<ActionState, FormData>(deleteAccountAction, {});
  const [confirmation, setConfirmation] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (state.success) {
      toast.success("Account deleted.");
      signOut({ callbackUrl: "/" });
    }
    if (state.error) toast.error(state.error);
  }, [state, router]);

  const canSubmit = confirmation === "DELETE" && password.length > 0;

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        style={{
          padding: "10px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 500,
          background: "transparent", border: "1px solid rgba(255,77,109,0.35)",
          color: "var(--red)", cursor: "pointer", display: "flex", alignItems: "center", gap: "7px",
          transition: "background 0.15s",
        }}
      >
        <Trash2 size={13} />
        Delete My Account
      </button>
    );
  }

  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "10px 12px", background: "rgba(255,77,109,0.06)", border: "1px solid rgba(255,77,109,0.18)", borderRadius: "8px" }}>
        <AlertTriangle size={13} style={{ color: "var(--red)", flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: "12px", color: "#ffb3c0", lineHeight: 1.6 }}>
          Type <strong style={{ fontFamily: "var(--font-mono, monospace)" }}>DELETE</strong> and enter your password to permanently delete your account.
        </p>
      </div>

      {/* Confirmation text */}
      <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
        <p style={{ fontSize: "11px", letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--muted)", fontFamily: "var(--font-mono, monospace)" }}>
          type DELETE to confirm
        </p>
        <input
          name="confirmation"
          type="text"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          placeholder="DELETE"
          className="auth-input no-icon"
          style={{ fontFamily: "var(--font-mono, monospace)", letterSpacing: "0.1em" }}
          autoComplete="off"
        />
      </div>

      {/* Password */}
      <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
        <p style={{ fontSize: "11px", letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--muted)", fontFamily: "var(--font-mono, monospace)" }}>
          your password
        </p>
        <div style={{ position: "relative" }}>
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="auth-input no-icon has-right"
            autoComplete="current-password"
          />
          <button type="button" onClick={() => setShowPassword(v => !v)}
            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--muted)", cursor: "pointer", display: "flex" }}>
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <button
          type="button"
          onClick={() => { setExpanded(false); setConfirmation(""); setPassword(""); }}
          style={{
            flex: 1, padding: "10px", borderRadius: "8px", fontSize: "13px",
            background: "transparent", border: "1px solid var(--border-bright)",
            color: "var(--muted)", cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            flex: 1, padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: 500,
            background: canSubmit ? "var(--red)" : "transparent",
            border: `1px solid ${canSubmit ? "var(--red)" : "rgba(255,77,109,0.3)"}`,
            color: canSubmit ? "#fff" : "var(--red)",
            cursor: canSubmit ? "pointer" : "not-allowed",
            opacity: canSubmit ? 1 : 0.5,
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            transition: "all 0.15s",
          }}
        >
          <Trash2 size={13} />
          Delete Account
        </button>
      </div>
    </form>
  );
}