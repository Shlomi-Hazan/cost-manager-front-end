const SUPPORTED_CURRENCIES = ["USD", "ILS", "GBP", "EURO"];
const STORAGE_PREFIX = "cost-manager";

function isSupportedCurrency(currency) {
  return SUPPORTED_CURRENCIES.includes(currency);
}

function getCurrentDateParts() {
  const now = new Date();

  return {
    day: now.getDate(),
    month: now.getMonth() + 1,
    year: now.getFullYear()
  };
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

  if (requiresConversion) {
    // Keep getReport() synchronous and fail clearly until exchange-rate support
    // exists, instead of returning a knowingly incorrect cross-currency total.
    throw new Error(
      "Cross-currency report totals require exchange-rate support from a later milestone."
    );
  }

  return costs.reduce((total, cost) => total + cost.sum, 0);
}

function openCostsDB(databaseName, databaseVersion) {
  validateDatabaseIdentity(databaseName, databaseVersion);

  const storageKey = getStorageKey(databaseName, databaseVersion);

  return {
    addCost(cost) {
      validateCost(cost);

      const storedCost = {
        sum: cost.sum,
        currency: cost.currency,
        category: cost.category,
        description: cost.description,
        date: getCurrentDateParts()
      };
      const costs = readCosts(storageKey);

      writeCosts(storageKey, [...costs, storedCost]);

      return { ...storedCost, date: { ...storedCost.date } };
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
