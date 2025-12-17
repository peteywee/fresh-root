// [P2][APP][CODE] Billing
// Tags: P2, APP, CODE

export interface ShiftPayBreakdown {
  regularPay: number;
  overtimePay: number;
  totalPay: number;
  overtimeMinutes: number;
}

export interface CalculateShiftPayParams {
  durationMinutes: number;
  hourlyRate: number;
  overtimeRules?: {
    overtimeThresholdMinutes: number;
    overtimeMultiplier: number;
  };
}

/**
 * Calculate pay for a shift, including overtime if applicable.
 */
export function calculateShiftPay({
  durationMinutes,
  hourlyRate,
  overtimeRules,
}: CalculateShiftPayParams): ShiftPayBreakdown {
  let regularMinutes = durationMinutes;
  let overtimeMinutes = 0;

  if (overtimeRules && durationMinutes > overtimeRules.overtimeThresholdMinutes) {
    regularMinutes = overtimeRules.overtimeThresholdMinutes;
    overtimeMinutes = durationMinutes - regularMinutes;
  }

  const regularPay = (regularMinutes / 60) * hourlyRate;
  const overtimePay = overtimeRules
    ? (overtimeMinutes / 60) * hourlyRate * overtimeRules.overtimeMultiplier
    : 0;

  return {
    regularPay: Math.round(regularPay * 100) / 100,
    overtimePay: Math.round(overtimePay * 100) / 100,
    totalPay: Math.round((regularPay + overtimePay) * 100) / 100,
    overtimeMinutes,
  };
}
