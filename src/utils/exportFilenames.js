/*
 * TEAM EXTENSION: deterministic, descriptive filenames for exported
 * report/chart files, so a filename alone tells the user which period and
 * currency the file covers (e.g. cost-manager-monthly-report-2026-08-usd.xlsx)
 * without needing to open it.
 */

function padMonth(month) {
  return String(month).padStart(2, "0");
}

function normalizeCurrency(currency) {
  return currency.toLowerCase();
}

export function getMonthlyReportExportFilename({ year, month, currency, extension }) {
  return `cost-manager-monthly-report-${year}-${padMonth(month)}-${normalizeCurrency(currency)}.${extension}`;
}

export function getYearlyReportExportFilename({ year, currency, extension }) {
  return `cost-manager-yearly-report-${year}-${normalizeCurrency(currency)}.${extension}`;
}

export function getPieChartExportFilename({ year, month, currency, extension }) {
  return `cost-manager-pie-chart-${year}-${padMonth(month)}-${normalizeCurrency(currency)}.${extension}`;
}

export function getBarChartExportFilename({ year, currency, extension }) {
  return `cost-manager-bar-chart-${year}-${normalizeCurrency(currency)}.${extension}`;
}
