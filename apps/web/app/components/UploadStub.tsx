// [P2][UI][CODE] UploadStub
// Tags: P2, UI, CODE
"use client";

import React from "react";

export default function UploadStub() {
  return (
    <div className="rounded border p-4 text-sm">
      <div className="font-semibold">Upload (Stub)</div>
      <p className="mb-2 opacity-80">This only captures a file and logs it — no storage SDK yet.</p>
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            console.warn("Selected file:", { name: file.name, size: file.size, type: file.type });
          }
        }}
      />
    </div>
  );
}
