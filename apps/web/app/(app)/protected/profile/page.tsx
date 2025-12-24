// [P3][APP][CODE] Profile page - Persists to Firestore
// Tags: P3, APP, CODE, PROFILE, FIRESTORE
"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../../../src/lib/auth-context";
import { useOrg } from "../../../../src/lib/org-context";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { db } from "../../../lib/firebaseClient";
import { doc, getDoc, setDoc, updateDoc, Timestamp } from "firebase/firestore";

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  phone: string;
  role: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const { orgId } = useOrg();

  const [profile, setProfile] = useState<Partial<UserProfile>>({
    displayName: "",
    phone: "",
    role: "member",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load profile from Firestore
  useEffect(() => {
    if (!user || !orgId || !db) return;

    const loadProfile = async () => {
      try {
        const profileRef = doc(db!, `organizations/${orgId}/members/${user.uid}`);
        const snap = await getDoc(profileRef);

        if (snap.exists()) {
          const data = snap.data();
          setProfile({
            displayName: data.displayName || user.displayName || "",
            phone: data.phone || "",
            role: data.role || "member",
          });
        } else {
          // Initialize with Firebase user data
          setProfile({
            displayName: user.displayName || "",
            phone: "",
            role: "member",
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      }
    };

    loadProfile();
  }, [user, orgId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.currentTarget;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleSave = async () => {
    if (!user || !orgId || !db) {
      setError("Not authenticated or database not ready");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const now = Timestamp.now();
      const profileRef = doc(db!, `organizations/${orgId}/members/${user.uid}`);

      const profileData = {
        uid: user.uid,
        email: user.email,
        displayName: profile.displayName || user.displayName || "Unknown",
        photoURL: user.photoURL || "",
        phone: profile.phone || "",
        role: profile.role || "member",
        updatedAt: now,
      };

      // Check if document exists
      const snap = await getDoc(profileRef);

      if (snap.exists()) {
        // Update existing
        await updateDoc(profileRef, profileData);
      } else {
        // Create new with createdAt
        await setDoc(profileRef, {
          ...profileData,
          createdAt: now,
        });
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading profile...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-2xl space-y-6 py-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
          <p className="mt-1 text-gray-400">Manage your account and organization settings</p>
        </div>

        {/* Profile Card */}
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
          {/* Avatar & Basic Info */}
          <div className="mb-6 flex items-center gap-4">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "User"}
                className="h-16 w-16 rounded-full"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-800">
                <span className="text-2xl">👤</span>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-400">Email</p>
              <p className="text-lg font-semibold text-white">{user?.email}</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300">Display Name</label>
              <input
                type="text"
                name="displayName"
                value={profile.displayName || ""}
                onChange={handleChange}
                className="mt-2 w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                placeholder="Your display name"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-300">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={profile.phone || ""}
                onChange={handleChange}
                className="mt-2 w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-300">Role</label>
              <select
                name="role"
                value={profile.role || "member"}
                onChange={handleChange}
                className="mt-2 w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
              </select>
            </div>

            {/* Organization ID */}
            {orgId && (
              <div>
                <label className="block text-sm font-medium text-gray-300">Organization ID</label>
                <input
                  type="text"
                  value={orgId}
                  disabled
                  className="mt-2 w-full rounded border border-neutral-700 bg-neutral-800/50 px-3 py-2 text-gray-400"
                />
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 rounded bg-red-900/20 p-3 text-sm text-red-400">{error}</div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mt-4 rounded bg-green-900/20 p-3 text-sm text-green-400">
              Profile saved successfully! ✓
            </div>
          )}

          {/* Save Button */}
          <div className="mt-6">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-lg border border-red-900/50 bg-red-900/10 p-6">
          <h2 className="mb-2 text-lg font-semibold text-red-400">Danger Zone</h2>
          <p className="mb-4 text-sm text-gray-400">These actions cannot be undone.</p>
          <button className="rounded bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700">
            Delete Account
          </button>
        </div>
      </main>
    </ProtectedRoute>
  );
}
