/*
 * Course requirement: the yearly Bar Chart shows a total for all twelve
 * months of a selected year, in a selected currency, with months that have
 * no costs still appearing as zero rather than being omitted (R-080/R-081).
 * This builds that fixed 12-entry structure by delegating each month's
 * total to the required db.js getReport() — it does not re-implement
 * currency conversion or filtering itself.
 */

export const yearlyMonths = [
  { month: 1, label: 'January', shortLabel: 'Jan' },
  { month: 2, label: 'February', shortLabel: 'Feb' },
  { month: 3, label: 'March', shortLabel: 'Mar' },
  { month: 4, label: 'April', shortLabel: 'Apr' },
  { month: 5, label: 'May', shortLabel: 'May' },
  { month: 6, label: 'June', shortLabel: 'Jun' },
  // Second half of the year.
  { month: 7, label: 'July', shortLabel: 'Jul' },
  { month: 8, label: 'August', shortLabel: 'Aug' },
  { month: 9, label: 'September', shortLabel: 'Sep' },
  { month: 10, label: 'October', shortLabel: 'Oct' },
  { month: 11, label: 'November', shortLabel: 'Nov' },
  { month: 12, label: 'December', shortLabel: 'Dec' }
];

/**
 * Calls the supplied report function (normally costsDatabase.getReport) once
 * per calendar month so every month is represented — including months with
 * zero matching costs, which still produce a valid report with total.sum
 * === 0 rather than being skipped.
 * @param {function} getMonthlyReport - (currency, year, month) => report,
 *   injected instead of importing costsDatabase directly, so this stays
 *   unit-testable with a fake report function and independent of db.js.
 * @param {string} currency - Currency to report each month's total in.
 * @param {number} year - Year to build monthly totals for.
 * @returns {object[]} One { month, label, shortLabel, total, currency }
 *   entry per calendar month, in order.
 */
export function buildYearlyMonthlyTotals(getMonthlyReport, currency, year) {
  if (typeof getMonthlyReport !== 'function') {
    throw new TypeError('getMonthlyReport must be a function.');
  }

  // One getReport() call per month; a zero-cost month still returns a
  // valid report object with total.sum === 0.
  return yearlyMonths.map((monthOption) => {
    const report = getMonthlyReport(currency, year, monthOption.month);

    return {
      month: monthOption.month,
      label: monthOption.label,
      shortLabel: monthOption.shortLabel,
      total: report.total.sum,
      currency: report.total.currency
    };
  });
}
