// src/app/page.tsx

export const dynamic = 'force-dynamic';

import Link from "next/link";
import { getServerSession } from "@/lib/auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { Shield, Lock, KeyRound, ShieldCheck, ArrowRight, Zap } from "lucide-react";
import type { Metadata } from "next";
import { APP_TITLE } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${APP_TITLE} — Secure Authentication`,
  description: "Enterprise-grade authentication with email verification, TOTP two-factor authentication, and backup codes.",
};

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) redirect("/dashboard");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --bg: #080b0f;
          --surface: #0e1318;
          --border: #1e2830;
          --border-bright: #2e3d4a;
          --text: #e8edf2;
          --muted: #5a7080;
          --accent: #00d4ff;
          --accent-dim: rgba(0, 212, 255, 0.08);
          --accent-glow: rgba(0, 212, 255, 0.25);
          --green: #00e5a0;
          --red: #ff4d6d;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          overflow-x: hidden;
        }

        /* Grid texture */
        .grid-bg {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
          z-index: 0;
        }

        /* Radial glow */
        .glow-orb {
          position: fixed;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%);
          top: -100px;
          right: -100px;
          pointer-events: none;
          z-index: 0;
        }

        .page {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* ── Nav ── */
        nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 48px;
          border-bottom: 1px solid var(--border);
          backdrop-filter: blur(8px);
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 18px;
          letter-spacing: -0.02em;
          color: var(--text);
          text-decoration: none;
        }

        .nav-logo svg { color: var(--accent); }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-ghost {
          padding: 8px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 400;
          color: var(--muted);
          text-decoration: none;
          transition: color 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-ghost:hover { color: var(--text); }

        .btn-primary {
          padding: 9px 22px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          background: var(--accent);
          color: #000;
          text-decoration: none;
          transition: opacity 0.2s, box-shadow 0.2s;
          font-family: 'DM Sans', sans-serif;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .btn-primary:hover {
          opacity: 0.9;
          box-shadow: 0 0 20px var(--accent-glow);
        }

        /* ── Hero ── */
        .hero {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 24px 60px;
          text-align: center;
          gap: 0;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 100px;
          border: 1px solid var(--border-bright);
          background: var(--accent-dim);
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: var(--accent);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 36px;
          animation: fadeUp 0.6s ease both;
        }

        h1 {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(42px, 7vw, 88px);
          line-height: 0.95;
          letter-spacing: -0.03em;
          color: var(--text);
          max-width: 900px;
          animation: fadeUp 0.6s 0.1s ease both;
        }

        h1 .accent { color: var(--accent); }

        .hero-sub {
          margin-top: 28px;
          font-size: clamp(15px, 2vw, 18px);
          color: var(--muted);
          max-width: 520px;
          line-height: 1.65;
          font-weight: 300;
          animation: fadeUp 0.6s 0.2s ease both;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-top: 44px;
          animation: fadeUp 0.6s 0.3s ease both;
          flex-wrap: wrap;
          justify-content: center;
        }

        .btn-large {
          padding: 14px 32px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 500;
          background: var(--accent);
          color: #000;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: opacity 0.2s, box-shadow 0.2s, transform 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-large:hover {
          opacity: 0.92;
          box-shadow: 0 0 32px var(--accent-glow);
          transform: translateY(-1px);
        }

        .btn-outline {
          padding: 13px 28px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 400;
          border: 1px solid var(--border-bright);
          color: var(--text);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: border-color 0.2s, background 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-outline:hover {
          border-color: var(--accent);
          background: var(--accent-dim);
        }

        /* ── Stats bar ── */
        .stats-bar {
          display: flex;
          align-items: center;
          gap: 0;
          border: 1px solid var(--border);
          border-radius: 12px;
          background: var(--surface);
          overflow: hidden;
          margin-top: 64px;
          animation: fadeUp 0.6s 0.4s ease both;
          width: 100%;
          max-width: 640px;
        }

        .stat {
          flex: 1;
          padding: 20px 24px;
          text-align: center;
          border-right: 1px solid var(--border);
        }
        .stat:last-child { border-right: none; }

        .stat-value {
          font-family: 'Syne', sans-serif;
          font-size: 26px;
          font-weight: 800;
          color: var(--accent);
          letter-spacing: -0.02em;
        }

        .stat-label {
          font-size: 11px;
          color: var(--muted);
          font-family: 'DM Mono', monospace;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-top: 4px;
        }

        /* ── Features ── */
        .features {
          padding: 80px 48px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        .section-label {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: var(--accent);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        .section-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text);
          max-width: 480px;
          line-height: 1.1;
          margin-bottom: 56px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
        }

        .feature-card {
          background: var(--surface);
          padding: 36px 32px;
          position: relative;
          transition: background 0.2s;
        }
        .feature-card:hover { background: #111820; }

        .feature-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: var(--accent-dim);
          border: 1px solid rgba(0,212,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          margin-bottom: 20px;
        }

        .feature-title {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 10px;
          letter-spacing: -0.01em;
        }

        .feature-desc {
          font-size: 14px;
          color: var(--muted);
          line-height: 1.65;
          font-weight: 300;
        }

        .feature-tag {
          position: absolute;
          top: 20px;
          right: 20px;
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          padding: 3px 8px;
          border-radius: 4px;
          background: var(--accent-dim);
          color: var(--accent);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        /* ── Flow section ── */
        .flow-section {
          padding: 0 48px 80px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        .flow-steps {
          display: flex;
          align-items: flex-start;
          gap: 0;
          position: relative;
          margin-top: 48px;
          flex-wrap: wrap;
        }

        .flow-step {
          flex: 1;
          min-width: 160px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
          padding: 0 16px;
        }

        .flow-step:not(:last-child)::after {
          content: '';
          position: absolute;
          top: 20px;
          right: -4px;
          width: calc(50% + 4px);
          height: 1px;
          background: linear-gradient(90deg, var(--border-bright), transparent);
        }

        .flow-step:not(:first-child)::before {
          content: '';
          position: absolute;
          top: 20px;
          left: -4px;
          width: calc(50% + 4px);
          height: 1px;
          background: linear-gradient(270deg, var(--border-bright), transparent);
        }

        .step-num {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid var(--border-bright);
          background: var(--surface);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          color: var(--accent);
          margin-bottom: 16px;
          position: relative;
          z-index: 1;
        }

        .step-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--text);
          margin-bottom: 6px;
        }

        .step-desc {
          font-size: 12px;
          color: var(--muted);
          line-height: 1.5;
        }

        /* ── Footer ── */
        footer {
          border-top: 1px solid var(--border);
          padding: 24px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .footer-left {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          color: var(--muted);
        }

        .footer-right {
          display: flex;
          gap: 24px;
        }

        .footer-right a {
          font-size: 13px;
          color: var(--muted);
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-right a:hover { color: var(--text); }

        /* ── Animations ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 640px) {
          nav { padding: 18px 20px; }
          .features, .flow-section { padding-left: 20px; padding-right: 20px; }
          footer { padding: 20px; }
          .stats-bar { flex-direction: column; }
          .stat { border-right: none; border-bottom: 1px solid var(--border); }
          .stat:last-child { border-bottom: none; }
        }
      `}</style>

      <div className="grid-bg" />
      <div className="glow-orb" />

      <div className="page">
        {/* Nav */}
        <nav>
          <Link href="/" className="nav-logo">
            <Shield size={20} />
            {APP_TITLE}
          </Link>
          <div className="nav-links">
            <Link href="/auth/signin" className="btn-ghost">Sign in</Link>
            <Link href="/auth/signup" className="btn-primary">
              Get started <ArrowRight size={14} />
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="hero">
          <div className="badge">
            <Zap size={11} />
            Production-ready auth
          </div>

          <h1>
            Security that<br />
            <span className="accent">doesn&apos;t compromise</span>
          </h1>

          <p className="hero-sub">
            Enterprise-grade authentication with email verification,
            TOTP two-factor authentication, and encrypted backup codes —
            built for the modern web.
          </p>

          <div className="hero-actions">
            <Link href="/auth/signup" className="btn-large">
              Create account <ArrowRight size={16} />
            </Link>
            <Link href="/auth/signin" className="btn-outline">
              <Lock size={15} />
              Sign in
            </Link>
          </div>

          <div className="stats-bar">
            {[
              { value: "2FA", label: "enforced" },
              { value: "E2E", label: "encrypted" },
              { value: "JWT", label: "sessions" },
            ].map(({ value, label }) => (
              <div key={label} className="stat">
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="features">
        
          <h2 className="section-title">Every layer secured</h2>

          <div className="features-grid">
            {[
              {
                icon: <Mail size={20} />,
                title: "Email Verification",
                desc: "8-digit time-limited codes sent via SMTP. Accounts are locked until verified.",
                tag: "required",
              },
              {
                icon: <ShieldCheck size={20} />,
                title: "TOTP / 2FA",
                desc: "Google Authenticator and Authy compatible. Required for all users on every login.",
                tag: "enforced",
              },
              {
                icon: <KeyRound size={20} />,
                title: "Backup Codes",
                desc: "10 one-time recovery codes generated at TOTP setup. Bcrypt-hashed at rest.",
                tag: "10 codes",
              },
              {
                icon: <Lock size={20} />,
                title: "Secure Sessions",
                desc: "JWT-based sessions with short-lived tokens and automatic re-validation on every request.",
                tag: "JWT",
              },
            ].map(({ icon, title, desc, tag }) => (
              <div key={title} className="feature-card">
                <span className="feature-tag">{tag}</span>
                <div className="feature-icon">{icon}</div>
                <h3 className="feature-title">{title}</h3>
                <p className="feature-desc">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Auth flow */}
        <section className="flow-section">
         
          <h2 className="section-title">How it works</h2>

          <div className="flow-steps">
            {[
              { n: "01", label: "Create account", desc: "Register with email and password" },
              { n: "02", label: "Verify email", desc: "Enter 8-digit code from inbox" },
              { n: "03", label: "Set up TOTP", desc: "Scan QR in authenticator app" },
              { n: "04", label: "MFA challenge", desc: "Enter code on every login" },
              { n: "05", label: "Access granted", desc: "Full dashboard access" },
            ].map(({ n, label, desc }) => (
              <div key={n} className="flow-step">
                <div className="step-num">{n}</div>
                <p className="step-label">{label}</p>
                <p className="step-desc">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer>
          <span className="footer-left">© {new Date().getFullYear()} {APP_TITLE}</span>
          <div className="footer-right">
            <Link href="/signin">Sign in</Link>
            <Link href="/signup">Sign up</Link>
          </div>
        </footer>
      </div>
    </>
  );
}

// Inline Mail icon since it's not exported from lucide with this exact name in all versions
function Mail({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}