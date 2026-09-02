/*
 * TEAM EXTENSION: builds one shared, presentation-ready "export model" per
 * report/chart type, consumed by BOTH excelExportService.js and
 * pdfExportService.js. This keeps the two export formats consistent (same
 * rows, same formatted values) without either exporter needing to know how
 * a report/chart's raw data is shaped.
 */
import { formatDateForDisplay, formatTime } from '../../utils/dateTime.js';
import {
  formatDisplayAmount,
  formatDisplayPercentage
} from '../../utils/amountFormat.js';
import { addCategoryShare } from '../../utils/chartPresentation.js';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

export function getMonthName(month) {
  return MONTH_NAMES[month - 1] ?? String(month);
}

function copyRows(rows) {
  return rows.map((row) => ({ ...row }));
}

function formatPdfCell(key, value) {
  if (key === 'sum' || key === 'total') {
    return formatDisplayAmount(value);
  }

  if (key === 'percentage') {
    return formatDisplayPercentage(value);
  }

  return value;
}

// Reshapes a Monthly Report + its raw costs into the generic { rows,
// summary, columns } model both the Excel and PDF exporters consume.
export function buildMonthlyReportExportModel({ report, costs }) {
  const rows = costs.map((cost) => ({
    day: cost.date.day,
    time: formatTime(cost.date),
    description: cost.description,
    category: cost.category,
    sum: cost.sum,
    currency: cost.currency
  }));

  return {
    type: 'monthly-report',
    title: 'Monthly Report',
    // Short human-readable summary lines shown above the data table.
    summary: [
      ['Period', `${getMonthName(report.month)} ${report.year}`],
      ['Report Currency', report.total.currency],
      ['Total', report.total.sum],
      ['Number of Costs', rows.length]
    ],
    metadata: {
      month: report.month,
      monthLabel: getMonthName(report.month),
      numberOfCosts: rows.length,
      periodLabel: `${getMonthName(report.month)} ${report.year}`,
      year: report.year,
      currency: report.total.currency,
      total: report.total.sum,
      totalLabel: `${formatDisplayAmount(report.total.sum)} ${report.total.currency}`
    },
    columns: ['Day', 'Time', 'Description', 'Category', 'Sum', 'Currency'],
    rows
  };
}

// Same shape as buildMonthlyReportExportModel, minus the month field
// (a yearly report row already carries its own full date).
export function buildYearlyReportExportModel({ report, costs }) {
  const rows = costs.map((cost) => ({
    date: formatDateForDisplay(cost.date),
    time: formatTime(cost.date),
    description: cost.description,
    category: cost.category,
    sum: cost.sum,
    currency: cost.currency
  }));

  return {
    type: 'yearly-report',
    title: 'Yearly Report',
    summary: [
      ['Year', report.year],
      ['Report Currency', report.total.currency],
      ['Total', report.total.sum],
      ['Number of Costs', rows.length]
    ],
    metadata: {
      numberOfCosts: rows.length,
      year: report.year,
      currency: report.total.currency,
      total: report.total.sum,
      totalLabel: `${formatDisplayAmount(report.total.sum)} ${report.total.currency}`
    },
    columns: ['Date', 'Time', 'Description', 'Category', 'Sum', 'Currency'],
    rows
  };
}

// Adds each category's percentage share before shaping rows for export.
export function buildPieChartExportModel({ report, chartData }) {
  const rows = addCategoryShare(chartData).map((entry) => ({
    category: entry.category,
    total: entry.total,
    percentage: entry.percentage,
    currency: report.total.currency
  }));
  const total = chartData.reduce((sum, entry) => sum + entry.total, 0);

  return {
    type: 'pie-chart',
    title: 'Monthly Category Pie Chart',
    summary: [
      ['Period', `${getMonthName(report.month)} ${report.year}`],
      ['Currency', report.total.currency],
      ['Total', total],
      ['Number of Categories', rows.length]
    ],
    // total here is computed above from chartData, not copied off `report`.
    metadata: {
      month: report.month,
      monthLabel: getMonthName(report.month),
      categoryCount: rows.length,
      periodLabel: `${getMonthName(report.month)} ${report.year}`,
      year: report.year,
      currency: report.total.currency,
      total,
      totalLabel: `${formatDisplayAmount(total)} ${report.total.currency}`
    },
    columns: ['Category', 'Total', 'Share', 'Currency'],
    rows
  };
}

export function buildBarChartExportModel({ yearlyResult }) {
  const rows = yearlyResult.monthlyTotals.map((entry) => ({
    month: entry.label,
    total: entry.total,
    currency: entry.currency
  }));
  const annualTotal = yearlyResult.monthlyTotals.reduce(
    (sum, entry) => sum + entry.total,
    0
  );
  const monthsWithCosts = yearlyResult.monthlyTotals.filter(
    (entry) => entry.total > 0
  ).length;

  return {
    type: 'bar-chart',
    title: 'Yearly 12-Month Bar Chart',
    summary: [
      ['Year', yearlyResult.year],
      ['Currency', yearlyResult.currency],
      ['Annual Total', annualTotal],
      ['Months With Costs', monthsWithCosts]
    ],
    metadata: {
      year: yearlyResult.year,
      currency: yearlyResult.currency,
      annualTotal,
      annualTotalLabel: `${formatDisplayAmount(annualTotal)} ${yearlyResult.currency}`,
      monthsWithCosts
    },
    columns: ['Month', 'Total', 'Currency'],
    rows
  };
}

export function getModelRowsForPdf(model) {
  return copyRows(model.rows).map((row) =>
    Object.entries(row).map(([key, value]) => formatPdfCell(key, value))
  );
}
