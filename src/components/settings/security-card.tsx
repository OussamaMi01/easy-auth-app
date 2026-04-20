// src/components/settings/security-card.tsx
"use client";

import { Shield, Key, Smartphone, LogOut } from "lucide-react";
import { toast } from "sonner";

interface SecurityCardProps {
  email: string;
  emailVerified: boolean;
  userId: string;
}

export function SecurityCard({ email, emailVerified }: SecurityCardProps) {
  const handleChangePassword = () => {
    toast.info("Password change functionality coming soon");
  };

  const handleSetup2FA = () => {
    toast.info("Two-factor authentication coming soon");
  };

  const handleLogoutAll = async () => {
    if (!confirm("Are you sure you want to log out from all devices?")) return;
    
    try {
      const response = await fetch("/api/auth/logout-all", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Logged out from all devices");
        // Redirect to signin after a delay
        setTimeout(() => {
          window.location.href = "/signin";
        }, 2000);
      } else {
        throw new Error("Failed to log out from all devices");
      }
    } catch (error) {
      toast.error("Failed to log out from all devices");
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Status */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-gray-600 mr-3" />
            <div>
              <h4 className="font-medium text-gray-900">Security Score</h4>
              <p className="text-sm text-gray-500">
                {emailVerified ? "Good" : "Needs improvement"}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${emailVerified ? 'bg-green-500' : 'bg-amber-500'}`}
                style={{ width: emailVerified ? '80%' : '40%' }}
              ></div>
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">
              {emailVerified ? "80%" : "40%"}
            </span>
          </div>
        </div>
      </div>

      {/* Security Actions */}
      <div className="space-y-4">
        <button
          onClick={handleChangePassword}
          className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group"
        >
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors">
              <Key className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-left">
              <h5 className="font-medium text-gray-900">Change Password</h5>
              <p className="text-sm text-gray-500">Update your account password</p>
            </div>
          </div>
          <span className="text-sm text-blue-600 font-medium">Change</span>
        </button>

        <button
          onClick={handleSetup2FA}
          className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group"
        >
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3 group-hover:bg-purple-200 transition-colors">
              <Smartphone className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-left">
              <h5 className="font-medium text-gray-900">Two-Factor Authentication</h5>
              <p className="text-sm text-gray-500">Add an extra layer of security</p>
            </div>
          </div>
          <span className="text-sm text-purple-600 font-medium">Set up</span>
        </button>

        <button
          onClick={handleLogoutAll}
          className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group"
        >
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-3 group-hover:bg-red-200 transition-colors">
              <LogOut className="h-5 w-5 text-red-600" />
            </div>
            <div className="text-left">
              <h5 className="font-medium text-gray-900">Log Out Everywhere</h5>
              <p className="text-sm text-gray-500">Sign out from all devices</p>
            </div>
          </div>
          <span className="text-sm text-red-600 font-medium">Log out</span>
        </button>
      </div>

      {/* Security Tips */}
      <div className="border-t border-gray-100 pt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Security Tips</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 mr-2 flex-shrink-0"></div>
            <span>Use a password manager to generate strong passwords</span>
          </li>
          <li className="flex items-start">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 mr-2 flex-shrink-0"></div>
            <span>Enable two-factor authentication when available</span>
          </li>
          <li className="flex items-start">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 mr-2 flex-shrink-0"></div>
            <span>Never reuse passwords across different services</span>
          </li>
          <li className="flex items-start">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 mr-2 flex-shrink-0"></div>
            <span>Be cautious of phishing emails asking for credentials</span>
          </li>
        </ul>
      </div>
    </div>
  );
}