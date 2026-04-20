// src/app/(auth)/setup-totp/setup-totp-form.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Copy, Check, Download, ArrowRight } from "lucide-react";
import Image from "next/image";
import { enableTotpAction } from "@/lib/totp/totp-actions";

interface Props { qrCodeUrl: string; secret: string; }
interface ActionState { success?: boolean; error?: string; backupCodes?: string[]; }

export function SetupTotpForm({ qrCodeUrl, secret }: Props) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const formRef = useRef<HTMLFormElement>(null);

  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<"scan" | "verify" | "backup">("scan");
  const [state, action] = useFormState<ActionState, FormData>(enableTotpAction, {});

  useEffect(() => {
    if (state.success && state.backupCodes) {
      setBackupCodes(state.backupCodes);
      setStep("backup");
      toast.success("TOTP activated!");
    }
    if (state.error) {
      toast.error(state.error);
      setCode("");
      document.getElementById("totp-code")?.focus();
    }
  }, [state]);

  function handleCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(digits);
    if (digits.length === 6) setTimeout(() => formRef.current?.requestSubmit(), 80);
  }

  function handleSubmit(formData: FormData) {
    formData.set("code", code);
    action(formData);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([backupCodes.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "backup-codes.txt"; a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDone() {
    await updateSession({ mfaPassed: false });
    router.push("/auth/mfa-challenge");
    router.refresh();
  }

  // ── Backup codes step ──────────────────────────────────────────────────────
  if (step === "backup") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{
          padding: "14px",
          background: "rgba(255,193,7,0.06)",
          border: "1px solid rgba(255,193,7,0.18)",
          borderRadius: "8px",
        }}>
          
          <p style={{ fontSize: "12px", color: "var(--muted)", lineHeight: "1.6" }}>
            Each code works once. Store them somewhere safe — they won&apos;t be shown again.
          </p>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px",
          padding: "14px", background: "var(--surface-2)",
          border: "1px solid var(--border)", borderRadius: "10px",
        }}>
          {backupCodes.map((c, i) => (
            <div key={i} style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "12px",
              padding: "8px 10px",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              textAlign: "center",
              letterSpacing: "0.08em",
              color: "var(--text)",
            }}>{c}</div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button type="button" onClick={handleDownload} className="btn-auth btn-auth-ghost" style={{ flex: 1 }}>
            <Download size={14} /> Download
          </button>
          <button type="button" onClick={handleDone} className="btn-auth btn-auth-primary" style={{ flex: 1 }}>
            Continue <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  // ── Step indicators ────────────────────────────────────────────────────────
  const steps = [
    { id: "scan", label: "scan" },
    { id: "verify", label: "verify" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Step indicators */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {steps.map((s, i) => {
          const active = step === s.id;
          const done = (step === "verify" && s.id === "scan");
          return (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "8px", flex: i < steps.length - 1 ? "1" : "0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "7px", flexShrink: 0 }}>
                <span style={{
                  width: "22px", height: "22px", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "11px", fontFamily: "'DM Mono', monospace",
                  background: done ? "var(--green-dim)" : active ? "var(--accent)" : "var(--surface-2)",
                  border: `1px solid ${done ? "rgba(0,229,160,0.3)" : active ? "var(--accent)" : "var(--border-bright)"}`,
                  color: done ? "var(--green)" : active ? "#000" : "var(--muted)",
                }}>
                  {done ? "✓" : `0${i + 1}`}
                </span>
                <span style={{
                  fontSize: "11px", fontFamily: "'DM Mono', monospace",
                  letterSpacing: "0.06em", textTransform: "uppercase",
                  color: active ? "var(--text)" : "var(--muted)",
                }}>{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Scan step */}
      {step === "scan" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{
              padding: "10px", background: "#fff", borderRadius: "10px",
              border: "1px solid var(--border)",
            }}>
              <Image src={qrCodeUrl} alt="TOTP QR Code" width={180} height={180} />
            </div>
          </div>

          <div className="field" style={{ marginBottom: 0 }}>
            <label className="field-label">can&apos;t scan? enter manually</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <code style={{
                flex: 1, padding: "10px 12px", background: "var(--surface-2)",
                border: "1px solid var(--border)", borderRadius: "8px",
                fontSize: "11px", fontFamily: "'DM Mono', monospace",
                letterSpacing: "0.1em", wordBreak: "break-all", color: "var(--accent)",
              }}>{secret}</code>
              <button type="button" onClick={handleCopy} className="btn-auth btn-auth-ghost"
                style={{ width: "42px", padding: 0, flexShrink: 0 }}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <button type="button" onClick={() => setStep("verify")} className="btn-auth btn-auth-primary">
            I&apos;ve scanned it <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Verify step */}
      {step === "verify" && (
        <form ref={formRef} action={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="totp-code" className="field-label">6-digit code from your app</label>
            <input
              id="totp-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              required
              maxLength={6}
              value={code}
              onChange={handleCodeChange}
              className="auth-input code-input no-icon"
              placeholder="000000"
              style={{ fontSize: "28px", letterSpacing: "0.4em" }}
            />
            <p style={{ fontSize: "11px", color: "var(--muted)", fontFamily: "'DM Mono', monospace", marginTop: "5px" }}>
              auto-submits when all 6 digits entered
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" onClick={() => { setStep("scan"); setCode(""); }}
              className="btn-auth btn-auth-ghost" style={{ flex: 1 }}>
              ← back
            </button>
            <button type="submit" disabled={code.length !== 6}
              className="btn-auth btn-auth-primary" style={{ flex: 2 }}>
              Activate TOTP
            </button>
          </div>
        </form>
      )}
    </div>
  );
}