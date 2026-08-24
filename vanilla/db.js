(function exposeDb(global) {
  "use strict";

  var SUPPORTED_CURRENCIES = ["USD", "ILS", "GBP", "EURO"];
  var STORAGE_PREFIX = "cost-manager";
  var EXCHANGE_RATES_CACHE_KEY = "cost-manager:exchange-rates-cache";

  function isSupportedCurrency(currency) {
    return SUPPORTED_CURRENCIES.indexOf(currency) !== -1;
  }

  function getCurrentDateParts() {
    var now = new Date();

    return {
      day: now.getDate(),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      hour: now.getHours(),
      minute: now.getMinutes()
    };
  }

  function generateCostId() {
    if (global.crypto && typeof global.crypto.randomUUID === "function") {
      return global.crypto.randomUUID();
    }

    return (
      "cost-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2)
    );
  }

  function getStorageKey(databaseName, databaseVersion) {
    return (
      STORAGE_PREFIX +
      ":" +
      encodeURIComponent(databaseName) +
      ":v" +
      databaseVersion +
      ":costs"
    );
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
    var candidate = new Date(0);

    candidate.setFullYear(year, month - 1, day);
    candidate.setHours(0, 0, 0, 0);

    return (
      candidate.getFullYear() === year &&
      candidate.getMonth() === month - 1 &&
      candidate.getDate() === day
    );
  }

  function validateCostDate(date) {
    var day;
    var month;
    var year;
    var hour;
    var minute;

    if (date === null || typeof date !== "object" || Array.isArray(date)) {
      throw new TypeError("cost.date must be an object.");
    }

    day = date.day;
    month = date.month;
    year = date.year;
    hour = date.hour;
    minute = date.minute;

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
    var storedValue = localStorage.getItem(storageKey);
    var parsedValue;

    if (storedValue === null) {
      return [];
    }

    try {
      parsedValue = JSON.parse(storedValue);

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

  function validateExchangeRates(rates) {
    if (rates === null || typeof rates !== "object" || Array.isArray(rates)) {
      throw new TypeError("Exchange rates must be an object.");
    }

    SUPPORTED_CURRENCIES.forEach(function validateRate(currency) {
      if (!Object.hasOwn(rates, currency)) {
        throw new TypeError("Exchange rates must include " + currency + ".");
      }

      if (typeof rates[currency] !== "number" || !Number.isFinite(rates[currency])) {
        throw new TypeError(
          "Exchange rate for " + currency + " must be a finite number."
        );
      }

      if (rates[currency] <= 0) {
        throw new TypeError(
          "Exchange rate for " + currency + " must be greater than zero."
        );
      }
    });

    if (rates.USD !== 1) {
      throw new TypeError("Exchange rate for USD must be exactly 1.");
    }

    return SUPPORTED_CURRENCIES.reduce(function copyRate(validatedRates, currency) {
      validatedRates[currency] = rates[currency];

      return validatedRates;
    }, {});
  }

  function getCachedExchangeRates() {
    var storedValue = localStorage.getItem(EXCHANGE_RATES_CACHE_KEY);

    if (storedValue === null) {
      return null;
    }

    try {
      return validateExchangeRates(JSON.parse(storedValue));
    } catch {
      return null;
    }
  }

  function convertCurrency(amount, sourceCurrency, targetCurrency, rates) {
    var validatedRates;

    if (typeof amount !== "number" || !Number.isFinite(amount)) {
      throw new TypeError("amount must be a finite number.");
    }

    if (!isSupportedCurrency(sourceCurrency)) {
      throw new TypeError("sourceCurrency must be one of USD, ILS, GBP, EURO.");
    }

    if (!isSupportedCurrency(targetCurrency)) {
      throw new TypeError("targetCurrency must be one of USD, ILS, GBP, EURO.");
    }

    validatedRates = validateExchangeRates(rates);

    return (amount / validatedRates[sourceCurrency]) * validatedRates[targetCurrency];
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
    var requiresConversion = costs.some(function hasDifferentCurrency(cost) {
      return cost.currency !== targetCurrency;
    });
    var cachedRates;

    if (!requiresConversion) {
      return costs.reduce(function addCostToTotal(total, cost) {
        return total + cost.sum;
      }, 0);
    }

    cachedRates = getCachedExchangeRates();

    if (cachedRates === null) {
      // getReport() remains synchronous; exchange rates must be fetched and cached
      // before cross-currency totals can be calculated.
      throw new Error(
        "Cross-currency report totals require cached exchange rates."
      );
    }

    return costs.reduce(function addCostToTotal(total, cost) {
      return total + convertCurrency(cost.sum, cost.currency, targetCurrency, cachedRates);
    }, 0);
  }

  function openCostsDB(databaseName, databaseVersion) {
    var storageKey;

    validateDatabaseIdentity(databaseName, databaseVersion);
    storageKey = getStorageKey(databaseName, databaseVersion);

    return {
      addCost: function addCost(cost) {
        var storedCost;
        var costs;

        validateCost(cost);

        storedCost = {
          id: generateCostId(),
          sum: cost.sum,
          currency: cost.currency,
          category: cost.category,
          description: cost.description,
          date: getCurrentDateParts()
        };
        costs = readCosts(storageKey);

        writeCosts(storageKey, costs.concat([storedCost]));

        return copyStoredCost(storedCost);
      },

      getAllCosts: function getAllCosts() {
        return readCosts(storageKey).map(copyStoredCost);
      },

      getCostById: function getCostById(id) {
        var matchingCost;

        validateCostId(id);

        matchingCost = readCosts(storageKey).find(function hasMatchingId(cost) {
          return cost.id === id;
        });

        return matchingCost ? copyStoredCost(matchingCost) : null;
      },

      updateCost: function updateCost(id, cost) {
        var costs;
        var costIndex;
        var updatedCost;

        validateCostId(id);
        validateEditableCost(cost);

        costs = readCosts(storageKey);
        costIndex = costs.findIndex(function hasMatchingId(storedCost) {
          return storedCost.id === id;
        });

        if (costIndex === -1) {
          return null;
        }

        updatedCost = {
          id: id,
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

      deleteCost: function deleteCost(id) {
        var costs;
        var costIndex;
        var deletedCost;

        validateCostId(id);

        costs = readCosts(storageKey);
        costIndex = costs.findIndex(function hasMatchingId(storedCost) {
          return storedCost.id === id;
        });

        if (costIndex === -1) {
          return null;
        }

        deletedCost = costs.splice(costIndex, 1)[0];
        writeCosts(storageKey, costs);

        return copyStoredCost(deletedCost);
      },

      getReport: function getReport(currency, year, month) {
        var currentDate = getCurrentDateParts();
        var reportYear = year == null ? currentDate.year : year;
        var reportMonth = month == null ? currentDate.month : month;
        var matchingCosts;

        validateReportArguments(currency, reportYear, reportMonth);

        matchingCosts = readCosts(storageKey).filter(function isInReportMonth(cost) {
          return (
            cost.date &&
            cost.date.year === reportYear &&
            cost.date.month === reportMonth
          );
        });

        return {
          year: reportYear,
          month: reportMonth,
          costs: matchingCosts.map(toReportCost),
          total: {
            currency: currency,
            sum: calculateSameCurrencyTotal(matchingCosts, currency)
          }
        };
      }
    };
  }

  global.db = {
    openCostsDB: openCostsDB
  };
})(globalThis);
