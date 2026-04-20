// src/app/(auth)/mfa-challenge/mfa-form.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { verifyTotpChallengeAction } from "@/lib/totp/totp-actions";

interface ActionState { success?: boolean; error?: string; }

export function MfaForm() {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const formRef = useRef<HTMLFormElement>(null);

  const [code, setCode] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [useBackup, setUseBackup] = useState(false);

  const [state, action] = useFormState<ActionState, FormData>(verifyTotpChallengeAction, {});

  useEffect(() => {
    if (state.success && !isRedirecting) {
      setIsRedirecting(true);
      toast.success("Identity verified!");
      updateSession({ mfaPassed: true }).then(() => {
        router.push("/dashboard");
        router.refresh();
      });
    }
    if (state.error) {
      toast.error(state.error);
      setCode("");
      document.getElementById("mfa-code")?.focus();
    }
  }, [state, isRedirecting, router, updateSession]);

  function handleCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (useBackup) {
      setCode(e.target.value.toUpperCase().slice(0, 11));
    } else {
      const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
      setCode(digits);
      if (digits.length === 6) setTimeout(() => formRef.current?.requestSubmit(), 80);
    }
  }

  function handleSubmit(formData: FormData) {
    formData.set("code", code);
    action(formData);
  }

  const isDisabled = isRedirecting ||
    (!useBackup && code.length !== 6) ||
    (useBackup && code.replace("-", "").length < 10);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <form ref={formRef} action={handleSubmit}>
        <div className="field">
          <label htmlFor="mfa-code" className="field-label">
            {useBackup ? "backup code" : "authenticator code"}
          </label>
          <input
            id="mfa-code"
            type="text"
            inputMode={useBackup ? "text" : "numeric"}
            autoComplete="one-time-code"
            autoFocus
            required
            value={code}
            onChange={handleCodeChange}
            className="auth-input code-input no-icon"
            placeholder={useBackup ? "XXXXX-XXXXX" : "000000"}
            disabled={isRedirecting}
            style={{
              fontSize: useBackup ? "18px" : "28px",
              letterSpacing: useBackup ? "0.15em" : "0.4em",
            }}
          />
          {!useBackup && (
            <p style={{ fontSize: "11px", color: "var(--muted)", fontFamily: "'DM Mono', monospace", marginTop: "5px" }}>
              auto-submits when all 6 digits entered
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isDisabled}
          className="btn-auth btn-auth-primary"
        >
          {isRedirecting ? <><span className="spinner" /> Verifying…</> : "Verify"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => { setUseBackup((v) => !v); setCode(""); }}
        className="btn-auth-text"
        style={{ width: "100%" }}
      >
        {useBackup ? "← use authenticator app" : "use a backup code instead"}
      </button>
    </div>
  );
}