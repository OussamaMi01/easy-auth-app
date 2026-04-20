// src/app/(auth)/layout.tsx
import type { ReactNode } from "react";
import { DM_Sans, DM_Mono, Syne } from "next/font/google";
import "./auth.css"; 

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["300","400","500"], variable: "--font-dm-sans", display: "swap" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400","500"], variable: "--font-dm-mono", display: "swap" });
const syne   = Syne({ subsets: ["latin"], weight: ["700","800"], variable: "--font-syne", display: "swap" });

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${dmSans.variable} ${dmMono.variable} ${syne.variable}`}
      style={{ fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)" }}
    >
      {children}
    </div>
  );
}