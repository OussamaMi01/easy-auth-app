// src/app/(auth)/verify-email/verify-code.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import {
  verifyEmailAction,
  sendVerificationEmailAction,
} from "@/lib/auth/email-actions";

interface VerifyCodeProps { email: string; userId: string; }
interface ActionState { success?: boolean; error?: string; }

const RESEND_COOLDOWN = 60;

export function VerifyCode({ email, userId }: VerifyCodeProps) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const formRef = useRef<HTMLFormElement>(null);

  const [code, setCode] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);

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
      updateSession().then(() => { router.push("/auth/setup-totp"); router.refresh(); });
    }
    if (verifyState.error) {
      toast.error(verifyState.error);
      setCode("");
      document.getElementById("code")?.focus();
    }
  }, [verifyState, isRedirecting, router, updateSession]);

  useEffect(() => {
    if (resendState.success) {
      toast.success("Code sent!");
      setCountdown(RESEND_COOLDOWN);
    }
    if (resendState.error) {
      toast.error(resendState.error);
      if (resendState.error.includes("already verified")) {
        updateSession().then(() => router.push("/dashboard"));
      }
    }
    setIsResending(false);
  }, [resendState, router, updateSession]);

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

  const resendLabel = countdown > 0
    ? `resend in ${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, "0")}`
    : "resend code";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <form ref={formRef} action={handleVerifySubmit}>
        <input type="hidden" name="userId" value={userId} />

        <div className="field">
          <label htmlFor="code" className="field-label">8-digit code</label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            required
            maxLength={8}
            value={code}
            onChange={handleCodeChange}
            className="auth-input code-input no-icon"
            placeholder="00000000"
            disabled={isRedirecting}
            style={{ fontSize: "24px", letterSpacing: "0.25em" }}
          />
          <p style={{ fontSize: "11px", color: "var(--muted)", fontFamily: "'DM Mono', monospace", marginTop: "5px" }}>
            auto-submits when all 8 digits entered
          </p>
        </div>

        <button
          type="submit"
          disabled={code.length !== 8 || isRedirecting}
          className="btn-auth btn-auth-primary"
        >
          {isRedirecting ? <><span className="spinner" /> Verifying…</> : "Verify email"}
        </button>
      </form>

      <button
        type="button"
        onClick={handleResend}
        disabled={countdown > 0 || isResending}
        className="btn-auth-text"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", width: "100%" }}
      >
        {isResending && <RefreshCw size={13} style={{ animation: "spin 0.7s linear infinite" }} />}
        {isResending ? "sending…" : resendLabel}
      </button>
    </div>
  );
}