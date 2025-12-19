// [P0][TEST][EDGE-CASES] Edge Case Testing Utilities
// Tags: P0, TEST, EDGE-CASES, FUTURE-PROOF
// Created: 2025-12-17
// Purpose: Comprehensive adversarial input testing for 10+ year maintainability
//
// ARCHITECTURE NOTES FOR FUTURE MAINTAINERS:
// =========================================
// 1. All edge case generators are pure functions - no side effects
// 2. Each category is independently extensible
// 3. Test data is deterministic for reproducibility
// 4. Designed to work with any validation library (Zod, Yup, Joi, etc.)
// 5. Export patterns follow ES modules - should remain stable
//
// TO EXTEND: Add new generators to the appropriate category object
// TO CUSTOMIZE: Override defaults via function parameters
// TO DEBUG: Each generator has a `label` field explaining the test case

export * from "./generators";
export * from "./validators";
export * from "./matchers";
export * from "./schemas";
