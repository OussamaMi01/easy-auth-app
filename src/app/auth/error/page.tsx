// src/app/auth/error/page.tsx
'use client';

export const dynamic = 'force-dynamic';



import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Home, LogIn } from "lucide-react";

// Separate component that uses useSearchParams
function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  
  const errorMessage = (() => {
    switch (error) {
      case "CredentialsSignin": return "Invalid email or password";
      case "Configuration": return "There is a problem with the server configuration";
      case "AccessDenied": return "Access denied";
      case "Verification": return "The verification link was invalid or has expired";
      default: return "An unknown error occurred";
    }
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {errorMessage}
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-gray-200">
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-6">
                Please try again or contact support if the problem persists.
              </p>
            </div>

            <div className="flex flex-col space-y-3">
              <Link
                href="/signin"
                className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Return to Sign In
              </Link>
              
              <Link
                href="/"
                className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to Homepage
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Error code: {error || "unknown"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
}