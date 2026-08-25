import { formatDisplayAmount } from "./amountFormat.js";

export function addCategoryShare(chartData) {
  const total = chartData.reduce((sum, entry) => sum + entry.total, 0);

  return chartData.map((entry) => ({
    ...entry,
    percentage: total > 0 ? entry.total / total : 0
  }));
}

export function shouldShowPieSliceLabel(entry) {
  return entry.percentage >= 0.05;
}

export function formatPositiveBarValueLabel(value) {
  return value > 0 ? formatDisplayAmount(value) : "";
}
