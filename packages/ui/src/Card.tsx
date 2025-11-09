// [P2][UI][CODE] Card
// Tags: P2, UI, CODE
import { clsx } from "clsx";
import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A container component that displays content in a card-like format.
 *
 * @param {object} props - The props for the component.
 * @param {React.ReactNode} props.children - The content to be displayed inside the card.
 * @param {string} [props.className] - Additional class names for custom styling.
 * @returns {JSX.Element} The rendered card component.
 */
export function Card({ children, className }: CardProps) {
  return (
    <div className={clsx("rounded-lg border bg-white p-6 shadow-sm", className)}>{children}</div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A header component for the Card.
 *
 * @param {object} props - The props for the component.
 * @param {React.ReactNode} props.children - The content of the header.
 * @param {string} [props.className] - Additional class names for custom styling.
 * @returns {JSX.Element} The rendered card header.
 */
export function CardHeader({ children, className }: CardHeaderProps) {
  return <div className={clsx("flex flex-col space-y-1.5 pb-4", className)}>{children}</div>;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A title component for the CardHeader.
 *
 * @param {object} props - The props for the component.
 * @param {React.ReactNode} props.children - The title text.
 * @param {string} [props.className] - Additional class names for custom styling.
 * @returns {JSX.Element} The rendered card title.
 */
export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={clsx("text-2xl font-semibold leading-none tracking-tight", className)}>
      {children}
    </h3>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * The main content area of a Card.
 *
 * @param {object} props - The props for the component.
 * @param {React.ReactNode} props.children - The content to be displayed.
 * @param {string} [props.className] - Additional class names for custom styling.
 * @returns {JSX.Element} The rendered card content.
 */
export function CardContent({ children, className }: CardContentProps) {
  return <div className={clsx("pt-0", className)}>{children}</div>;
}
