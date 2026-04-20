// src/app/(main)/dashboard/security/revoke-sessions-form.tsx
"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { LogOut, AlertTriangle } from "lucide-react";

export function RevokeSessionsForm() {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRevoke() {
    setLoading(true);
    toast.success("All sessions revoked. Signing out…");
    setTimeout(() => signOut({ callbackUrl: "/signin" }), 800);
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        style={{
          padding: "10px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 500,
          background: "transparent", border: "1px solid rgba(255,77,109,0.3)",
          color: "var(--red)", cursor: "pointer",
          display: "flex", alignItems: "center", gap: "7px", transition: "background 0.15s",
        }}
      >
        <LogOut size={13} />
        Revoke All Sessions
      </button>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "10px 12px", background: "var(--red-dim)", border: "1px solid rgba(255,77,109,0.2)", borderRadius: "8px" }}>
        <AlertTriangle size={13} style={{ color: "var(--red)", flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: "12px", color: "#ffb3c0", lineHeight: 1.6 }}>
          This will sign you out of all devices immediately. You will need to sign in again.
        </p>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          style={{
            flex: 1, padding: "9px", borderRadius: "8px", fontSize: "13px",
            background: "transparent", border: "1px solid var(--border-bright)",
            color: "var(--muted)", cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleRevoke}
          disabled={loading}
          style={{
            flex: 1, padding: "9px", borderRadius: "8px", fontSize: "13px", fontWeight: 500,
            background: "var(--red)", border: "none", color: "#fff",
            cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          }}
        >
          <LogOut size={13} />
          {loading ? "Signing out…" : "Confirm Revoke"}
        </button>
      </div>
    </div>
  );
}