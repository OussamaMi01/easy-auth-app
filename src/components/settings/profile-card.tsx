// src/components/settings/profile-card.tsx
"use client";

import { useState } from "react";
import { User, Calendar, Edit2, Save, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface ProfileCardProps {
  name?: string;
  email: string;
  userId: string;
  createdAt?: Date;
}

export function ProfileCard({ name, email, userId, createdAt }: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(name || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!editedName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setIsSaving(true);
    
    try {
      // Call API to update user name
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editedName.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      toast.success("Profile updated successfully");
      setIsEditing(false);
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Name Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Name
        </label>
        <div className="flex items-center space-x-4">
          {isEditing ? (
            <div className="flex-1 flex items-center space-x-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter your name"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedName(name || "");
                }}
                className="inline-flex items-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1 p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-900">{name || "Not set"}</p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </button>
            </>
          )}
        </div>
      </div>

      {/* Email Field (Read-only) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-gray-900">{email}</p>
          <p className="text-xs text-gray-500 mt-1">
            Email cannot be changed. Contact support if needed.
          </p>
        </div>
      </div>

      {/* Account Info */}
      <div className="border-t border-gray-100 pt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Account Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <Calendar className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="text-gray-900">
                {createdAt ? new Date(createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="h-5 w-5 mr-3">
              <div className="h-2 w-2 rounded-full bg-green-500 mx-auto mt-1.5"></div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Account Status</p>
              <p className="text-gray-900">Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}