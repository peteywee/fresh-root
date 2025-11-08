// [P2][APP][CODE] Page page component
// Tags: P2, APP, CODE
"use client";

import React from "react";

import ProtectedRoute from "../../../components/ProtectedRoute";

export default function NetworkPending() {
  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-2xl p-6 text-center">
        <h1 className="mb-4 text-2xl font-semibold">Network pending verification</h1>
        <p className="text-sm">
          Your network is pending verification. You may have to wait for manual review. We'll notify
          you when it's active.
        </p>
      </div>
    </ProtectedRoute>
  );
}
