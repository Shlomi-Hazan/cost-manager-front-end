/*
 * Presentation-only number formatting for reports/charts. Rounding here
 * never feeds back into a calculation — totals are always computed from
 * full-precision values (see currency.js), and these functions only decide
 * how a number looks on screen.
 */

/**
 * Whole numbers display with no decimals; converted amounts (which are
 * rarely round) keep up to 6 fraction digits so small currency differences
 * remain visible rather than being rounded away.
 * @param {number} amount - Amount to format.
 * @returns {string} Display-ready amount string.
 */
export function formatDisplayAmount(amount) {
  return Number.isInteger(amount)
    ? String(amount)
    : amount.toLocaleString('en-US', {
        maximumFractionDigits: 6
      });
}

/**
 * @param {number} ratio - A 0-1 fraction, e.g. a category's share of a Pie
 *   Chart total.
 * @returns {string} ratio formatted as a percentage string.
 */
export function formatDisplayPercentage(ratio) {
  return `${(ratio * 100).toLocaleString('en-US', {
    maximumFractionDigits: 1
  })}%`;
}
