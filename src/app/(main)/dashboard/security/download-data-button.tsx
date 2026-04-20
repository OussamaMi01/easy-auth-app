// src/app/(main)/dashboard/security/download-data-button.tsx
"use client";

import { useState } from "react";
import { Download } from "lucide-react";

interface Props {
  userId: string;
  email: string;
  name?: string;
  emailVerified: boolean;
  totpEnabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export function DownloadDataButton({ userId, email, name, emailVerified, totpEnabled, createdAt, updatedAt }: Props) {
  const [loading, setLoading] = useState(false);

  function handleDownload() {
    setLoading(true);

    const data = {
      exportedAt: new Date().toISOString(),
      account: {
        id: userId,
        email,
        name: name ?? null,
        emailVerified,
        totpEnabled,
        createdAt: createdAt?.toISOString() ?? null,
        updatedAt: updatedAt?.toISOString() ?? null,
      },
      note: "Sensitive fields (password, TOTP secret, backup codes) are never exported.",
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `account-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setTimeout(() => setLoading(false), 600);
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      style={{
        padding: "10px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 500,
        background: "var(--green-dim)", border: "1px solid rgba(0,229,160,0.25)",
        color: "var(--green)", cursor: loading ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", gap: "7px",
        opacity: loading ? 0.6 : 1, transition: "opacity 0.15s",
        alignSelf: "flex-start",
      }}
    >
      <Download size={13} />
      {loading ? "Preparing…" : "Download JSON"}
    </button>
  );
}