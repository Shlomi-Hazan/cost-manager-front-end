import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CssBaseline, ThemeProvider } from "@mui/material";
import App from "./App.jsx";
import theme from "./theme.js";
import "./index.css";
import { refreshExchangeRates } from "./services/exchangeRatesService.js";

refreshExchangeRates().catch(() => {
  // Rate-specific UI will be added later; startup refresh must not block rendering.
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>
);
