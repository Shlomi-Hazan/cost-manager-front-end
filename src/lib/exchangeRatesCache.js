import { validateExchangeRates } from "../utils/currency.js";

export const EXCHANGE_RATES_CACHE_KEY = "cost-manager:exchange-rates-cache";

export function getCachedExchangeRates() {
  const storedValue = localStorage.getItem(EXCHANGE_RATES_CACHE_KEY);

  if (storedValue === null) {
    return null;
  }

  try {
    return validateExchangeRates(JSON.parse(storedValue));
  } catch {
    return null;
  }
}

export function setCachedExchangeRates(rates) {
  const validatedRates = validateExchangeRates(rates);

  localStorage.setItem(EXCHANGE_RATES_CACHE_KEY, JSON.stringify(validatedRates));

  return validatedRates;
}

export function clearCachedExchangeRates() {
  localStorage.removeItem(EXCHANGE_RATES_CACHE_KEY);
}
