// [P2][UI][CODE] Alert
// Tags: P2, UI, CODE
"use client";

import { clsx } from "clsx";
import React from "react";

export interface AlertProps {
  type?: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

/**
 * Alert component for displaying messages to users
 *
 * @example
 * ```tsx
 * <Alert type="success" title="Success" message="Profile updated successfully!" />
 * ```
 */
export function Alert({ type = "info", title, message, onClose, className }: AlertProps) {
  const typeStyles = {
    success: {
      container: "bg-green-50 border-green-200",
      icon: "text-green-600",
      title: "text-green-800",
      message: "text-green-700",
    },
    error: {
      container: "bg-red-50 border-red-200",
      icon: "text-red-600",
      title: "text-red-800",
      message: "text-red-700",
    },
    warning: {
      container: "bg-yellow-50 border-yellow-200",
      icon: "text-yellow-600",
      title: "text-yellow-800",
      message: "text-yellow-700",
    },
    info: {
      container: "bg-blue-50 border-blue-200",
      icon: "text-blue-600",
      title: "text-blue-800",
      message: "text-blue-700",
    },
  };

  const icons = {
    success: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    error: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    warning: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    ),
    info: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  };

  const styles = typeStyles[type];

  return (
    <div className={clsx("rounded-lg border p-4", styles.container, className)} role="alert">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className={clsx("h-5 w-5", styles.icon)}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {icons[type]}
          </svg>
        </div>
        <div className="ml-3 flex-1">
          {title && <h3 className={clsx("text-sm font-medium", styles.title)}>{title}</h3>}
          <p className={clsx("text-sm", title ? "mt-1" : "", styles.message)}>{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-3 inline-flex flex-shrink-0 text-gray-400 hover:text-gray-500"
            aria-label="Close"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
