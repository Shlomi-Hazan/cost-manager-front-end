/*
 * TEAM EXTENSION: small presentation-only helpers shared by the Pie and Bar
 * charts. None of this affects the underlying aggregated totals — it only
 * decides what gets rendered/labeled and how.
 */
import { formatDisplayAmount } from './amountFormat.js';

/**
 * Adds each category's share of the chart's total (0 when the chart total
 * is 0, so an all-zero month renders without dividing by zero) — used for
 * the Pie Chart's legend/tooltip text.
 * @param {object[]} chartData - Category totals from aggregateCostsByCategory.
 * @returns {object[]} chartData entries, each with an added `percentage`.
 */
export function addCategoryShare(chartData) {
  const total = chartData.reduce((sum, entry) => sum + entry.total, 0);

  return chartData.map((entry) => ({
    ...entry,
    percentage: total > 0 ? entry.total / total : 0
  }));
}

// Hides in-slice text labels below 5% share, since a very thin Pie slice has
// no room to render readable text without overlapping its neighbors.
export function shouldShowPieSliceLabel(entry) {
  return entry.percentage >= 0.05;
}

// The yearly Bar Chart must still show a zero-valued bar for empty months
// (R-080), but printing a "0" label on every empty bar would clutter the
// chart, so only positive totals get a visible value label.
export function formatPositiveBarValueLabel(value) {
  return value > 0 ? formatDisplayAmount(value) : '';
}
