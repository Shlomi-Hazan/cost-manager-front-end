import { SUPPORTED_CURRENCIES } from "../constants/currencies.js";
import { getCachedExchangeRates } from "./exchangeRatesCache.js";
import { convertCurrency } from "../utils/currency.js";

const STORAGE_PREFIX = "cost-manager";

function isSupportedCurrency(currency) {
  return SUPPORTED_CURRENCIES.includes(currency);
}

function getCurrentDateParts() {
  const now = new Date();

  return {
    day: now.getDate(),
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    hour: now.getHours(),
    minute: now.getMinutes()
  };
}

function generateCostId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `cost-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function getStorageKey(databaseName, databaseVersion) {
  return `${STORAGE_PREFIX}:${encodeURIComponent(databaseName)}:v${databaseVersion}:costs`;
}

function validateDatabaseIdentity(databaseName, databaseVersion) {
  if (typeof databaseName !== "string") {
    throw new TypeError("databaseName must be a string.");
  }

  if (typeof databaseVersion !== "number" || !Number.isFinite(databaseVersion)) {
    throw new TypeError("databaseVersion must be a finite number.");
  }
}

function validateCost(cost) {
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

  if (typeof cost.description !== "string") {
    throw new TypeError("cost.description must be a string.");
  }
}

function validateCostId(id) {
  if (typeof id !== "string" || id.trim() === "") {
    throw new TypeError("id must be a non-empty string.");
  }
}

function isRealCalendarDate(day, month, year) {
  const candidate = new Date(0);

  candidate.setFullYear(year, month - 1, day);
  candidate.setHours(0, 0, 0, 0);

  return (
    candidate.getFullYear() === year &&
    candidate.getMonth() === month - 1 &&
    candidate.getDate() === day
  );
}

function validateCostDate(date) {
  if (date === null || typeof date !== "object" || Array.isArray(date)) {
    throw new TypeError("cost.date must be an object.");
  }

  const { day, month, year, hour, minute } = date;

  if (
    !Number.isInteger(day) ||
    !Number.isInteger(month) ||
    !Number.isInteger(year) ||
    !Number.isInteger(hour) ||
    !Number.isInteger(minute)
  ) {
    throw new TypeError("cost.date values must be integers.");
  }

  if (month < 1 || month > 12) {
    throw new TypeError("cost.date.month must be an integer from 1 to 12.");
  }

  if (!isRealCalendarDate(day, month, year)) {
    throw new TypeError("cost.date must be a real calendar date.");
  }

  if (hour < 0 || hour > 23) {
    throw new TypeError("cost.date.hour must be an integer from 0 to 23.");
  }

  if (minute < 0 || minute > 59) {
    throw new TypeError("cost.date.minute must be an integer from 0 to 59.");
  }
}

function validateEditableCost(cost) {
  validateCost(cost);
  validateCostDate(cost.date);
}

function validateReportArguments(currency, year, month) {
  if (!isSupportedCurrency(currency)) {
    throw new TypeError("currency must be one of USD, ILS, GBP, EURO.");
  }

  if (typeof year !== "number" || !Number.isInteger(year)) {
    throw new TypeError("year must be an integer.");
  }

  if (
    typeof month !== "number" ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    throw new TypeError("month must be an integer from 1 to 12.");
  }
}

function readCosts(storageKey) {
  const storedValue = localStorage.getItem(storageKey);

  if (storedValue === null) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(storedValue);

    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

function writeCosts(storageKey, costs) {
  localStorage.setItem(storageKey, JSON.stringify(costs));
}

function copyStoredCost(cost) {
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

function toReportCost(cost) {
  return {
    sum: cost.sum,
    currency: cost.currency,
    category: cost.category,
    description: cost.description,
    // Store day/month/year internally, but expose only day for the current
    // report shape to match the official example while OQ-002 remains open.
    date: {
      day: cost.date.day
    }
  };
}

function calculateSameCurrencyTotal(costs, targetCurrency) {
  const requiresConversion = costs.some((cost) => cost.currency !== targetCurrency);

  if (!requiresConversion) {
    return costs.reduce((total, cost) => total + cost.sum, 0);
  }

  const cachedRates = getCachedExchangeRates();

  if (cachedRates === null) {
    // getReport() remains synchronous; exchange rates must be fetched and cached
    // before cross-currency totals can be calculated.
    throw new Error(
      "Cross-currency report totals require cached exchange rates."
    );
  }

  return costs.reduce((total, cost) => {
    return total + convertCurrency(cost.sum, cost.currency, targetCurrency, cachedRates);
  }, 0);
}

function openCostsDB(databaseName, databaseVersion) {
  validateDatabaseIdentity(databaseName, databaseVersion);

  const storageKey = getStorageKey(databaseName, databaseVersion);

  return {
    addCost(cost) {
      validateCost(cost);

      const storedCost = {
        id: generateCostId(),
        sum: cost.sum,
        currency: cost.currency,
        category: cost.category,
        description: cost.description,
        date: getCurrentDateParts()
      };
      const costs = readCosts(storageKey);

      writeCosts(storageKey, [...costs, storedCost]);

      return copyStoredCost(storedCost);
    },

    getAllCosts() {
      return readCosts(storageKey).map(copyStoredCost);
    },

    getCostById(id) {
      validateCostId(id);

      const matchingCost = readCosts(storageKey).find((cost) => cost.id === id);

      return matchingCost ? copyStoredCost(matchingCost) : null;
    },

    updateCost(id, cost) {
      validateCostId(id);

      const costs = readCosts(storageKey);
      const costIndex = costs.findIndex((storedCost) => storedCost.id === id);

      if (costIndex === -1) {
        return null;
      }

      validateEditableCost(cost);

      const updatedCost = {
        id,
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

      costs[costIndex] = updatedCost;
      writeCosts(storageKey, costs);

      return copyStoredCost(updatedCost);
    },

    deleteCost(id) {
      validateCostId(id);

      const costs = readCosts(storageKey);
      const costIndex = costs.findIndex((storedCost) => storedCost.id === id);

      if (costIndex === -1) {
        return null;
      }

      const [deletedCost] = costs.splice(costIndex, 1);

      writeCosts(storageKey, costs);

      return copyStoredCost(deletedCost);
    },

    getReport(currency, year, month) {
      const currentDate = getCurrentDateParts();
      const reportYear = year ?? currentDate.year;
      const reportMonth = month ?? currentDate.month;

      validateReportArguments(currency, reportYear, reportMonth);

      const matchingCosts = readCosts(storageKey).filter((cost) => {
        return cost.date?.year === reportYear && cost.date?.month === reportMonth;
      });

      return {
        year: reportYear,
        month: reportMonth,
        costs: matchingCosts.map(toReportCost),
        total: {
          currency,
          sum: calculateSameCurrencyTotal(matchingCosts, currency)
        }
      };
    }
  };
}

export const db = {
  openCostsDB
};
