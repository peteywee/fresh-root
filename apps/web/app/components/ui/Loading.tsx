// [P2][UI][CODE] Loading
// Tags: P2, UI, CODE
import { clsx } from "clsx";
import React from "react";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Spinner component for loading states
 *
 * @example
 * ```tsx
 * <Spinner size="md" />
 * ```
 */
export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizeStyles = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <svg
      className={clsx("animate-spin text-blue-600", sizeStyles[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export interface LoadingProps {
  text?: string;
  fullScreen?: boolean;
}

/**
 * Loading component with spinner and optional text
 *
 * @example
 * ```tsx
 * <Loading text="Loading data..." />
 * ```
 */
export function Loading({ text = "Loading...", fullScreen = false }: LoadingProps) {
  const containerClasses = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <Spinner size="lg" />
        {text && <p className="mt-4 text-sm text-gray-600">{text}</p>}
      </div>
    </div>
  );
}
