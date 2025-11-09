// [P2][UI][CODE] Modal
// Tags: P2, UI, CODE
import { clsx } from "clsx";
import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

/**
 * A modal component that can be used to display content in a dialog box.
 *
 * @param {object} props - The props for the component.
 * @param {boolean} props.isOpen - Whether the modal is open or not.
 * @param {() => void} props.onClose - A function to be called when the modal is closed.
 * @param {string} [props.title] - The title of the modal.
 * @param {React.ReactNode} props.children - The content to be displayed inside the modal.
 * @param {'sm' | 'md' | 'lg' | 'xl'} [props.size=md] - The size of the modal.
 * @returns {JSX.Element | null} The rendered modal component or null if it's not open.
 */
export function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div
        className={clsx("relative mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl", {
          "max-w-sm": size === "sm",
          "max-w-md": size === "md",
          "max-w-lg": size === "lg",
          "max-w-2xl": size === "xl",
        })}
      >
        {title && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
        )}

        <div className="mb-4">{children}</div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
