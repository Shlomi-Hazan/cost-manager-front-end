/*
 * Course requirement: the monthly Pie Chart groups a month's costs by
 * category and shows each category's total in a single selected currency
 * (R-070/R-071). This module contains only the aggregation math — no React,
 * no chart-library code — so it can be unit tested independently and reused
 * by both the on-screen chart and its Excel/PDF export.
 */
import { isSupportedCurrency, convertCurrency } from './currency.js';
import { getCategoryDisplayName, getCategoryKey } from './category.js';

function validateCostForAggregation(cost) {
  if (cost === null || typeof cost !== 'object') {
    throw new TypeError('cost must be an object.');
  }

  if (typeof cost.sum !== 'number' || !Number.isFinite(cost.sum)) {
    throw new TypeError('cost.sum must be a finite number.');
  }

  if (!isSupportedCurrency(cost.currency)) {
    throw new TypeError('cost.currency must be one of USD, ILS, GBP, EURO.');
  }

  if (typeof cost.category !== 'string') {
    throw new TypeError('cost.category must be a string.');
  }
}

/**
 * Sums `costs` into one total per category, converting each cost's amount
 * into targetCurrency along the way (the chart only ever displays converted
 * totals, unlike report rows which keep their original currency). Category
 * names are grouped case-insensitively via getCategoryKey() so "Food" and
 * "food" contribute to the same slice (see category.js), while the category
 * label shown to the user is its normalized display form.
 * @param {object[]} costs - Costs to aggregate.
 * @param {string} targetCurrency - Currency to convert every total into.
 * @param {object} [rates] - Exchange rates; required only if costs mix
 *   currencies.
 * @returns {object[]} One { category, total } entry per distinct category.
 */
export function aggregateCostsByCategory(costs, targetCurrency, rates) {
  if (!Array.isArray(costs)) {
    throw new TypeError('costs must be an array.');
  }

  if (!isSupportedCurrency(targetCurrency)) {
    throw new TypeError('targetCurrency must be one of USD, ILS, GBP, EURO.');
  }

  const totalsByCategory = new Map();

  costs.forEach((cost) => {
    validateCostForAggregation(cost);

    // Rates are only required once a cost actually needs converting; a
    // same-currency month can still be charted with no rates cache at all.
    if (cost.currency !== targetCurrency && (rates === null || rates === undefined)) {
      throw new Error(
        'Exchange rates are required for mixed-currency chart aggregation.'
      );
    }

    const value =
      cost.currency === targetCurrency
        ? cost.sum
        : convertCurrency(cost.sum, cost.currency, targetCurrency, rates);

    const categoryKey = getCategoryKey(cost.category);
    const currentCategory = totalsByCategory.get(categoryKey);

    totalsByCategory.set(categoryKey, {
      category: currentCategory?.category ?? getCategoryDisplayName(cost.category),
      total: (currentCategory?.total ?? 0) + value
    });
  });

  return Array.from(totalsByCategory.values());
}
