// src/app/(main)/_components/mobile-header.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Menu, X, RocketIcon } from "@/components/icons";
import { usePathname } from "next/navigation";

export function MobileHeader() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const user = session?.user;

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/settings", label: "Settings" },
    ...(user ? [] : [{ href: "/features", label: "Features" }]),
  ];

  // Show loading state
  if (status === "loading") {
    return (
      <header className="sticky top-0 z-50 border-b bg-background md:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 text-lg font-bold">
            <RocketIcon className="h-5 w-5" />
            <span>Dashboard</span>
          </div>
          <div className="h-8 w-8 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background md:hidden">
      <div className="flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <RocketIcon className="h-5 w-5" />
          <span>Dashboard</span>
        </Link>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-16 border-b bg-background shadow-lg">
          <div className="flex flex-col p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            <div className="mt-4 border-t pt-4">
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm">
                    <p className="font-medium">{user.email}</p>
                    <p className="text-xs text-muted-foreground">Signed in</p>
                  </div>
                  <Link
                    href="/dashboard/settings"
                    className="block px-4 py-3 text-sm hover:bg-accent rounded-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    Settings
                  </Link>
                  <a
                    href="/api/auth/signout"
                    className="block px-4 py-3 text-sm text-red-600 hover:bg-accent rounded-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Out
                  </a>
                </>
              ) : (
                <>
                  <Link
                    href="/signin"
                    className="block px-4 py-3 text-sm hover:bg-accent rounded-lg mb-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="block px-4 py-3 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}