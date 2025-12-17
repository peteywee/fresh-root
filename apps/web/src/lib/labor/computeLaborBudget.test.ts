// [P1][TEST][BUSINESS] Labor Budget Computation Tests
// Tags: P1, TEST, BUSINESS, LABOR, BUDGETING

import { describe, it, expect } from "vitest";
import { computeLaborBudget } from "./computeLaborBudget";

describe("computeLaborBudget", () => {
  // ===========================================================================
  // HAPPY PATH TESTS
  // ===========================================================================
  describe("Happy Path", () => {
    it("LABOR-001: calculates allowedDollars correctly (forecastSales * laborPercent/100)", () => {
      const result = computeLaborBudget(10000, 25, 15);
      // 10000 * (25/100) = 2500
      expect(result.allowedDollars).toBe(2500);
    });

    it("LABOR-002: calculates allowedHours correctly (allowedDollars / avgWage)", () => {
      const result = computeLaborBudget(10000, 25, 15);
      // 2500 / 15 = 166.666...
      expect(result.allowedHours).toBeCloseTo(166.67, 2);
    });

    it("LABOR-003: handles zero forecast sales", () => {
      const result = computeLaborBudget(0, 25, 15);
      expect(result.allowedDollars).toBe(0);
      expect(result.allowedHours).toBe(0);
    });

    it("LABOR-004: handles zero labor percent", () => {
      const result = computeLaborBudget(10000, 0, 15);
      expect(result.allowedDollars).toBe(0);
      expect(result.allowedHours).toBe(0);
    });

    it("LABOR-005: handles 100% labor percent", () => {
      const result = computeLaborBudget(10000, 100, 20);
      expect(result.allowedDollars).toBe(10000);
      expect(result.allowedHours).toBe(500); // 10000 / 20
    });

    it("LABOR-006: handles small values correctly", () => {
      const result = computeLaborBudget(100, 10, 10);
      // 100 * 0.1 = 10 dollars, 10 / 10 = 1 hour
      expect(result.allowedDollars).toBe(10);
      expect(result.allowedHours).toBe(1);
    });

    it("LABOR-007: handles large values correctly", () => {
      const result = computeLaborBudget(1000000, 30, 25);
      // 1000000 * 0.3 = 300000 dollars, 300000 / 25 = 12000 hours
      expect(result.allowedDollars).toBe(300000);
      expect(result.allowedHours).toBe(12000);
    });

    it("LABOR-008: handles decimal values", () => {
      const result = computeLaborBudget(9876.54, 23.5, 17.25);
      // 9876.54 * 0.235 = 2320.9869
      // 2320.9869 / 17.25 = 134.55...
      expect(result.allowedDollars).toBeCloseTo(2320.99, 2);
      expect(result.allowedHours).toBeCloseTo(134.55, 2);
    });
  });

  // ===========================================================================
  // INPUT VALIDATION TESTS
  // ===========================================================================
  describe("Input Validation", () => {
    describe("forecastSales validation", () => {
      it("LABOR-009: throws RangeError for negative forecastSales", () => {
        expect(() => computeLaborBudget(-100, 25, 15)).toThrow(RangeError);
        expect(() => computeLaborBudget(-100, 25, 15)).toThrow(
          "forecastSales must be a finite number >= 0"
        );
      });

      it("LABOR-010: throws RangeError for NaN forecastSales", () => {
        expect(() => computeLaborBudget(NaN, 25, 15)).toThrow(RangeError);
      });

      it("LABOR-011: throws RangeError for Infinity forecastSales", () => {
        expect(() => computeLaborBudget(Infinity, 25, 15)).toThrow(RangeError);
      });

      it("LABOR-012: throws RangeError for -Infinity forecastSales", () => {
        expect(() => computeLaborBudget(-Infinity, 25, 15)).toThrow(RangeError);
      });
    });

    describe("laborPercent validation", () => {
      it("LABOR-013: throws RangeError for negative laborPercent", () => {
        expect(() => computeLaborBudget(10000, -5, 15)).toThrow(RangeError);
        expect(() => computeLaborBudget(10000, -5, 15)).toThrow(
          "laborPercent must be a finite number in [0, 100]"
        );
      });

      it("LABOR-014: throws RangeError for laborPercent > 100", () => {
        expect(() => computeLaborBudget(10000, 101, 15)).toThrow(RangeError);
      });

      it("LABOR-015: throws RangeError for NaN laborPercent", () => {
        expect(() => computeLaborBudget(10000, NaN, 15)).toThrow(RangeError);
      });

      it("LABOR-016: throws RangeError for Infinity laborPercent", () => {
        expect(() => computeLaborBudget(10000, Infinity, 15)).toThrow(RangeError);
      });
    });

    describe("avgWage validation", () => {
      it("LABOR-017: throws RangeError for zero avgWage", () => {
        expect(() => computeLaborBudget(10000, 25, 0)).toThrow(RangeError);
        expect(() => computeLaborBudget(10000, 25, 0)).toThrow(
          "avgWage must be a finite number > 0"
        );
      });

      it("LABOR-018: throws RangeError for negative avgWage", () => {
        expect(() => computeLaborBudget(10000, 25, -15)).toThrow(RangeError);
      });

      it("LABOR-019: throws RangeError for NaN avgWage", () => {
        expect(() => computeLaborBudget(10000, 25, NaN)).toThrow(RangeError);
      });

      it("LABOR-020: throws RangeError for Infinity avgWage", () => {
        expect(() => computeLaborBudget(10000, 25, Infinity)).toThrow(RangeError);
      });
    });
  });

  // ===========================================================================
  // EDGE CASE TESTS
  // ===========================================================================
  describe("Edge Cases", () => {
    it("LABOR-021: handles very small avgWage (minimum wage scenario)", () => {
      const result = computeLaborBudget(10000, 25, 7.25);
      // 2500 / 7.25 = 344.83
      expect(result.allowedDollars).toBe(2500);
      expect(result.allowedHours).toBeCloseTo(344.83, 2);
    });

    it("LABOR-022: handles very high avgWage (executive scenario)", () => {
      const result = computeLaborBudget(10000, 25, 100);
      // 2500 / 100 = 25 hours
      expect(result.allowedHours).toBe(25);
    });

    it("LABOR-023: handles boundary laborPercent at exactly 100", () => {
      const result = computeLaborBudget(10000, 100, 20);
      expect(result.allowedDollars).toBe(10000);
      expect(result.allowedHours).toBe(500);
    });

    it("LABOR-024: handles boundary laborPercent at exactly 0", () => {
      const result = computeLaborBudget(10000, 0, 20);
      expect(result.allowedDollars).toBe(0);
      expect(result.allowedHours).toBe(0);
    });

    it("LABOR-025: handles very small positive values (precision test)", () => {
      const result = computeLaborBudget(0.01, 1, 0.01);
      // 0.01 * 0.01 = 0.0001 dollars
      // 0.0001 / 0.01 = 0.01 hours
      expect(result.allowedDollars).toBeCloseTo(0.0001, 4);
      expect(result.allowedHours).toBeCloseTo(0.01, 4);
    });

    it("LABOR-026: handles realistic restaurant scenario", () => {
      // Typical restaurant: $15,000 daily sales, 28% labor, $16 avg wage
      const result = computeLaborBudget(15000, 28, 16);
      // 15000 * 0.28 = 4200 dollars
      // 4200 / 16 = 262.5 hours
      expect(result.allowedDollars).toBe(4200);
      expect(result.allowedHours).toBe(262.5);
    });

    it("LABOR-027: handles realistic retail scenario", () => {
      // Typical retail: $8,000 daily sales, 15% labor, $14 avg wage
      const result = computeLaborBudget(8000, 15, 14);
      // 8000 * 0.15 = 1200 dollars
      // 1200 / 14 = 85.71 hours
      expect(result.allowedDollars).toBe(1200);
      expect(result.allowedHours).toBeCloseTo(85.71, 2);
    });
  });

  // ===========================================================================
  // REGRESSION TESTS
  // ===========================================================================
  describe("Regression Tests", () => {
    it("LABOR-028: returns object with exactly two properties", () => {
      const result = computeLaborBudget(10000, 25, 15);
      expect(Object.keys(result)).toHaveLength(2);
      expect(result).toHaveProperty("allowedDollars");
      expect(result).toHaveProperty("allowedHours");
    });

    it("LABOR-029: returns number types for both values", () => {
      const result = computeLaborBudget(10000, 25, 15);
      expect(typeof result.allowedDollars).toBe("number");
      expect(typeof result.allowedHours).toBe("number");
    });

    it("LABOR-030: does not mutate input values", () => {
      let forecast = 10000;
      let percent = 25;
      let wage = 15;
      computeLaborBudget(forecast, percent, wage);
      expect(forecast).toBe(10000);
      expect(percent).toBe(25);
      expect(wage).toBe(15);
    });
  });

  // ===========================================================================
  // FORMULA VERIFICATION TESTS
  // ===========================================================================
  describe("Formula Verification", () => {
    it("LABOR-031: verifies formula: allowedDollars = forecastSales * (laborPercent / 100)", () => {
      const testCases = [
        { forecast: 10000, percent: 25, expected: 2500 },
        { forecast: 50000, percent: 30, expected: 15000 },
        { forecast: 25000, percent: 20, expected: 5000 },
        { forecast: 100000, percent: 35, expected: 35000 },
      ];

      testCases.forEach(({ forecast, percent, expected }) => {
        const result = computeLaborBudget(forecast, percent, 15);
        expect(result.allowedDollars).toBe(expected);
      });
    });

    it("LABOR-032: verifies formula: allowedHours = allowedDollars / avgWage", () => {
      const testCases = [
        { dollars: 2500, wage: 25, expected: 100 },
        { dollars: 15000, wage: 15, expected: 1000 },
        { dollars: 5000, wage: 20, expected: 250 },
        { dollars: 35000, wage: 35, expected: 1000 },
      ];

      testCases.forEach(({ dollars, wage, expected }) => {
        // Set up to get the exact allowedDollars we want
        const result = computeLaborBudget(dollars, 100, wage);
        expect(result.allowedHours).toBe(expected);
      });
    });
  });
});
