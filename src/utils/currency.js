/*
 * Course requirement: currency conversion and exchange-rate-shape validation.
 * This is the single place that implements the official rate model and the
 * conversion formula, so both the React application and any report/chart
 * code reuse identical, independently-tested logic instead of re-deriving it.
 */
import { SUPPORTED_CURRENCIES } from "../constants/currencies.js";

export function isSupportedCurrency(currency) {
  return SUPPORTED_CURRENCIES.includes(currency);
}

/*
 * The official rate model expresses every rate as "how many units of that
 * currency equal 1 USD", e.g. { USD: 1, GBP: 0.6, EURO: 0.7, ILS: 3.4 }.
 * This validates a rates object (usually the raw response from the
 * exchange-rate JSON, default or custom) before it is trusted anywhere in
 * the app, and returns a clean copy containing only the four required
 * currencies in a fixed order — extra fields on the source object are
 * intentionally dropped rather than silently carried through.
 */
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

  // A rate of 0 (or negative) would make conversion undefined/meaningless, so
  // it is rejected above. USD is additionally pinned to exactly 1 because the
  // whole rate table is defined relative to USD as the base currency.
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

/*
 * Converts an amount from one supported currency to another using the
 * official rate model. Because every rate is already "units per 1 USD",
 * converting source -> target is a two-step trip through USD:
 *
 *   amount / rates[source]   -- undo the source currency's rate to reach USD
 *   ... * rates[target]      -- apply the target currency's rate from USD
 *
 * which collapses to the single formula below. This never mutates a stored
 * cost's original sum/currency (see src/lib/db.js) — it is only ever used to
 * compute a converted value for display in a report/chart total.
 */
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
