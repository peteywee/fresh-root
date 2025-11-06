//[P2][UI][CODE] Framer Motion animation variants and utilities
// Tags: P2, UI, CODE, animations, framer-motion

import type { Variants } from "framer-motion";

/**
 * Calendar view transition variants
 * Usage: <motion.div variants={calendarTransition} initial="initial" animate="animate" exit="exit">
 */
export const calendarTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeIn" } },
};

/**
 * Slide in from right (for modals, sidebars)
 */
export const slideInRight: Variants = {
  initial: { x: "100%", opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { x: "100%", opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
};

/**
 * Fade and scale (for dialogs, popovers)
 */
export const fadeScale: Variants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 0.2 } },
  exit: { scale: 0.95, opacity: 0, transition: { duration: 0.15 } },
};

/**
 * Stagger children animation (for lists)
 * Usage: parent has variants={staggerContainer}, children have variants={staggerItem}
 */
export const staggerContainer: Variants = {
  animate: { transition: { staggerChildren: 0.05 } },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

/**
 * Drag and drop feedback
 */
export const dragFeedback = {
  drag: {
    scale: 1.05,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    cursor: "grabbing",
  },
};

/**
 * Spring config presets for common interactions
 */
export const springs = {
  smooth: { type: "spring", stiffness: 300, damping: 30 },
  bouncy: { type: "spring", stiffness: 400, damping: 20 },
  snappy: { type: "spring", stiffness: 500, damping: 35 },
} as const;

/**
 * Hover and tap interactions for buttons
 */
export const buttonInteraction = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
};
