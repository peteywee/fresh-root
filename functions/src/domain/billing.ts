/**
 * Pure billing domain logic.
 *
 * NOTE:
 *  - NO Firebase imports.
 *  - This file should be safe to reuse from frontend or other runtimes.
 */

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export interface OvertimeRules {
  /**
   * Threshold in minutes after which overtime starts.
   * Example: 480 minutes = 8 hours.
   */
  overtimeThresholdMinutes: number;

  /**
   * Multiplier for overtime.
   * Example: 1.5 = "time and a half".
   */
  overtimeMultiplier: number;
}

export interface ShiftPayInput {
  /**
   * Total worked minutes for this shift.
   */
  durationMinutes: number;

  /**
   * Base hourly rate in the account's currency.
   */
  hourlyRate: number;

  /**
   * Optional overtime rules. If omitted, no overtime is applied.
   */
  overtimeRules?: OvertimeRules;
}

export interface ShiftPayBreakdown {
  /**
   * Regular pay (before overtime).
   */
  regularPay: number;

  /**
   * Overtime pay (if any).
   */
  overtimePay: number;

  /**
   * Total pay = regularPay + overtimePay
   */
  totalPay: number;

  /**
   * Total minutes counted as overtime.
   */
  overtimeMinutes: number;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Safely round to 2 decimal places for currency representation.
 */
function roundToCents(amount: number): number {
  return Number(amount.toFixed(2));
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Calculate pay for a single shift.
 *
 * All inputs are plain numbers (minutes and hourly rate) to avoid Date/Timezone
 * complexity and to keep this logic 100% deterministic and testable.
 */
export function calculateShiftPay(input: ShiftPayInput): ShiftPayBreakdown {
  const { durationMinutes, hourlyRate, overtimeRules } = input;

  if (durationMinutes <= 0 || hourlyRate <= 0) {
    return {
      regularPay: 0,
      overtimePay: 0,
      totalPay: 0,
      overtimeMinutes: 0,
    };
  }

  if (!overtimeRules) {
    const regular = (durationMinutes / 60) * hourlyRate;
    const total = roundToCents(regular);
    return {
      regularPay: total,
      overtimePay: 0,
      totalPay: total,
      overtimeMinutes: 0,
    };
  }

  const threshold = overtimeRules.overtimeThresholdMinutes;
  const multiplier = overtimeRules.overtimeMultiplier;

  const regularMinutes = Math.min(durationMinutes, threshold);
  const overtimeMinutes =
    durationMinutes > threshold ? durationMinutes - threshold : 0;

  const regularPay = (regularMinutes / 60) * hourlyRate;
  const overtimePay = (overtimeMinutes / 60) * hourlyRate * multiplier;

  const roundedRegular = roundToCents(regularPay);
  const roundedOvertime = roundToCents(overtimePay);
  const total = roundToCents(roundedRegular + roundedOvertime);

  return {
    regularPay: roundedRegular,
    overtimePay: roundedOvertime,
    totalPay: total,
    overtimeMinutes,
  };
}
