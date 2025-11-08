// [P0][APP][CODE] Page page component
// Tags: P0, APP, CODE
"use client";

import React from "react";

import ProtectedRoute from "../../components/ProtectedRoute";

export default function StaffInviteBlocked() {
  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-2xl p-6 text-center">
        <h1 className="mb-4 text-2xl font-semibold">You need an invite</h1>
        <p className="text-sm">
          It looks like you're staff. Please ask your administrator for an invite link to join the
          team.
        </p>
      </div>
    </ProtectedRoute>
  );
}
