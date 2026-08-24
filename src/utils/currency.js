import { SUPPORTED_CURRENCIES } from "../constants/currencies.js";

export function isSupportedCurrency(currency) {
  return SUPPORTED_CURRENCIES.includes(currency);
}

export function validateExchangeRates(rates) {
  if (rates === null || typeof rates !== "object" || Array.isArray(rates)) {
    throw new TypeError("Exchange rates must be an object.");
  }

  SUPPORTED_CURRENCIES.forEach((currency) => {
    if (!Object.hasOwn(rates, currency)) {
      throw new TypeError(`Exchange rates must include ${currency}.`);
    }

    if (typeof rates[currency] !== "number" || !Number.isFinite(rates[currency])) {
      throw new TypeError(`Exchange rate for ${currency} must be a finite number.`);
    }

    if (rates[currency] <= 0) {
      throw new TypeError(`Exchange rate for ${currency} must be greater than zero.`);
    }
  });

  if (rates.USD !== 1) {
    throw new TypeError("Exchange rate for USD must be exactly 1.");
  }

  return SUPPORTED_CURRENCIES.reduce((validatedRates, currency) => {
    return {
      ...validatedRates,
      [currency]: rates[currency]
    };
  }, {});
}

export function convertCurrency(amount, sourceCurrency, targetCurrency, rates) {
  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    throw new TypeError("amount must be a finite number.");
  }

  if (!isSupportedCurrency(sourceCurrency)) {
    throw new TypeError("sourceCurrency must be one of USD, ILS, GBP, EURO.");
  }

  if (!isSupportedCurrency(targetCurrency)) {
    throw new TypeError("targetCurrency must be one of USD, ILS, GBP, EURO.");
  }

  const validatedRates = validateExchangeRates(rates);

  return (amount / validatedRates[sourceCurrency]) * validatedRates[targetCurrency];
}
