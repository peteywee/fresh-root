// [P1][TEST][TEST] ComputeLaborBudget Test tests
// Tags: P1, TEST, TEST
import { describe, it, expect } from "vitest";

import { computeLaborBudget } from "./computeLaborBudget";

describe("computeLaborBudget", () => {
  it("computes dollars and hours for typical inputs", () => {
    const result = computeLaborBudget(10000, 20, 25); // $10k sales, 20%, $25/hr
    // allowedDollars = 10000 * 0.2 = 2000
    // allowedHours = 2000 / 25 = 80
    expect(result.allowedDollars).toBeCloseTo(2000);
    expect(result.allowedHours).toBeCloseTo(80);
  });

  it("handles zero sales producing zero budget", () => {
    const result = computeLaborBudget(0, 15, 30);
    expect(result.allowedDollars).toBe(0);
    expect(result.allowedHours).toBe(0);
  });

  it("throws for negative forecast sales", () => {
    expect(() => computeLaborBudget(-1, 15, 25)).toThrow(/forecastSales/);
  });

  it("throws for laborPercent out of range", () => {
    expect(() => computeLaborBudget(1000, -5, 25)).toThrow(/laborPercent/);
    expect(() => computeLaborBudget(1000, 105, 25)).toThrow(/laborPercent/);
  });

  it("throws for non-positive avgWage", () => {
    expect(() => computeLaborBudget(1000, 20, 0)).toThrow(/avgWage/);
  });
});
