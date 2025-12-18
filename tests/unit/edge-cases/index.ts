// [P0][TEST][INDEX] Edge Case Testing Infrastructure
// Tags: P0, TEST, EDGE-CASES, BARREL
// Created: 2025-12-17
// Purpose: Central export for edge case testing utilities

// Generators
export {
  numericEdgeCases,
  timestampEdgeCases,
  stringEdgeCases,
  injectionEdgeCases,
  arrayEdgeCases,
  nestedObjectEdgeCases,
  nullishEdgeCases,
  typeCoercionEdgeCases,
  getEdgeCasesByCategory,
  getEdgeCasesBySeverity,
  getSecurityEdgeCases,
  type LabeledValue,
  type EdgeCaseCategory,
} from "./generators.js";

// Validators
export {
  validateEdgeCase,
  validateEdgeCases,
  CommonFieldEdgeCases,
  printValidationSummary,
  type ValidationResult,
  type ValidationSummary,
} from "./validators.js";

// Schemas
export {
  SafeStringSchema,
  SafeEmailSchema,
  SafePositiveIntegerSchema,
  SafeTimestampSchema,
  SafeUUIDSchema,
  SafeObjectSchema,
  DateRangeInputSchema,
  hasPrototypePollution,
} from "./schemas.js";

// Matchers
export {
  toBeRejectedBySchema,
  toBeAcceptedBySchema,
  toHandleEdgeCases,
  toHandleCriticalEdgeCases,
  registerEdgeCaseMatchers,
} from "./matchers.js";
