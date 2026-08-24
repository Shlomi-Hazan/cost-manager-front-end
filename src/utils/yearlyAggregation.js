export const YEARLY_MONTHS = [
  { month: 1, label: "January", shortLabel: "Jan" },
  { month: 2, label: "February", shortLabel: "Feb" },
  { month: 3, label: "March", shortLabel: "Mar" },
  { month: 4, label: "April", shortLabel: "Apr" },
  { month: 5, label: "May", shortLabel: "May" },
  { month: 6, label: "June", shortLabel: "Jun" },
  { month: 7, label: "July", shortLabel: "Jul" },
  { month: 8, label: "August", shortLabel: "Aug" },
  { month: 9, label: "September", shortLabel: "Sep" },
  { month: 10, label: "October", shortLabel: "Oct" },
  { month: 11, label: "November", shortLabel: "Nov" },
  { month: 12, label: "December", shortLabel: "Dec" }
];

export function buildYearlyMonthlyTotals(getMonthlyReport, currency, year) {
  if (typeof getMonthlyReport !== "function") {
    throw new TypeError("getMonthlyReport must be a function.");
  }

  return YEARLY_MONTHS.map((monthOption) => {
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
