// src/components/settings/verify-card.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, RefreshCw, Mail } from "lucide-react";
import {
  verifyEmailAction,
  sendVerificationEmailAction,
} from "@/lib/auth/email-actions";

interface VerifyCardProps {
  email: string;
  emailVerified: boolean;
  userId: string;
}

interface ActionState { success?: boolean; error?: string; }

const RESEND_COOLDOWN = 60;

export function VerifyCard({ email, emailVerified, userId }: VerifyCardProps) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const formRef = useRef<HTMLFormElement>(null);

  const [code, setCode] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [verifyState, verifyAction] = useFormState<ActionState, FormData>(verifyEmailAction, {});
  const [resendState, resendAction] = useFormState<ActionState, FormData>(sendVerificationEmailAction, {});

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  useEffect(() => {
    if (verifyState.success && !isRedirecting) {
      setIsRedirecting(true);
      toast.success("Email verified!");
      updateSession().then(() => { router.refresh(); setIsRedirecting(false); setShowForm(false); });
    }
    if (verifyState.error) {
      toast.error(verifyState.error);
      setCode("");
    }
  }, [verifyState, isRedirecting, router, updateSession]);

  useEffect(() => {
    if (resendState.success) {
      toast.success("Verification code sent!");
      setCountdown(RESEND_COOLDOWN);
      setShowForm(true);
    }
    if (resendState.error) toast.error(resendState.error);
    setIsResending(false);
  }, [resendState]);

  function handleCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\D/g, "").slice(0, 8);
    setCode(value);
    if (value.length === 8) setTimeout(() => formRef.current?.requestSubmit(), 80);
  }

  function handleVerifySubmit(formData: FormData) {
    formData.set("code", code);
    verifyAction(formData);
  }

  function handleResend() {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    const fd = new FormData();
    fd.append("email", email);
    resendAction(fd);
  }

  if (emailVerified) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", background: "var(--green-dim)", border: "1px solid rgba(0,229,160,0.2)", borderRadius: "8px" }}>
        <CheckCircle2 size={15} style={{ color: "var(--green)", flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--green)" }}>Email verified</p>
          <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "1px" }}>{email}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", background: "var(--amber-dim)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "8px" }}>
        <Mail size={15} style={{ color: "var(--amber)", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: "13px", fontWeight: 500, color: "#fcd34d" }}>Email not verified</p>
          <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "1px" }}>{email}</p>
        </div>
        <button
          type="button"
          onClick={handleResend}
          disabled={countdown > 0 || isResending}
          style={{
            padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: 500,
            background: "var(--accent)", color: "#000", border: "none", cursor: "pointer",
            opacity: countdown > 0 || isResending ? 0.5 : 1, display: "flex", alignItems: "center", gap: "6px",
            flexShrink: 0,
          }}
        >
          {isResending && <RefreshCw size={11} style={{ animation: "spin 0.7s linear infinite" }} />}
          {countdown > 0 ? `${countdown}s` : isResending ? "Sending…" : "Send code"}
        </button>
      </div>

      {showForm && (
        <form ref={formRef} action={handleVerifySubmit}>
          <input type="hidden" name="userId" value={userId} />
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              maxLength={8}
              value={code}
              onChange={handleCodeChange}
              placeholder="00000000"
              disabled={isRedirecting}
              className="auth-input no-icon code-input"
              style={{ flex: 1, fontSize: "18px", letterSpacing: "0.25em" }}
            />
            <button
              type="submit"
              disabled={code.length !== 8 || isRedirecting}
              style={{
                padding: "0 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 500,
                background: "var(--accent)", color: "#000", border: "none", cursor: "pointer",
                opacity: code.length !== 8 || isRedirecting ? 0.45 : 1, flexShrink: 0,
              }}
            >
              {isRedirecting ? "…" : "Verify"}
            </button>
          </div>
          <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "5px", fontFamily: "var(--font-mono, monospace)" }}>
            8-digit code from your inbox — auto-submits when complete
          </p>
        </form>
      )}
    </div>
  );
}