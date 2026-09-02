import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, ThemeProvider } from '@mui/material';
import App from './App.jsx';
import theme from './theme.js';
import './index.css';
import { refreshExchangeRates } from './services/exchangeRatesService.js';

// Fetches and caches exchange rates once, as early as possible, so the
// synchronous db.js getReport() (see src/lib/exchangeRatesCache.js for why
// it must stay synchronous) has a populated cache by the time any page asks
// for a cross-currency report/chart total. This intentionally does not
// block or delay the initial render — if it fails (e.g. offline), the app
// still renders immediately, and same-currency reports keep working with no
// cache at all; only cross-currency totals will surface an error until a
// later successful refresh (e.g. from Settings) populates the cache.
refreshExchangeRates().catch(() => {
  // Rate-specific UI will be added later; startup refresh must not block rendering.
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>
);
