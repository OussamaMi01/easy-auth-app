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