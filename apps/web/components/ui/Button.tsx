// [P2][UI][CODE] Button
// Tags: P2, UI, CODE
"use client";

import * as React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center rounded-md font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-primary",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:outline-secondary",
  ghost: "bg-transparent text-foreground hover:bg-muted focus-visible:outline-muted",
  danger:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:outline-destructive",
  outline:
    "border border-border bg-transparent text-foreground hover:bg-muted focus-visible:outline-border",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${loading ? "cursor-wait opacity-75" : ""} ${className}`}
      {...props}
      disabled={loading || props.disabled}
    />
  );
}

export default Button;
