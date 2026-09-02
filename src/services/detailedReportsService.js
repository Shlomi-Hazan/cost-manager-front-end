/*
 * TEAM EXTENSION: our db.js's required getReport() returns each cost with
 * only { day } in its date, matching the official report-item example.
 * OQ-002 is resolved — the lecturer confirmed this { day }-only shape is
 * correct (see docs/REQUIREMENTS.md) — and with the row's own sum/currency
 * un-converted. The team's Monthly/Yearly report screens want the FULL
 * stored date/time for display and sorting, so this module reads the raw
 * costs via db.js's getAllCosts() extension for the row data, while still
 * getting the required total from getReport() itself — the required
 * getReport() contract and its return shape are never modified.
 */
import { buildYearlyMonthlyTotals } from "../utils/yearlyAggregation.js";

// Full-detail copy (all date/time fields) for the app's own report tables,
// as opposed to db.js's own toReportCost() which intentionally exposes only
// { day } to match the official report shape.
function copyDetailedCost(cost) {
  return {
    id: cost.id,
    sum: cost.sum,
    currency: cost.currency,
    category: cost.category,
    description: cost.description,
    date: {
      day: cost.date.day,
      month: cost.date.month,
      year: cost.date.year,
      hour: cost.date.hour,
      minute: cost.date.minute
    }
  };
}

// Course-required total (R-050 to R-053), presented with team-extension row
// detail. `total` is copied straight from the required getReport() output,
// so the required conversion/rounding behavior is never duplicated here.
export function buildDetailedMonthlyReport(database, currency, year, month) {
  const costs = database
    .getAllCosts()
    .filter((cost) => cost.date.year === year && cost.date.month === month)
    .map(copyDetailedCost);
  const monthlyReport = database.getReport(currency, year, month);

  return {
    year,
    month,
    costs,
    total: {
      currency: monthlyReport.total.currency,
      sum: monthlyReport.total.sum
    }
  };
}

// TEAM EXTENSION (X-005): a full-year report, built on top of the required
// per-month getReport() calls rather than as a separate parallel
// implementation — the yearly total is just the sum of 12 required monthly
// totals, each already correctly converted to `currency`.
export function buildDetailedYearlyReport(database, currency, year) {
  const costs = database
    .getAllCosts()
    .filter((cost) => cost.date.year === year)
    .map(copyDetailedCost);
  const monthlyTotals = buildYearlyMonthlyTotals(
    (reportCurrency, reportYear, reportMonth) =>
      database.getReport(reportCurrency, reportYear, reportMonth),
    currency,
    year
  );
  const yearlyTotal = monthlyTotals.reduce((total, month) => {
    return total + month.total;
  }, 0);

  return {
    year,
    costs,
    total: {
      currency,
      sum: yearlyTotal
    }
  };
}
