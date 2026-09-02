/*
 * Module-compatible version of the required db.js library (see also
 * vanilla/db.js, the standalone version submitted separately for grading).
 * Both files implement the SAME public contract and the SAME internal
 * behavior; only the module wrapper syntax differs (import/export here vs.
 * a global IIFE there). If you change behavior in one file, mirror it in
 * the other, or the two versions will silently drift apart.
 *
 * Required public contract (must not change):
 *
 *   const ob = db.openCostsDB(databaseName, databaseVersion);
 *   ob.addCost({ sum, currency, category, description });
 *   ob.getReport(currency, year, month);
 *
 * getReport() lives on the object returned by openCostsDB(), not on `db`
 * itself — the official course document was corrected to `ob.getReport(...)`
 * rather than `db.getReport(...)`, and this module follows that correction.
 *
 * Everything else exported from the returned object (getAllCosts,
 * getCostById, updateCost, deleteCost) is a TEAM EXTENSION used to power the
 * Manage Costs screen. The course Q&A explicitly allows extra db.js
 * functions, but the four required properties on `cost` — sum, currency,
 * category, description — and the required method signatures above are
 * treated as a protected, external contract throughout this file.
 */
import { SUPPORTED_CURRENCIES } from '../constants/currencies.js';
import { getCachedExchangeRates } from './exchangeRatesCache.js';
import { convertCurrency } from '../utils/currency.js';

const STORAGE_PREFIX = 'cost-manager';

function isSupportedCurrency(currency) {
  return SUPPORTED_CURRENCIES.includes(currency);
}

// R-035: every cost gets its "added on" date automatically, from the
// system clock, rather than from caller input. Day/month/year are what the
// required getReport() date shape and month/year filtering need; hour/minute
// are a team extension (see X-004) used only in the app's own detailed
// reports, never returned from the official getReport() report-item shape.
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

// TEAM EXTENSION (X-001): a stable per-cost id. Without it, two costs that
// happen to share identical sum/currency/category/description could not be
// distinguished for editing or deleting one specific row in Manage Costs.
// crypto.randomUUID() is preferred; the fallback exists only for older
// environments where it might be unavailable.
function generateCostId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `cost-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

// The localStorage key a given (databaseName, databaseVersion) pair maps to.
// Both arguments genuinely affect where data is stored (rather than being
// accepted and ignored), so opening the database with a different name or
// version starts from a separate, empty cost list.
function getStorageKey(databaseName, databaseVersion) {
  return `${STORAGE_PREFIX}:${encodeURIComponent(databaseName)}:v${databaseVersion}:costs`;
}

function validateDatabaseIdentity(databaseName, databaseVersion) {
  if (typeof databaseName !== 'string') {
    throw new TypeError('databaseName must be a string.');
  }

  if (typeof databaseVersion !== 'number' || !Number.isFinite(databaseVersion)) {
    throw new TypeError('databaseVersion must be a finite number.');
  }
}

// Validates only what the official spec actually documents for addCost()'s
// input: sum is a number, currency/category/description are strings, and
// currency must be one of the four required identifiers. Deliberately does
// NOT add extra rules (e.g. sum > 0, non-empty strings) that the course
// document does not state, so this stays compatible with a grader that only
// relies on the documented types (see OQ-005 in docs/REQUIREMENTS.md).
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

// TEAM EXTENSION: guards getCostById/updateCost/deleteCost, all of which are
// keyed by the generated id rather than by the required addCost() fields.
function validateCostId(id) {
  if (typeof id !== 'string' || id.trim() === '') {
    throw new TypeError('id must be a non-empty string.');
  }
}

// Confirms day/month/year actually form a real calendar date (e.g. rejects
// 31 February) by letting the Date constructor normalize the value and
// checking whether it rolled over into a different date than requested.
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

// TEAM EXTENSION: full date/time validation used only by updateCost(), where
// the Manage Costs UI lets a user edit the complete stored date/time rather
// than only the auto-assigned original.
function validateCostDate(date) {
  if (date === null || typeof date !== 'object' || Array.isArray(date)) {
    throw new TypeError('cost.date must be an object.');
  }

  const { day, month, year, hour, minute } = date;

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

// Malformed-storage recovery: if the stored value is missing, not valid
// JSON, or not an array (e.g. corrupted by hand-editing localStorage or a
// future incompatible format), this quietly falls back to an empty list
// instead of throwing. The app should degrade to "no costs yet", not crash.
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

// Returns a defensive copy of a stored cost (including its full internal
// date/time) rather than the live object, so callers can freely read the
// result without risk of accidentally mutating what is in localStorage.
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

// Computes a report's total in a single target currency. Individual report
// rows always keep their original sum/currency (R-036) — only this total is
// converted. When every matching cost already shares the target currency,
// no conversion (and therefore no cached-rates lookup) is needed at all,
// which is what lets the official same-currency sample test
// (200 USD + 400 USD, getReport("USD")) pass with no rates cache populated.
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
      'Cross-currency report totals require cached exchange rates.'
    );
  }

  return costs.reduce((total, cost) => {
    return total + convertCurrency(cost.sum, cost.currency, targetCurrency, cachedRates);
  }, 0);
}

/**
 * Required entry point of the protected db.js contract. Returns a fresh
 * database object bound to one (databaseName, databaseVersion) storage key;
 * nothing is cached at module scope, so multiple calls with the same
 * identity independently read/write the same underlying localStorage entry.
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

    /**
     * TEAM EXTENSION — powers the Manage Costs list view.
     * @returns {object[]} Every stored cost, each with its full internal
     *   date/time (unlike getReport()'s { day }-only report shape).
     */
    getAllCosts() {
      return readCosts(storageKey).map(copyStoredCost);
    },

    /**
     * TEAM EXTENSION — used by Manage Costs to load a single row for editing.
     * @param {string} id - Id of the cost to look up.
     * @returns {object|null} The matching cost, or null if no cost has
     *   this id.
     */
    getCostById(id) {
      validateCostId(id);

      const matchingCost = readCosts(storageKey).find((cost) => cost.id === id);

      return matchingCost ? copyStoredCost(matchingCost) : null;
    },

    /**
     * TEAM EXTENSION — full-record edit, used by Manage Costs. Preserves the
     * original id.
     * @param {string} id - Id of the cost to update.
     * @param {object} cost - Full editable payload: sum, currency,
     *   category, description, and date ({ day, month, year, hour, minute }).
     * @returns {object|null} The updated cost, or null for an unknown id
     *   (expected outcome, not an error); a malformed id or payload still
     *   throws via validation.
     */
    updateCost(id, cost) {
      validateCostId(id);

      const costs = readCosts(storageKey);
      const costIndex = costs.findIndex((storedCost) => storedCost.id === id);

      if (costIndex === -1) {
        return null;
      }

      validateEditableCost(cost);

      // Full editable payload replaces the stored record; id is kept.
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

    /**
     * TEAM EXTENSION — id-based deletion so that two costs which otherwise
     * look identical can be told apart and deleted independently.
     * @param {string} id - Id of the cost to delete.
     * @returns {object|null} The deleted cost, or null if no cost has
     *   this id.
     */
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
