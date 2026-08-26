import { useState } from "react";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import LoadingButtonLabel from "../components/common/LoadingButtonLabel.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import SectionCard from "../components/common/SectionCard.jsx";
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
      <PageHeader title="Settings">
        Manage the exchange-rate source used by reports and charts.
      </PageHeader>

      <SectionCard
        component="form"
        onSubmit={handleSaveCustomSource}
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
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <PublicOutlinedIcon
                aria-hidden="true"
                color={settingsState.sourceType === "Default" ? "primary" : "secondary"}
                fontSize="small"
              />
              <Typography>{settingsState.sourceType}</Typography>
            </Stack>

            <Typography color="text.secondary" variant="body2">
              Current effective source
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "flex-start", minWidth: 0 }}
            >
              <LinkOutlinedIcon
                aria-hidden="true"
                color="primary"
                fontSize="small"
                sx={{ mt: 0.25 }}
              />
              <Typography sx={{ overflowWrap: "anywhere" }}>
                {settingsState.effectiveUrl}
              </Typography>
            </Stack>

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
              <LoadingButtonLabel
                isLoading={activeAction === "save"}
                loadingText="Testing..."
              >
                <Stack component="span" direction="row" spacing={1}>
                  <SaveOutlinedIcon aria-hidden="true" fontSize="small" />
                  <span>Save & Test Source</span>
                </Stack>
              </LoadingButtonLabel>
            </Button>
            <Button
              disabled={isBusy}
              onClick={handleUseDefaultSource}
              type="button"
              variant="outlined"
            >
              <LoadingButtonLabel
                isLoading={activeAction === "default"}
                loadingText="Restoring..."
              >
                <Stack component="span" direction="row" spacing={1}>
                  <RestartAltOutlinedIcon aria-hidden="true" fontSize="small" />
                  <span>Use Default Source</span>
                </Stack>
              </LoadingButtonLabel>
            </Button>
          </Box>
        </Stack>
      </SectionCard>
    </Stack>
  );
}

export default SettingsPage;
