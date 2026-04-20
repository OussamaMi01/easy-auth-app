// src/app/error.tsx
"use client";

export const dynamic = 'force-dynamic';

import { Suspense } from "react";
import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";

// Create a separate component that uses useSearchParams
function ErrorContent({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  return (
    <div style={{
      minHeight: "100vh", background: "#080b0f",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
    }}>
      <div style={{
        background: "#0e1318", border: "1px solid #1e2830",
        borderRadius: "14px", padding: "40px 32px",
        maxWidth: "420px", width: "100%", textAlign: "center",
      }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
          <AlertCircle size={40} style={{ color: "#ff4d6d" }} />
        </div>
        <h2 style={{
          fontFamily: "var(--font-syne, sans-serif)", fontSize: "18px",
          fontWeight: 800, color: "#e8edf2", marginBottom: "8px",
        }}>
          Something went wrong
        </h2>
        <p style={{ fontSize: "13px", color: "#5a7080", lineHeight: 1.6, marginBottom: "24px" }}>
          An unexpected error occurred. If this keeps happening, please contact support.
        </p>
        {errorParam && (
          <p style={{
            fontSize: "11px", color: "#ff4d6d",
            fontFamily: "monospace", marginBottom: "20px",
          }}>
            Error: {errorParam}
          </p>
        )}
        {error.digest && (
          <p style={{
            fontSize: "11px", color: "#2e3d4a",
            fontFamily: "monospace", marginBottom: "20px",
          }}>
            Error ID: {error.digest}
          </p>
        )}
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button
            onClick={reset}
            style={{
              padding: "9px 20px", borderRadius: "7px", fontSize: "13px",
              fontWeight: 500, background: "#00d4ff", color: "#000",
              border: "none", cursor: "pointer", display: "flex",
              alignItems: "center", gap: "6px",
            }}
          >
            <RefreshCw size={13} /> Try again
          </button>
          <Link href="/" style={{
            padding: "9px 20px", borderRadius: "7px", fontSize: "13px",
            background: "transparent", border: "1px solid #2e3d4a",
            color: "#e8edf2", textDecoration: "none",
          }}>
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to your error tracking service here (e.g. Sentry)
    console.error("[error boundary]", error);
  }, [error]);

  return (
    <Suspense fallback={<div className="auth-bg" style={{ minHeight: "100vh", background: "#080b0f" }} />}>
      <ErrorContent error={error} reset={reset} />
    </Suspense>
  );
}