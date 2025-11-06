// [P2][UI][CODE] Card
// Tags: P2, UI, CODE
import { clsx } from "clsx";
import React from "react";

export interface CardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
  variant?: "default" | "bordered" | "elevated";
}

/**
 * Card component for displaying content in a contained, styled box
 *
 * @example
 * ```tsx
 * <Card title="User Profile" description="View and edit your profile">
 *   <p>Content goes here</p>
 * </Card>
 * ```
 */
export function Card({
  title,
  description,
  children,
  className,
  footer,
  variant = "default",
}: CardProps) {
  const variantStyles = {
    default: "bg-white border border-gray-200",
    bordered: "bg-white border-2 border-gray-300",
    elevated: "bg-white shadow-lg",
  };

  return (
    <div className={clsx("overflow-hidden rounded-lg", variantStyles[variant], className)}>
      {(title || description) && (
        <div className="border-b border-gray-200 px-6 py-4">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
      {footer && <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">{footer}</div>}
    </div>
  );
}
