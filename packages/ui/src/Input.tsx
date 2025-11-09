// [P2][UI][CODE] Input
// Tags: P2, UI, CODE
import { clsx } from "clsx";
import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

/**
 * A customizable input component with error handling.
 *
 * @param {object} props - The props for the component.
 * @param {string} [props.className] - Additional class names for custom styling.
 * @param {string} [props.type=text] - The type of the input field.
 * @param {string} [props.error] - An error message to be displayed below the input.
 * @param {React.Ref<HTMLInputElement>} ref - A ref to be forwarded to the input element.
 * @returns {JSX.Element} The rendered input component.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <input
          type={type}
          className={clsx(
            "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus-visible:ring-red-500",
            className,
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
