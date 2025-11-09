// [P2][APP][CODE] Page page component
// Tags: P2, APP, CODE
"use client";

import React from "react";

import ProtectedRoute from "@/app/components/ProtectedRoute";

/**
 * A client-side component that displays a message to the user,
 * informing them that their email address has not yet been verified.
 *
 * @returns {JSX.Element} The rendered "email not verified" page.
 */
export default function EmailNotVerified() {
  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-2xl p-6 text-center">
        <h1 className="mb-4 text-2xl font-semibold">Email not verified</h1>
        <p className="text-sm">
          Please verify your email address before continuing with onboarding. Check your inbox for a
          verification email.
        </p>
      </div>
    </ProtectedRoute>
  );
}
