import { buildYearlyMonthlyTotals } from "../utils/yearlyAggregation.js";

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
