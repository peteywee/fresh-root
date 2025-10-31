"use client";

import * as React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const base =
  "inline-flex items-center justify-center rounded-2xl px-3 py-2 text-sm font-semibold transition";
const variants: Record<Variant, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400",
  secondary:
    "bg-neutral-800 text-gray-100 hover:bg-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500",
  ghost:
    "bg-transparent text-gray-200 hover:bg-neutral-900/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700",
  danger:
    "bg-rose-600 text-white hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

export default function Button({
  variant = "primary",
  loading,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${loading ? "cursor-wait opacity-75" : ""} ${className}`}
      {...props}
      disabled={loading || props.disabled}
    />
  );
}
