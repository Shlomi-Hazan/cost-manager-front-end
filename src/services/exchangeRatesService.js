import {
  getCachedExchangeRates as readCachedExchangeRates,
  setCachedExchangeRates
} from "../lib/exchangeRatesCache.js";
import { getExchangeRatesUrl } from "./settingsService.js";
import { validateExchangeRates } from "../utils/currency.js";

export async function fetchExchangeRates(url = getExchangeRatesUrl()) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Exchange rates request failed with status ${response.status}.`);
  }

  const payload = await response.json();

  return validateExchangeRates(payload);
}

export async function refreshExchangeRates() {
  const rates = await fetchExchangeRates(getExchangeRatesUrl());

  return setCachedExchangeRates(rates);
}

export function getCachedExchangeRates() {
  return readCachedExchangeRates();
}
