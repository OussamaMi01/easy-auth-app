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
const callbackUrl = "/dashboard";

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
        {/* Add Google OAuth button */}
        <div className="oauth-buttons" style={{ marginTop: "20px" }}>
          <button
            onClick={() => signIn("google", { callbackUrl })}
            className="btn-auth btn-auth-oauth"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              background: "black",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "10px 16px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>
        </div>

        <style jsx>{`
          .oauth-buttons {
            margin-top: 20px;
          }
          .btn-auth-oauth:hover {
            background: var(--muted);
            transform: translateY(-1px);
          }
        `}</style>
        <div></div>

        <div className="auth-divider"><span>or</span></div>

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