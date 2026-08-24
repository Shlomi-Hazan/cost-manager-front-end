import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { refreshExchangeRates } from "../services/exchangeRatesService.js";
import {
  DEFAULT_EXCHANGE_RATES_URL,
  clearCustomExchangeRatesUrl,
  getCustomExchangeRatesUrl,
  getExchangeRatesUrl,
  setCustomExchangeRatesUrl
} from "../services/settingsService.js";

function getInitialState() {
  const customUrl = getCustomExchangeRatesUrl();

  return {
    customUrl,
    effectiveUrl: getExchangeRatesUrl(),
    inputUrl: customUrl ?? "",
    sourceType: customUrl === null ? "Default" : "Custom"
  };
}

function getValidationErrorMessage() {
  return "Could not validate this exchange-rate source. Check the URL and try again.";
}

function SettingsPage() {
  const [settingsState, setSettingsState] = useState(getInitialState);
  const [inputError, setInputError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [activeAction, setActiveAction] = useState(null);

  const isBusy = activeAction !== null;

  function updateSettingsState(inputUrl) {
    const customUrl = getCustomExchangeRatesUrl();

    setSettingsState({
      customUrl,
      effectiveUrl: getExchangeRatesUrl(),
      inputUrl: inputUrl ?? customUrl ?? "",
      sourceType: customUrl === null ? "Default" : "Custom"
    });
  }

  function handleInputChange(event) {
    setSettingsState((currentState) => ({
      ...currentState,
      inputUrl: event.target.value
    }));
    setInputError("");
    setFeedback(null);
  }

  async function handleSaveCustomSource(event) {
    event.preventDefault();

    const candidateUrl = settingsState.inputUrl.trim();

    setInputError("");
    setFeedback(null);

    if (candidateUrl === "") {
      setInputError("Enter an exchange-rate source.");
      return;
    }

    setActiveAction("save");

    try {
      await refreshExchangeRates(candidateUrl);
      const savedUrl = setCustomExchangeRatesUrl(candidateUrl);

      updateSettingsState(savedUrl);
      setFeedback({
        message: "Exchange-rate source saved and validated successfully.",
        severity: "success"
      });
    } catch {
      updateSettingsState(settingsState.inputUrl);
      setFeedback({
        message: getValidationErrorMessage(),
        severity: "error"
      });
    } finally {
      setActiveAction(null);
    }
  }

  async function handleUseDefaultSource() {
    setInputError("");
    setFeedback(null);
    setActiveAction("default");

    try {
      await refreshExchangeRates(DEFAULT_EXCHANGE_RATES_URL);
      clearCustomExchangeRatesUrl();
      updateSettingsState("");
      setFeedback({
        message: "Default exchange-rate source restored successfully.",
        severity: "success"
      });
    } catch {
      updateSettingsState(settingsState.inputUrl);
      setFeedback({
        message: "Could not restore the default exchange-rate source. Please try again.",
        severity: "error"
      });
    } finally {
      setActiveAction(null);
    }
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography component="h1" variant="h1">
          Settings
        </Typography>
        <Typography color="text.secondary" variant="body1">
          Manage the exchange-rate source used by reports and charts.
        </Typography>
      </Box>

      <Paper
        component="form"
        elevation={0}
        onSubmit={handleSaveCustomSource}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          p: 3
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography component="h2" variant="h2">
              Exchange Rate Source
            </Typography>
            <Typography color="text.secondary" variant="body1">
              Validate a custom JSON source before making it active.
            </Typography>
          </Box>

          {feedback ? (
            <Alert severity={feedback.severity}>{feedback.message}</Alert>
          ) : null}

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                md: "220px 1fr"
              }
            }}
          >
            <Typography color="text.secondary" variant="body2">
              Current source type
            </Typography>
            <Typography>{settingsState.sourceType}</Typography>

            <Typography color="text.secondary" variant="body2">
              Current effective source
            </Typography>
            <Typography sx={{ overflowWrap: "anywhere" }}>
              {settingsState.effectiveUrl}
            </Typography>

            <Typography color="text.secondary" variant="body2">
              Default source
            </Typography>
            <Typography sx={{ overflowWrap: "anywhere" }}>
              {DEFAULT_EXCHANGE_RATES_URL}
            </Typography>
          </Box>

          <TextField
            error={Boolean(inputError)}
            fullWidth
            helperText={
              inputError ||
              `Use a relative path such as ${DEFAULT_EXCHANGE_RATES_URL} or an absolute URL.`
            }
            label="Custom exchange-rate source"
            name="exchangeRatesUrl"
            onChange={handleInputChange}
            value={settingsState.inputUrl}
          />

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2
            }}
          >
            <Button disabled={isBusy} type="submit" variant="contained">
              {activeAction === "save" ? "Testing..." : "Save & Test Source"}
            </Button>
            <Button
              disabled={isBusy}
              onClick={handleUseDefaultSource}
              type="button"
              variant="outlined"
            >
              {activeAction === "default" ? "Restoring..." : "Use Default Source"}
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Stack>
  );
}

export default SettingsPage;
