// src/components/settings/verify-card.tsx
"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Mail, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { sendVerificationEmailAction } from "@/lib/auth/email-actions";

interface VerifyCardProps {
  email: string;
  emailVerified: boolean;
  userId: string;
}

export function VerifyCard({ email, emailVerified, userId }: VerifyCardProps) {
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;

    setIsResending(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("userId", userId);

      const result = await sendVerificationEmailAction({}, formData);


    } catch (error) {
      toast.error("Failed to send verification email");
    } finally {
      setIsResending(false);
    }
  };

  // Countdown timer effect
  if (countdown > 0) {
    setTimeout(() => setCountdown(countdown - 1), 1000);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium text-gray-900">Email Address</h4>
          <p className="text-sm text-gray-500 mt-1">{email}</p>
        </div>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${emailVerified
            ? 'bg-green-100 text-green-800'
            : 'bg-amber-100 text-amber-800'
          }`}>
          {emailVerified ? (
            <>
              <CheckCircle className="h-4 w-4 mr-1.5" />
              Verified
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 mr-1.5" />
              Not Verified
            </>
          )}
        </div>
      </div>

      {!emailVerified && (
        <div className="border-t border-gray-100 pt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start">
              <Mail className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h5 className="font-medium text-amber-800">
                  Verify your email address
                </h5>
                <p className="text-sm text-amber-700 mt-1">
                  Please verify your email to access all features and secure your account.
                </p>
                <div className="mt-3 space-y-3">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleResend}
                      disabled={countdown > 0 || isResending}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isResending ? (
                        <>
                          <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                          Sending...
                        </>
                      ) : countdown > 0 ? (
                        `Resend in ${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}`
                      ) : (
                        "Send Verification Code"
                      )}
                    </button>
                    <a
                      href="/verify-email"
                      className="text-sm font-medium text-amber-600 hover:text-amber-500"
                    >
                      Go to verification page
                    </a>
                  </div>
                  <p className="text-xs text-amber-600">
                    Check your spam folder if you don't see the email. The code will appear in your terminal in development mode.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {emailVerified && (
        <div className="border-t border-gray-100 pt-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h5 className="font-medium text-green-800">
                  Email verified successfully
                </h5>
                <p className="text-sm text-green-700 mt-1">
                  Your email address is verified and secure. You have full access to all account features.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}