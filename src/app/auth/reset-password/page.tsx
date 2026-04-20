// src/app/(auth)/forgot-password/page.tsx

export const dynamic = 'force-dynamic';

import { redirect } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { KeyRound, Shield, ArrowLeft } from "lucide-react";
import { SendResetEmail } from "./send-reset-email";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your password securely",
};

export default async function ForgotPasswordPage() {
  const { user } = await validateRequest();

  if (user) redirect(Paths.Dashboard);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white hover:opacity-80 transition-opacity"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span>Your App</span>
          </Link>
        </div>

        {/* Forgot Password Card */}
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-14 w-14 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950/50 mb-4">
              <KeyRound className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Forgot password?
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              No worries, we'll send you a link to reset your password.
            </p>
          </div>

          {/* Reset Email Form */}
          <SendResetEmail />

          {/* Back to Sign In */}
          <div className="mt-6 text-center">
            <Link
              href={Paths.Login || "/auth/signin"}
              className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Secure • 256-bit encryption
            </p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}