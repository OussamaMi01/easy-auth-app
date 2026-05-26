// src/app/(auth)/signin/page.tsx

'use client';

export const dynamic = 'force-dynamic';



import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, Shield, AlertCircle } from "lucide-react";
import { APP_TITLE } from "@/lib/constants";

// Separate component that uses useSearchParams
function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError("");

    if (!email || !password) {
      setFormError("Please fill in all fields.");
      setLoading(false);
      return;
    }
    if (!email.includes("@")) {
      setFormError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setFormError(
          result.error === "CredentialsSignin"
            ? "Invalid email or password."
            : "An error occurred during sign in."
        );
        setLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setFormError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  const error = formError || (urlError ? "Authentication failed. Please try again." : "");

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-icon-wrap">
          <Lock size={18} />
        </div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account to continue</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={14} className="alert-icon" />
          {error}
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
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
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
          <div className="field-row">
            <label htmlFor="password" className="field-label">Password</label>
            <Link href="/auth/forgot-password" className="field-link">forgot?</Link>
          </div>
          <div className="input-wrap">
            <span className="input-icon"><Lock size={15} /></span>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input has-right"
              placeholder="••••••••"
            />
            <button
              type="button"
              className="input-icon-right"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div className="checkbox-row" style={{ marginBottom: "20px" }}>
          <input id="remember" type="checkbox" className="auth-checkbox" />
          <label htmlFor="remember" className="checkbox-label">Remember me</label>
        </div>

        <button type="submit" disabled={loading} className="btn-auth btn-auth-primary">
          {loading ? <><span className="spinner" /> Signing in…</> : "Sign in"}
        </button>
      </form>

      <div className="auth-divider"><span>or</span></div>

      <Link href="/auth/signup" className="btn-auth btn-auth-ghost" style={{ textDecoration: "none" }}>
        Create new account
      </Link>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="auth-bg">
      <nav className="auth-nav">
        <Link href="/" className="auth-logo">
          <span className="auth-logo-icon"><Shield size={17} /></span>
          {APP_TITLE}
        </Link>
        <Link href="/auth/signup" className="auth-nav-link">Create account →</Link>
      </nav>

      <Suspense fallback={
        <div className="auth-card" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
          <div className="spinner" />
        </div>
      }>
        <SignInForm />
      </Suspense>

      <p className="auth-footer-note">
        By signing in you agree to our{" "}
        <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>
      </p>
    </div>
  );
}