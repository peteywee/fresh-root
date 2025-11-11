// [P2][UI][CODE] Input
// Tags: P2, UI, CODE
"use client";

import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export default function Input({ label, hint, id, className = "", ...props }: InputProps) {
  const inputId = id ?? React.useId();
  return (
    <div className="grid gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm text-gray-300">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`rounded-2xl border border-neutral-800 bg-[#0e1117] px-3 py-2 text-sm ring-0 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 ${className}`}
        {...props}
      />
      {hint && <p className="text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}
