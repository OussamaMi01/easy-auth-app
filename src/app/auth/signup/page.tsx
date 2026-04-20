// src/app/(auth)/signup/page.tsx
'use client';

export const dynamic = 'force-dynamic';




import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, Shield, AlertCircle, CheckCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import { APP_TITLE } from "@/lib/constants";

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const reqs = {
    minLength: password.length >= 8,
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
  };
  const allMet = Object.values(reqs).every(Boolean);
  const passwordMismatch = !!password && !!confirmPassword && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      setLoading(false);
      return;
    }
    if (!allMet) {
      setError("Password doesn't meet all requirements.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: email.trim().toLowerCase(), password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      setSuccess("Account created! Signing you in…");

      try {
        await signIn("credentials", {
          email: email.trim().toLowerCase(),
          password,
          redirect: false,
        });
        setTimeout(() => { router.push("/auth/verify-email"); router.refresh(); }, 800);
      } catch {
        setTimeout(() => router.push("/auth/signin?registered=true"), 1500);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <nav className="auth-nav">
        <Link href="/" className="auth-logo">
          <span className="auth-logo-icon"><Shield size={17} /></span>
          {APP_TITLE}
        </Link>
        <Link href="/auth/signin" className="auth-nav-link">
          Sign in →
        </Link>
      </nav>

      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <div className="auth-icon-wrap">
            <User size={18} />
          </div>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Join and get started in seconds</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={14} className="alert-icon" />
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success">
            <CheckCircle size={14} className="alert-icon" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name" className="field-label">Full name</label>
            <div className="input-wrap">
              <span className="input-icon"><User size={15} /></span>
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="auth-input"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="email" className="field-label">Email</label>
            <div className="input-wrap">
              <span className="input-icon"><Mail size={15} /></span>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="password" className="field-label">Password</label>
            <div className="input-wrap">
              <span className="input-icon"><Lock size={15} /></span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input has-right"
                placeholder="••••••••"
              />
              <button type="button" className="input-icon-right" onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {password.length > 0 && (
              <div className="pw-reqs">
                {[
                  { key: "minLength", label: "8+ chars" },
                  { key: "hasNumber", label: "number" },
                  { key: "hasUppercase", label: "uppercase" },
                  { key: "hasSpecial", label: "special char" },
                ].map(({ key, label }) => {
                  const ok = reqs[key as keyof typeof reqs];
                  return (
                    <div key={key} className={`pw-req ${ok ? "pw-req-ok" : "pw-req-no"}`}>
                      <span className={`pw-dot ${ok ? "pw-dot-ok" : "pw-dot-no"}`} />
                      {label}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="field">
            <label htmlFor="confirmPassword" className="field-label">Confirm password</label>
            <div className="input-wrap">
              <span className="input-icon"><Lock size={15} /></span>
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`auth-input has-right ${passwordMismatch ? "error" : ""}`}
                placeholder="••••••••"
              />
              <button type="button" className="input-icon-right" onClick={() => setShowConfirm((v) => !v)}>
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {passwordMismatch && (
              <p style={{ fontSize: "12px", color: "var(--red)", marginTop: "5px", fontFamily: "'DM Mono', monospace" }}>
                passwords don't match
              </p>
            )}
          </div>

          <div className="checkbox-row" style={{ marginBottom: "20px" }}>
            <input id="terms" type="checkbox" required className="auth-checkbox" />
            <label htmlFor="terms" className="checkbox-label">
              I agree to the <Link href="/terms">Terms of Service</Link> and{" "}
              <Link href="/privacy">Privacy Policy</Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !allMet}
            className="btn-auth btn-auth-primary"
          >
            {loading ? <><span className="spinner" /> Creating account…</> : "Create account"}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <Link href="/auth/signin" className="btn-auth btn-auth-ghost" style={{ textDecoration: "none" }}>
          Sign in to existing account
        </Link>
      </div>
    </div>
  );
}