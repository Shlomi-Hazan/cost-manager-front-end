import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  EXCHANGE_RATES_CACHE_KEY,
  getCachedExchangeRates,
  setCachedExchangeRates
} from "../../src/lib/exchangeRatesCache.js";
import {
  fetchExchangeRates,
  refreshExchangeRates
} from "../../src/services/exchangeRatesService.js";
import {
  DEFAULT_EXCHANGE_RATES_URL,
  SETTINGS_STORAGE_KEY,
  setCustomExchangeRatesUrl
} from "../../src/services/settingsService.js";

const validRates = {
  USD: 1,
  GBP: 0.5,
  EURO: 0.8,
  ILS: 4
};

let originalFetch;

function mockFetchResponse(payload, options = {}) {
  return vi.fn().mockResolvedValue({
    ok: options.ok ?? true,
    status: options.status ?? 200,
    json: vi.fn().mockResolvedValue(payload)
  });
}

describe("exchangeRatesService", () => {
  beforeEach(() => {
    originalFetch = globalThis.fetch;
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    if (originalFetch === undefined) {
      delete globalThis.fetch;
    } else {
      globalThis.fetch = originalFetch;
    }
  });

  it("uses the default URL when no custom URL is configured", async () => {
    globalThis.fetch = mockFetchResponse(validRates);

    await refreshExchangeRates();

    expect(globalThis.fetch).toHaveBeenCalledWith(DEFAULT_EXCHANGE_RATES_URL);
  });

  it("uses a configured custom URL", async () => {
    globalThis.fetch = mockFetchResponse(validRates);
    setCustomExchangeRatesUrl("https://example.test/rates.json");

    await refreshExchangeRates();

    expect(globalThis.fetch).toHaveBeenCalledWith("https://example.test/rates.json");
  });

  it("returns validated rates from a successful Fetch", async () => {
    globalThis.fetch = mockFetchResponse({ ...validRates, metadata: "ignored" });

    await expect(fetchExchangeRates("/rates.json")).resolves.toEqual(validRates);
  });

  it("caches validated rates after a successful refresh", async () => {
    globalThis.fetch = mockFetchResponse(validRates);

    await expect(refreshExchangeRates()).resolves.toEqual(validRates);

    expect(getCachedExchangeRates()).toEqual(validRates);
  });

  it("rejects non-OK responses", async () => {
    globalThis.fetch = mockFetchResponse(validRates, {
      ok: false,
      status: 500
    });

    await expect(refreshExchangeRates()).rejects.toThrow(
      "Exchange rates request failed with status 500."
    );
  });

  it("rejects invalid payloads", async () => {
    globalThis.fetch = mockFetchResponse({
      USD: 1,
      GBP: 0.5,
      EURO: 0.8
    });

    await expect(refreshExchangeRates()).rejects.toThrow(
      "Exchange rates must include ILS."
    );
  });

  it("rejects when JSON parsing fails", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockRejectedValue(new SyntaxError("Invalid JSON"))
    });

    await expect(refreshExchangeRates()).rejects.toThrow("Invalid JSON");
  });

  it("does not replace an existing valid cache with invalid data", async () => {
    setCachedExchangeRates(validRates);
    globalThis.fetch = mockFetchResponse({
      USD: 1,
      GBP: 0.5,
      EURO: 0.8
    });

    await expect(refreshExchangeRates()).rejects.toThrow();

    expect(getCachedExchangeRates()).toEqual(validRates);
  });

  it("reads existing cached rates", () => {
    setCachedExchangeRates(validRates);

    expect(getCachedExchangeRates()).toEqual(validRates);
  });

  it("treats a malformed cache as missing", () => {
    localStorage.setItem(EXCHANGE_RATES_CACHE_KEY, "{not-json");

    expect(getCachedExchangeRates()).toBeNull();
  });

  it("ignores malformed settings and falls back to the default URL", async () => {
    globalThis.fetch = mockFetchResponse(validRates);
    localStorage.setItem(SETTINGS_STORAGE_KEY, "{not-json");

    await refreshExchangeRates();

    expect(globalThis.fetch).toHaveBeenCalledWith(DEFAULT_EXCHANGE_RATES_URL);
  });
});
