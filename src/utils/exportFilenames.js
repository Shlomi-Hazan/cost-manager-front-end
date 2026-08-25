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
