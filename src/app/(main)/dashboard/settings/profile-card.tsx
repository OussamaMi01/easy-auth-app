// src/components/settings/profile-card.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { toast } from "sonner";
import { Camera, X, User } from "lucide-react";
import Image from "next/image";
import {
  updateNameAction,
  updateEmailAction,
  updateAvatarAction,
  removeAvatarAction,
} from "@/lib/user/user-actions";

interface ProfileCardProps {
  name: string;
  email: string;
  userId: string;
  createdAt: Date;
}

interface ActionState { success?: boolean; error?: string; data?: Record<string, unknown>; }

export function ProfileCard({ name, email, userId, createdAt }: ProfileCardProps) {
  const [nameState, nameAction] = useFormState<ActionState, FormData>(updateNameAction, {});
  const [emailState, emailAction] = useFormState<ActionState, FormData>(updateEmailAction, {});
  const [avatarState, avatarAction] = useFormState<ActionState, FormData>(updateAvatarAction, {});
  const [removeState, removeAction] = useFormState<ActionState, FormData>(removeAvatarAction, {});

  const [nameVal, setNameVal] = useState(name);
  const [emailVal, setEmailVal] = useState(email);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const avatarFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => { if (nameState.success) toast.success("Name updated."); if (nameState.error) toast.error(nameState.error); }, [nameState]);
  useEffect(() => { if (emailState.success) toast.success("Email updated. Please re-verify your email."); if (emailState.error) toast.error(emailState.error); }, [emailState]);
  useEffect(() => {
    if (avatarState.success) {
      toast.success("Avatar updated.");
      if (avatarState.data?.imageUrl) setPreview(avatarState.data.imageUrl as string);
    }
    if (avatarState.error) toast.error(avatarState.error);
  }, [avatarState]);
  useEffect(() => { if (removeState.success) { toast.success("Avatar removed."); setPreview(null); } if (removeState.error) toast.error(removeState.error); }, [removeState]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    // Auto-submit the avatar form
    setTimeout(() => avatarFormRef.current?.requestSubmit(), 50);
  }

  function handleNameSubmit(formData: FormData) { nameAction(formData); }
  function handleEmailSubmit(formData: FormData) { emailAction(formData); }
  function handleAvatarSubmit(formData: FormData) { avatarAction(formData); }
  function handleRemoveAvatar(formData: FormData) { removeAction(formData); }

  const initials = (nameVal || email).slice(0, 2).toUpperCase();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          {preview ? (
            <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--border-bright)" }}>
              <Image src={preview} alt="Avatar" width={72} height={72} style={{ objectFit: "cover" }} />
            </div>
          ) : (
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "var(--accent-dim)", border: "2px solid rgba(0,212,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-display, sans-serif)", fontSize: "20px",
              fontWeight: 800, color: "var(--accent)",
            }}>
              {initials}
            </div>
          )}

          {/* Camera button overlay */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            style={{
              position: "absolute", bottom: 0, right: 0,
              width: 24, height: 24, borderRadius: "50%",
              background: "var(--accent)", border: "2px solid var(--bg)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#000",
            }}
          >
            <Camera size={11} />
          </button>
        </div>

        <div>
          <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)", marginBottom: "4px" }}>
            {nameVal || "No name set"}
          </p>
          <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "8px" }}>
            JPG, PNG, WebP or GIF · max 2MB
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              style={{
                padding: "5px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: 500,
                background: "var(--accent)", color: "#000", border: "none", cursor: "pointer",
              }}
            >
              Upload
            </button>
            {preview && (
              <form action={handleRemoveAvatar}>
                <button type="submit" style={{
                  padding: "5px 14px", borderRadius: "6px", fontSize: "12px",
                  background: "transparent", border: "1px solid var(--border-bright)",
                  color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px",
                }}>
                  <X size={11} /> Remove
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Hidden file input + avatar form */}
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
        <form ref={avatarFormRef} action={handleAvatarSubmit} style={{ display: "none" }}>
          <input
            type="file"
            name="avatar"
            accept="image/*"
            onChange={(e) => {
              const dt = new DataTransfer();
              if (fileRef.current?.files?.[0]) dt.items.add(fileRef.current.files[0]);
              e.target.files = dt.files;
            }}
          />
        </form>
      </div>

      <Divider />

      {/* Update Name */}
      <form action={handleNameSubmit}>
        <FieldGroup label="display name">
          <div style={{ display: "flex", gap: "8px" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", display: "flex" }}>
                <User size={14} />
              </span>
              <input
                name="name"
                type="text"
                value={nameVal}
                onChange={(e) => setNameVal(e.target.value)}
                placeholder="Your name"
                className="auth-input"
                style={{ paddingLeft: 32 }}
              />
            </div>
            <SaveButton />
          </div>
        </FieldGroup>
      </form>

      {/* Update Email */}
      <form action={handleEmailSubmit}>
        <FieldGroup label="email address" hint="Changing your email will require re-verification.">
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              name="email"
              type="email"
              value={emailVal}
              onChange={(e) => setEmailVal(e.target.value)}
              placeholder="you@example.com"
              className="auth-input no-icon"
              style={{ flex: 1 }}
            />
            <SaveButton />
          </div>
        </FieldGroup>
      </form>

      <Divider />

      {/* Account info (read-only) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div>
          <p style={{ fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "6px", fontFamily: "var(--font-mono, monospace)" }}>user id</p>
          <div style={{ fontSize: "11px", color: "var(--muted)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "7px", padding: "9px 11px", fontFamily: "var(--font-mono, monospace)", wordBreak: "break-all" }}>
            {userId}
          </div>
        </div>
        <div>
          <p style={{ fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "6px", fontFamily: "var(--font-mono, monospace)" }}>member since</p>
          <div style={{ fontSize: "13px", color: "var(--text)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "7px", padding: "9px 11px" }}>
            {new Date(createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FieldGroup({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
      <p style={{ fontSize: "11px", letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--muted)", fontFamily: "var(--font-mono, monospace)" }}>{label}</p>
      {children}
      {hint && <p style={{ fontSize: "11px", color: "var(--muted)", lineHeight: 1.5 }}>{hint}</p>}
    </div>
  );
}

function SaveButton() {
  return (
    <button type="submit" style={{
      padding: "0 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 500,
      background: "var(--accent)", color: "#000", border: "none", cursor: "pointer", flexShrink: 0,
      transition: "opacity 0.15s",
    }}>
      Save
    </button>
  );
}

function Divider() {
  return <div style={{ height: "1px", background: "var(--border)" }} />;
}