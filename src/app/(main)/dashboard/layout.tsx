// src/app/(main)/layout.tsx
import type { ReactNode } from "react";
import { DM_Sans, DM_Mono, Syne } from "next/font/google";
import { DashboardNav } from "./_components/dashboard-nav";
import { VerificationWarning } from "./_components/verificiation-warning";
import "./dashboard.css";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["300","400","500"], variable: "--font-dm-sans", display: "swap" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400","500"], variable: "--font-dm-mono", display: "swap" });
const syne   = Syne({ subsets: ["latin"], weight: ["700","800"], variable: "--font-syne", display: "swap" });

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${dmSans.variable} ${dmMono.variable} ${syne.variable}`}>
      <div className="dash-shell">
        <DashboardNav />
        <div className="dash-content">
          <VerificationWarning />
          {children}
        </div>
      </div>
    </div>
  );
}