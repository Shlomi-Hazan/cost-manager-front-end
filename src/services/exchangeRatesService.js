/*
 * Course requirement: exchange rates are retrieved over the network using
 * the Fetch API (R-090), from either the project's default URL or a
 * Settings-configured custom URL (R-092/R-093). This module owns the actual
 * fetch/validate/cache pipeline; UI code should call refreshExchangeRates()
 * rather than calling fetch() directly.
 */
import {
  getCachedExchangeRates as readCachedExchangeRates,
  setCachedExchangeRates
} from "../lib/exchangeRatesCache.js";
import { getExchangeRatesUrl } from "./settingsService.js";
import { validateExchangeRates } from "../utils/currency.js";

// Defaults to whichever URL Settings currently resolves to (custom if set,
// otherwise the project default) so most call sites can omit the argument.
// A non-OK HTTP status and a malformed/incomplete JSON payload are both
// treated as failures here rather than allowed to reach the cache.
export async function fetchExchangeRates(url = getExchangeRatesUrl()) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Exchange rates request failed with status ${response.status}.`);
  }

  const payload = await response.json();

  return validateExchangeRates(payload);
}

// Fetches, validates, and persists rates in one step. This is the function
// the application calls on load/refresh so that db.js's synchronous
// getReport() has a populated cache to read from (see exchangeRatesCache.js
// for why the cache exists at all).
export async function refreshExchangeRates(url = getExchangeRatesUrl()) {
  const rates = await fetchExchangeRates(url);

  return setCachedExchangeRates(rates);
}

// Thin re-export so callers only need to import from this service module
// rather than reaching into the lower-level cache module directly.
export function getCachedExchangeRates() {
  return readCachedExchangeRates();
}
