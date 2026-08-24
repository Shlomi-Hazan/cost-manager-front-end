import { isSupportedCurrency, convertCurrency } from "./currency.js";

function validateCostForAggregation(cost) {
  if (cost === null || typeof cost !== "object") {
    throw new TypeError("cost must be an object.");
  }

  if (typeof cost.sum !== "number" || !Number.isFinite(cost.sum)) {
    throw new TypeError("cost.sum must be a finite number.");
  }

  if (!isSupportedCurrency(cost.currency)) {
    throw new TypeError("cost.currency must be one of USD, ILS, GBP, EURO.");
  }

  if (typeof cost.category !== "string") {
    throw new TypeError("cost.category must be a string.");
  }
}

export function aggregateCostsByCategory(costs, targetCurrency, rates) {
  if (!Array.isArray(costs)) {
    throw new TypeError("costs must be an array.");
  }

  if (!isSupportedCurrency(targetCurrency)) {
    throw new TypeError("targetCurrency must be one of USD, ILS, GBP, EURO.");
  }

  const totalsByCategory = new Map();

  costs.forEach((cost) => {
    validateCostForAggregation(cost);

    if (cost.currency !== targetCurrency && rates == null) {
      throw new Error(
        "Exchange rates are required for mixed-currency chart aggregation."
      );
    }

    const value =
      cost.currency === targetCurrency
        ? cost.sum
        : convertCurrency(cost.sum, cost.currency, targetCurrency, rates);

    totalsByCategory.set(
      cost.category,
      (totalsByCategory.get(cost.category) ?? 0) + value
    );
  });

  return Array.from(totalsByCategory, ([category, total]) => ({
    category,
    total
  }));
}
