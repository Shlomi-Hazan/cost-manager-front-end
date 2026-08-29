// Built from Vite's BASE_URL rather than a hard-coded leading slash so this
// still resolves correctly when the app is served from a subpath, such as a
// GitHub Pages project site (https://<user>.github.io/cost-manager-front-end/).
export const DEFAULT_EXCHANGE_RATES_URL = `${import.meta.env.BASE_URL}exchange-rates.json`;
export const SETTINGS_STORAGE_KEY = "cost-manager:settings";

function readSettings() {
  const storedValue = localStorage.getItem(SETTINGS_STORAGE_KEY);

  if (storedValue === null) {
    return {};
  }

  try {
    const parsedValue = JSON.parse(storedValue);

    return parsedValue !== null && typeof parsedValue === "object" && !Array.isArray(parsedValue)
      ? parsedValue
      : {};
  } catch {
    return {};
  }
}

function writeSettings(settings) {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export function getCustomExchangeRatesUrl() {
  const { exchangeRatesUrl } = readSettings();

  return typeof exchangeRatesUrl === "string" && exchangeRatesUrl.trim() !== ""
    ? exchangeRatesUrl
    : null;
}

export function setCustomExchangeRatesUrl(url) {
  if (typeof url !== "string" || url.trim() === "") {
    throw new TypeError("Exchange rates URL must be a non-empty string.");
  }

  const settings = readSettings();
  const trimmedUrl = url.trim();

  writeSettings({
    ...settings,
    exchangeRatesUrl: trimmedUrl
  });

  return trimmedUrl;
}

export function clearCustomExchangeRatesUrl() {
  const settings = readSettings();

  delete settings.exchangeRatesUrl;
  writeSettings(settings);
}

export function getExchangeRatesUrl() {
  return getCustomExchangeRatesUrl() ?? DEFAULT_EXCHANGE_RATES_URL;
}
