import { formatDateForDisplay, formatTime } from "../../utils/dateTime.js";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

export function getMonthName(month) {
  return MONTH_NAMES[month - 1] ?? String(month);
}

function formatAmount(amount) {
  return Number.isInteger(amount)
    ? String(amount)
    : amount.toLocaleString("en-US", {
        maximumFractionDigits: 6
      });
}

function copyRows(rows) {
  return rows.map((row) => ({ ...row }));
}

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
    type: "monthly-report",
    title: "Monthly Report",
    summary: [
      ["Report Type", "Monthly Report"],
      ["Month", getMonthName(report.month)],
      ["Year", report.year],
      ["Target Currency", report.total.currency],
      ["Total", report.total.sum]
    ],
    metadata: {
      month: report.month,
      monthLabel: getMonthName(report.month),
      year: report.year,
      currency: report.total.currency,
      total: report.total.sum,
      totalLabel: `${formatAmount(report.total.sum)} ${report.total.currency}`
    },
    columns: ["Day", "Time", "Description", "Category", "Sum", "Currency"],
    rows
  };
}

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
    type: "yearly-report",
    title: "Yearly Report",
    summary: [
      ["Report Type", "Yearly Report"],
      ["Year", report.year],
      ["Target Currency", report.total.currency],
      ["Total", report.total.sum]
    ],
    metadata: {
      year: report.year,
      currency: report.total.currency,
      total: report.total.sum,
      totalLabel: `${formatAmount(report.total.sum)} ${report.total.currency}`
    },
    columns: ["Date", "Time", "Description", "Category", "Sum", "Currency"],
    rows
  };
}

export function buildPieChartExportModel({ report, chartData }) {
  const rows = chartData.map((entry) => ({
    category: entry.category,
    total: entry.total,
    currency: report.total.currency
  }));

  return {
    type: "pie-chart",
    title: "Monthly Category Pie Chart",
    summary: [
      ["Chart Type", "Monthly Category Pie Chart"],
      ["Month", getMonthName(report.month)],
      ["Year", report.year],
      ["Currency", report.total.currency]
    ],
    metadata: {
      month: report.month,
      monthLabel: getMonthName(report.month),
      year: report.year,
      currency: report.total.currency
    },
    columns: ["Category", "Total", "Currency"],
    rows
  };
}

export function buildBarChartExportModel({ yearlyResult }) {
  const rows = yearlyResult.monthlyTotals.map((entry) => ({
    month: entry.label,
    total: entry.total,
    currency: entry.currency
  }));

  return {
    type: "bar-chart",
    title: "Yearly 12-Month Bar Chart",
    summary: [
      ["Chart Type", "Yearly 12-Month Bar Chart"],
      ["Year", yearlyResult.year],
      ["Currency", yearlyResult.currency]
    ],
    metadata: {
      year: yearlyResult.year,
      currency: yearlyResult.currency
    },
    columns: ["Month", "Total", "Currency"],
    rows
  };
}

export function getModelRowsForPdf(model) {
  return copyRows(model.rows).map((row) => Object.values(row));
}
