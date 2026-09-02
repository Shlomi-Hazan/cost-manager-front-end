/*
 * Course requirement: the app must work with a built-in default exchange-rate
 * source (R-092) and must also let the user configure a custom one in
 * Settings (R-093). This module owns that "custom URL overrides default"
 * decision and persists the user's choice in localStorage; it does not
 * perform the actual Fetch itself (see exchangeRatesService.js for that).
 */

// Built from Vite's BASE_URL rather than a hard-coded leading slash so this
// still resolves correctly when the app is served from a subpath, such as a
// GitHub Pages project site (https://<user>.github.io/cost-manager-front-end/).
export const defaultExchangeRatesUrl = `${import.meta.env.BASE_URL}exchange-rates.json`;
export const settingsStorageKey = 'cost-manager:settings';

// Settings are stored as a single small object under one key rather than one
// key per setting, since there is currently only one setting to persist and
// this keeps room to add more without a storage-key migration.
function readSettings() {
  const storedValue = localStorage.getItem(settingsStorageKey);

  if (storedValue === null) {
    return {};
  }

  try {
    const parsedValue = JSON.parse(storedValue);

    return parsedValue !== null && typeof parsedValue === 'object' && !Array.isArray(parsedValue)
      ? parsedValue
      : {};
  } catch {
    return {};
  }
}

function writeSettings(settings) {
  localStorage.setItem(settingsStorageKey, JSON.stringify(settings));
}

// Returns null (not an empty string) when no custom URL is configured, so
// callers can use `??` to fall back to the default URL (see
// getExchangeRatesUrl() below) instead of having to check for "".
export function getCustomExchangeRatesUrl() {
  const { exchangeRatesUrl } = readSettings();

  return typeof exchangeRatesUrl === 'string' && exchangeRatesUrl.trim() !== ''
    ? exchangeRatesUrl
    : null;
}

export function setCustomExchangeRatesUrl(url) {
  if (typeof url !== 'string' || url.trim() === '') {
    throw new TypeError('Exchange rates URL must be a non-empty string.');
  }

  const settings = readSettings();
  const trimmedUrl = url.trim();

  writeSettings({
    ...settings,
    exchangeRatesUrl: trimmedUrl
  });

  return trimmedUrl;
}

// This is the "Use Default Source" behavior in Settings: it removes the
// custom URL entirely (rather than writing back the default URL string), so
// getExchangeRatesUrl() below naturally falls through to the true default
// again, including any future change to defaultExchangeRatesUrl itself.
export function clearCustomExchangeRatesUrl() {
  const settings = readSettings();

  delete settings.exchangeRatesUrl;
  writeSettings(settings);
}

// The single place the rest of the app should ask "what URL should exchange
// rates come from right now?" — custom always wins when one is configured.
export function getExchangeRatesUrl() {
  return getCustomExchangeRatesUrl() ?? defaultExchangeRatesUrl;
}
