/*
 * Standalone Vanilla version of the required db.js library. This is the
 * exact kind of file the course grader loads directly via a plain
 * <script src="db.js"></script> tag with no bundler, no ES modules, and no
 * framework — so it must never gain an import/export statement or any other
 * dependency on Vite/React.
 *
 * It implements the SAME public contract and SAME internal behavior as the
 * module version (src/lib/db.js); only the wrapper syntax differs (an IIFE
 * assigning `db` onto the global object here, vs. `export const db` there).
 * Keep the two files' behavior mirrored — see src/lib/db.js's top comment
 * for the full required-contract explanation, repeated briefly below.
 *
 * Required public contract (must not change):
 *
 *   const ob = db.openCostsDB(databaseName, databaseVersion);
 *   ob.addCost({ sum, currency, category, description });
 *   ob.getReport(currency, year, month);
 *
 * getAllCosts/getCostById/updateCost/deleteCost are TEAM EXTENSIONS beyond
 * the official minimum, kept here only so this file has the same surface as
 * the module version — the official sample test only exercises
 * openCostsDB/addCost/getReport.
 */
(function exposeDb(global) {
  'use strict';

  const supportedCurrencies = ['USD', 'ILS', 'GBP', 'EURO'];
  const storagePrefix = 'cost-manager';
  // Must match the key used by src/lib/exchangeRatesCache.js exactly, since
  // this is how a standalone-loaded page and the React app would ever share
  // the same cached rates if they ran against the same localStorage origin.
  const exchangeRatesCacheKey = 'cost-manager:exchange-rates-cache';

  function isSupportedCurrency(currency) {
    return supportedCurrencies.indexOf(currency) !== -1;
  }

  // R-035: every cost gets its "added on" date automatically. Day/month/year
  // support the required getReport() date shape and month/year filtering;
  // hour/minute are a team extension mirrored from the module version for
  // parity, even though nothing in this standalone file's own test harness
  // displays them.
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

  // TEAM EXTENSION: a stable per-cost id, so two otherwise-identical costs
  // can still be edited/deleted independently. Falls back to a
  // timestamp+random string where crypto.randomUUID() is unavailable.
  function generateCostId() {
    if (global.crypto && typeof global.crypto.randomUUID === 'function') {
      return global.crypto.randomUUID();
    }

    return (
      'cost-' +
      Date.now().toString(36) +
      '-' +
      Math.random().toString(36).slice(2)
    );
  }

  // Maps a (databaseName, databaseVersion) pair to its localStorage key.
  // Both arguments genuinely change where data lives, matching the module
  // version's behavior.
  function getStorageKey(databaseName, databaseVersion) {
    return (
      storagePrefix +
      ':' +
      encodeURIComponent(databaseName) +
      ':v' +
      databaseVersion +
      ':costs'
    );
  }

  function validateDatabaseIdentity(databaseName, databaseVersion) {
    if (typeof databaseName !== 'string') {
      throw new TypeError('databaseName must be a string.');
    }

    if (typeof databaseVersion !== 'number' || !Number.isFinite(databaseVersion)) {
      throw new TypeError('databaseVersion must be a finite number.');
    }
  }

  // Validates only what the course document actually documents for
  // addCost()'s input (sum: Number, currency/category/description: String,
  // plus a supported currency). No extra rules such as "sum must be
  // positive" are enforced here, since the official spec does not state
  // them (see OQ-005 in docs/REQUIREMENTS.md) and the grader may rely on
  // that documented type-only contract.
  function validateCost(cost) {
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

    if (typeof cost.description !== 'string') {
      throw new TypeError('cost.description must be a string.');
    }
  }

  // TEAM EXTENSION — guards the id-based CRUD helpers below.
  function validateCostId(id) {
    if (typeof id !== 'string' || id.trim() === '') {
      throw new TypeError('id must be a non-empty string.');
    }
  }

  // Confirms day/month/year form a real calendar date (rejects e.g. 31
  // February) by letting Date normalize the input and checking whether it
  // rolled over into a different date than what was requested.
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

  // TEAM EXTENSION — full date/time validation, used only by updateCost().
  function validateCostDate(date) {
    if (date === null || typeof date !== 'object' || Array.isArray(date)) {
      throw new TypeError('cost.date must be an object.');
    }

    const day = date.day;
    const month = date.month;
    const year = date.year;
    const hour = date.hour;
    const minute = date.minute;

    if (
      !Number.isInteger(day) ||
      !Number.isInteger(month) ||
      !Number.isInteger(year) ||
      !Number.isInteger(hour) ||
      !Number.isInteger(minute)
    ) {
      throw new TypeError('cost.date values must be integers.');
    }

    if (month < 1 || month > 12) {
      throw new TypeError('cost.date.month must be an integer from 1 to 12.');
    }

    if (!isRealCalendarDate(day, month, year)) {
      throw new TypeError('cost.date must be a real calendar date.');
    }

    if (hour < 0 || hour > 23) {
      throw new TypeError('cost.date.hour must be an integer from 0 to 23.');
    }

    if (minute < 0 || minute > 59) {
      throw new TypeError('cost.date.minute must be an integer from 0 to 59.');
    }
  }

  function validateEditableCost(cost) {
    validateCost(cost);
    validateCostDate(cost.date);
  }

  function validateReportArguments(currency, year, month) {
    if (!isSupportedCurrency(currency)) {
      throw new TypeError('currency must be one of USD, ILS, GBP, EURO.');
    }

    if (typeof year !== 'number' || !Number.isInteger(year)) {
      throw new TypeError('year must be an integer.');
    }

    if (
      typeof month !== 'number' ||
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12
    ) {
      throw new TypeError('month must be an integer from 1 to 12.');
    }
  }

  // Malformed-storage recovery: missing, non-JSON, or non-array stored data
  // all quietly resolve to an empty cost list instead of throwing, so a
  // corrupted localStorage entry degrades to "no costs yet" rather than
  // crashing the standalone test harness.
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

  // Returns a defensive copy (including full internal date/time) rather than
  // the stored object reference, so callers cannot accidentally mutate what
  // is sitting in localStorage.
  function copyStoredCost(cost) {
    return {
      id: cost.id,
      sum: cost.sum,
      currency: cost.currency,
      category: cost.category,
      description: cost.description,
      // Full internal date/time, unlike toReportCost()'s { day }-only shape.
      date: {
        day: cost.date.day,
        month: cost.date.month,
        year: cost.date.year,
        hour: cost.date.hour,
        minute: cost.date.minute
      }
    };
  }

  // Mirrors src/utils/currency.js's validateExchangeRates(): the official
  // rate model is "units of this currency per 1 USD", e.g.
  // { USD: 1, GBP: 0.6, EURO: 0.7, ILS: 3.4 }. This is duplicated here
  // (rather than imported) because this file must remain standalone with no
  // module dependencies.
  function validateExchangeRates(rates) {
    if (rates === null || typeof rates !== 'object' || Array.isArray(rates)) {
      throw new TypeError('Exchange rates must be an object.');
    }

    supportedCurrencies.forEach(function validateRate(currency) {
      if (!Object.hasOwn(rates, currency)) {
        throw new TypeError('Exchange rates must include ' + currency + '.');
      }

      if (typeof rates[currency] !== 'number' || !Number.isFinite(rates[currency])) {
        throw new TypeError(
          'Exchange rate for ' + currency + ' must be a finite number.'
        );
      }

      if (rates[currency] <= 0) {
        throw new TypeError(
          'Exchange rate for ' + currency + ' must be greater than zero.'
        );
      }
    });

    if (rates.USD !== 1) {
      throw new TypeError('Exchange rate for USD must be exactly 1.');
    }

    return supportedCurrencies.reduce(function copyRate(validatedRates, currency) {
      validatedRates[currency] = rates[currency];

      return validatedRates;
    }, {});
  }

  // Reads the exchange-rate cache that the hosting page (if any) previously
  // populated. This file never performs its own Fetch — see the "why
  // getReport() remains synchronous" note above calculateSameCurrencyTotal()
  // below, and src/lib/exchangeRatesCache.js for the full rationale shared
  // with the module version.
  function getCachedExchangeRates() {
    const storedValue = localStorage.getItem(exchangeRatesCacheKey);

    if (storedValue === null) {
      return null;
    }

    try {
      return validateExchangeRates(JSON.parse(storedValue));
    } catch {
      return null;
    }
  }

  // Same conversion formula as src/utils/currency.js's convertCurrency():
  // every rate is "units per 1 USD", so converting source -> target is
  // amount / rates[source] (source -> USD) then * rates[target]
  // (USD -> target), collapsed into one expression.
  function convertCurrency(amount, sourceCurrency, targetCurrency, rates) {
    if (typeof amount !== 'number' || !Number.isFinite(amount)) {
      throw new TypeError('amount must be a finite number.');
    }

    if (!isSupportedCurrency(sourceCurrency)) {
      throw new TypeError('sourceCurrency must be one of USD, ILS, GBP, EURO.');
    }

    if (!isSupportedCurrency(targetCurrency)) {
      throw new TypeError('targetCurrency must be one of USD, ILS, GBP, EURO.');
    }

    const validatedRates = validateExchangeRates(rates);

    return (amount / validatedRates[sourceCurrency]) * validatedRates[targetCurrency];
  }

  function toReportCost(cost) {
    return {
      sum: cost.sum,
      currency: cost.currency,
      category: cost.category,
      description: cost.description,
      // Store day/month/year internally, but expose only day for the report
      // shape, matching the official example. OQ-002 is resolved — the
      // lecturer confirmed this { day }-only shape is correct (see
      // docs/REQUIREMENTS.md).
      date: {
        day: cost.date.day
      }
    };
  }

  // Computes a report's total in one target currency while leaving every
  // row's own sum/currency untouched (R-036). If every matching cost is
  // already in the target currency, no rates lookup happens at all — this
  // is exactly why the official same-currency sample (200 USD + 400 USD,
  // getReport("USD")) passes even with no exchange-rate cache populated,
  // which matters because this standalone file may be tested with no
  // hosting application (and therefore no cache) ever having run.
  function calculateSameCurrencyTotal(costs, targetCurrency) {
    const requiresConversion = costs.some(function hasDifferentCurrency(cost) {
      return cost.currency !== targetCurrency;
    });

    if (!requiresConversion) {
      return costs.reduce(function addCostToTotal(total, cost) {
        return total + cost.sum;
      }, 0);
    }

    const cachedRates = getCachedExchangeRates();

    if (cachedRates === null) {
      // getReport() remains synchronous; exchange rates must be fetched and cached
      // before cross-currency totals can be calculated.
      throw new Error(
        'Cross-currency report totals require cached exchange rates.'
      );
    }

    return costs.reduce(function addCostToTotal(total, cost) {
      return total + convertCurrency(cost.sum, cost.currency, targetCurrency, cachedRates);
    }, 0);
  }

  /**
   * Required entry point of the protected db.js contract. Returns a fresh
   * database object bound to one (databaseName, databaseVersion) storage key.
   * @param {string} databaseName - Name of the costs database.
   * @param {number} databaseVersion - Version of the costs database.
   * @returns {object} Database object exposing addCost/getReport (required)
   *   plus getAllCosts/getCostById/updateCost/deleteCost (team extensions).
   */
  function openCostsDB(databaseName, databaseVersion) {
    validateDatabaseIdentity(databaseName, databaseVersion);
    const storageKey = getStorageKey(databaseName, databaseVersion);

    return {
      /**
       * Required method. Stores a new cost item, stamping on a generated id
       * (team extension) and the automatic added-on date (R-035).
       * @param {object} cost - The cost to add.
       * @param {number} cost.sum - Cost amount.
       * @param {string} cost.currency - One of USD, ILS, GBP, EURO.
       * @param {string} cost.category - Free-text category.
       * @param {string} cost.description - Free-text description.
       * @returns {object} The stored cost, including its generated id/date
       *   alongside the four required properties (extra properties beyond
       *   those four are not addressed by the official spec; see OQ in
       *   docs/REQUIREMENTS.md).
       */
      addCost: function addCost(cost) {
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

        writeCosts(storageKey, costs.concat([storedCost]));

        return copyStoredCost(storedCost);
      },

      /**
       * TEAM EXTENSION — not exercised by the official compatibility test.
       * @returns {object[]} Every stored cost, each with its full internal
       *   date/time (unlike getReport()'s { day }-only report shape).
       */
      getAllCosts: function getAllCosts() {
        return readCosts(storageKey).map(copyStoredCost);
      },

      /**
       * TEAM EXTENSION — not exercised by the official compatibility test.
       * @param {string} id - Id of the cost to look up.
       * @returns {object|null} The matching cost, or null if no cost has
       *   this id.
       */
      getCostById: function getCostById(id) {
        validateCostId(id);

        const matchingCost = readCosts(storageKey).find(function hasMatchingId(cost) {
          return cost.id === id;
        });

        return matchingCost ? copyStoredCost(matchingCost) : null;
      },

      /**
       * TEAM EXTENSION — full-record edit, preserving the original id.
       * @param {string} id - Id of the cost to update.
       * @param {object} cost - Full editable payload: sum, currency,
       *   category, description, and date ({ day, month, year, hour, minute }).
       * @returns {object|null} The updated cost, or null for an unknown id
       *   (expected outcome, not an error); a malformed id or payload still
       *   throws via validation.
       */
      updateCost: function updateCost(id, cost) {
        validateCostId(id);

        const costs = readCosts(storageKey);
        const costIndex = costs.findIndex(function hasMatchingId(storedCost) {
          return storedCost.id === id;
        });

        if (costIndex === -1) {
          return null;
        }

        validateEditableCost(cost);

        // Full editable payload replaces the stored record; id is kept.
        const updatedCost = {
          id: id,
          sum: cost.sum,
          currency: cost.currency,
          category: cost.category,
          description: cost.description,
          // Full internal date/time, unlike toReportCost()'s { day }-only shape.
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

      /**
       * TEAM EXTENSION — id-based so two otherwise-identical costs can be
       * deleted independently.
       * @param {string} id - Id of the cost to delete.
       * @returns {object|null} The deleted cost, or null if no cost has
       *   this id.
       */
      deleteCost: function deleteCost(id) {
        validateCostId(id);

        const costs = readCosts(storageKey);
        const costIndex = costs.findIndex(function hasMatchingId(storedCost) {
          return storedCost.id === id;
        });

        if (costIndex === -1) {
          return null;
        }

        const deletedCost = costs.splice(costIndex, 1)[0];
        writeCosts(storageKey, costs);

        return copyStoredCost(deletedCost);
      },

      /**
       * Required method of the protected db.js contract.
       * @param {string} currency - Currency to report the total in; one of
       *   USD, ILS, GBP, EURO.
       * @param {number} [year] - Report year; defaults to the current year
       *   (R-052) when omitted, matching the official `ob.getReport("USD")`
       *   sample.
       * @param {number} [month] - Report month (1-12); defaults to the
       *   current month when omitted.
       * @returns {object} { year, month, costs, total }: rows keep their
       *   original sum/currency and an official-shape { day } date, while
       *   `total` is calculated in the requested currency.
       */
      getReport: function getReport(currency, year, month) {
        const currentDate = getCurrentDateParts();
        const reportYear = year ?? currentDate.year;
        const reportMonth = month ?? currentDate.month;

        validateReportArguments(currency, reportYear, reportMonth);

        const matchingCosts = readCosts(storageKey).filter(function isInReportMonth(cost) {
          return (
            cost.date &&
            cost.date.year === reportYear &&
            cost.date.month === reportMonth
          );
        });

        // total is the only converted value; costs keep their own currency (R-036).
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

  // Exposes the required global `db` when this file is loaded with a plain
  // <script src="db.js"></script> tag (R-062) — no export/import syntax, so
  // this line is the only thing a consuming page needs.
  global.db = {
    openCostsDB: openCostsDB
  };
})(globalThis);
