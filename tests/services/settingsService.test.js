import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_EXCHANGE_RATES_URL,
  clearCustomExchangeRatesUrl,
  getCustomExchangeRatesUrl,
  getExchangeRatesUrl,
  setCustomExchangeRatesUrl
} from '../../src/services/settingsService.js';

/*
 * Course requirement (R-092/R-093): protects that a custom exchange-rate
 * URL, once set, always takes priority over the default, and that clearing
 * it correctly falls back to the true default rather than a stale copy.
 */
describe('settingsService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('uses the default exchange-rate URL when no custom URL exists', () => {
    expect(getCustomExchangeRatesUrl()).toBeNull();
    expect(getExchangeRatesUrl()).toBe(DEFAULT_EXCHANGE_RATES_URL);
  });

  it('persists a custom exchange-rate URL', () => {
    setCustomExchangeRatesUrl('https://example.test/rates.json');

    expect(getCustomExchangeRatesUrl()).toBe('https://example.test/rates.json');
    expect(getExchangeRatesUrl()).toBe('https://example.test/rates.json');
  });

  it('reads a custom URL persisted in localStorage by another service call', () => {
    setCustomExchangeRatesUrl('https://example.test/custom.json');

    expect(getExchangeRatesUrl()).toBe('https://example.test/custom.json');
  });

  it('clears the custom URL and restores the default URL', () => {
    setCustomExchangeRatesUrl('https://example.test/rates.json');

    clearCustomExchangeRatesUrl();

    expect(getCustomExchangeRatesUrl()).toBeNull();
    expect(getExchangeRatesUrl()).toBe(DEFAULT_EXCHANGE_RATES_URL);
  });
});
