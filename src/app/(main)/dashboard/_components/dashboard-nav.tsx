// src/app/(main)/_components/dashboard-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";
import { HomeIcon, UserIcon, ShieldIcon, GearIcon } from "@/components/icons";
import { APP_TITLE } from "@/lib/constants";

const items = [
  { title: "Dashboard", href: "/dashboard",          icon: HomeIcon },
  { title: "Profile",   href: "/dashboard/profile",  icon: UserIcon },
  { title: "Security",  href: "/dashboard/security", icon: ShieldIcon },
  { title: "Settings",  href: "/dashboard/settings", icon: GearIcon },
];

export function DashboardNav() {
  const path = usePathname();

  return (
    <header className="dash-topbar">
      {/* Logo */}
      <Link href="/dashboard" className="dash-logo">
        <span className="dash-logo-icon"><Shield size={16} /></span>
        {APP_TITLE}
      </Link>

      {/* Nav items */}
      <nav className="dash-nav">
        {items.map((item) => {
          const active = path === item.href || path.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`dash-nav-item${active ? " active" : ""}`}
            >
              <item.icon style={{ width: 14, height: 14, flexShrink: 0 }} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}