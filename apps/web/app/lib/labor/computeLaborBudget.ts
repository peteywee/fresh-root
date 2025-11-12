// [P2][APP][LABOR] Compute allowed labor dollars and hours from the sales forecast
// Tags: labor, scheduling, budgeting, utility

/**
 * Contract
 * - Inputs
 *   - forecastSales: number (>= 0)
 *   - laborPercent: number (0..100)
 *   - avgWage: number (> 0)
 * - Output
 *   - { allowedDollars: number, allowedHours: number }
 * - Error modes
 *   - Throws RangeError for invalid inputs
 * - Success criteria
 *   - allowedDollars = forecastSales * (laborPercent / 100)
 *   - allowedHours = allowedDollars / avgWage
 */
export function computeLaborBudget(
  forecastSales: number,
  laborPercent: number,
  avgWage: number,
): { allowedDollars: number; allowedHours: number } {
  // Validate inputs with explicit, predictable errors
  if (!Number.isFinite(forecastSales) || forecastSales < 0) {
    throw new RangeError("forecastSales must be a finite number >= 0");
  }
  if (!Number.isFinite(laborPercent) || laborPercent < 0 || laborPercent > 100) {
    throw new RangeError("laborPercent must be a finite number in [0, 100]");
  }
  if (!Number.isFinite(avgWage) || avgWage <= 0) {
    throw new RangeError("avgWage must be a finite number > 0");
  }

  const allowedDollars = forecastSales * (laborPercent / 100);
  const allowedHours = allowedDollars / avgWage;

  return { allowedDollars, allowedHours };
}

export default computeLaborBudget;
