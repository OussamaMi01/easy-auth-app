// src/app/(main)/_components/header.tsx
"use client";

import { useSession } from "next-auth/react";
import { UserDropdown } from "./user-dropdown";
import { RocketIcon } from "@/components/icons";
import { APP_TITLE } from "@/lib/constants";
import Link from "next/link";

export function Header() {
  const { data: session, status } = useSession();
  const user = session?.user;

  // Show loading state
  if (status === "loading") {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center px-4">
          <div className="flex items-center gap-2 text-xl font-bold">
            <RocketIcon className="h-6 w-6" />
            <span className="hidden sm:inline">{APP_TITLE}</span>
            <span className="sm:hidden">Dashboard</span>
          </div>
          <div className="ml-auto">
            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-xl font-bold hover:opacity-80 transition-opacity"
        >
          <RocketIcon className="h-6 w-6" />
          <span className="hidden sm:inline">{APP_TITLE}</span>
          <span className="sm:hidden">Dashboard</span>
        </Link>

        <nav className="ml-8 hidden md:flex items-center gap-6">
          <Link 
            href="/dashboard" 
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Dashboard
          </Link>
          <Link 
            href="/dashboard/settings" 
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Settings
          </Link>
          {!user && (
            <Link 
              href="/features" 
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Features
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          {user ? (
            <UserDropdown 
              email={user.email || undefined} 
              avatar={user.image || undefined} 
            />
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/signin"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}