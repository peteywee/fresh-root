import { describe, it, expect } from "vitest";
import { calculateShiftPay } from "./billing";

describe("calculateShiftPay", () => {
  it("should calculate regular pay correctly", () => {
    const result = calculateShiftPay({
      durationMinutes: 480, // 8 hours
      hourlyRate: 20,
    });

    expect(result).toEqual({
      regularPay: 160,
      overtimePay: 0,
      totalPay: 160,
      overtimeMinutes: 0,
    });
  });

  it("should calculate overtime pay correctly", () => {
    const result = calculateShiftPay({
      durationMinutes: 600, // 10 hours
      hourlyRate: 20,
      overtimeRules: {
        overtimeThresholdMinutes: 480, // 8 hours
        overtimeMultiplier: 1.5,
      },
    });

    // Regular: 8 hours * 20 = 160
    // Overtime: 2 hours * 20 * 1.5 = 60
    // Total: 220

    expect(result).toEqual({
      regularPay: 160,
      overtimePay: 60,
      totalPay: 220,
      overtimeMinutes: 120,
    });
  });

  it("should handle no overtime when threshold not met", () => {
    const result = calculateShiftPay({
      durationMinutes: 400, // 6 hours 40 mins
      hourlyRate: 20,
      overtimeRules: {
        overtimeThresholdMinutes: 480,
        overtimeMultiplier: 1.5,
      },
    });

    // 400/60 = 6.666... * 20 = 133.333...
    // Rounded to 2 decimals: 133.33

    expect(result).toEqual({
      regularPay: 133.33,
      overtimePay: 0,
      totalPay: 133.33,
      overtimeMinutes: 0,
    });
  });
});
