import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import SortableReportTable from "../components/reports/SortableReportTable.jsx";
import { SUPPORTED_CURRENCIES } from "../constants/currencies.js";
import { useReportSorting } from "../hooks/useReportSorting.js";
import { costsDatabase } from "../lib/costsDatabase.js";
import { buildDetailedYearlyReport } from "../services/detailedReportsService.js";
import { refreshExchangeRates } from "../services/exchangeRatesService.js";

function getCurrentFilters() {
  return {
    year: String(new Date().getFullYear()),
    currency: "USD"
  };
}

function formatAmount(amount) {
  return Number.isInteger(amount)
    ? String(amount)
    : amount.toLocaleString("en-US", {
        maximumFractionDigits: 6
      });
}

function validateFilters(filters) {
  const errors = {};
  const trimmedYear = filters.year.trim();
  const reportYear = Number(trimmedYear);

  if (trimmedYear === "") {
    errors.year = "Enter a report year.";
  } else if (!Number.isFinite(reportYear) || !Number.isInteger(reportYear)) {
    errors.year = "Enter a whole report year.";
  }

  if (!SUPPORTED_CURRENCIES.includes(filters.currency)) {
    errors.currency = "Select a supported currency.";
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    reportYear
  };
}

function getReportErrorMessage(error) {
  if (
    error instanceof Error &&
    (error.message.includes("cached exchange rates") ||
      error.message.includes("Exchange rates"))
  ) {
    return "Exchange rates are unavailable for converting this yearly report. Please try again.";
  }

  return "Could not generate the yearly report. Please try again.";
}

function YearlyReportPage() {
  const [filters, setFilters] = useState(getCurrentFilters);
  const [errors, setErrors] = useState({});
  const [report, setReport] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const {
    sortedCosts,
    sortDirection,
    sortKey,
    requestSort,
    resetSort
  } = useReportSorting(report?.costs ?? []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value
    }));
    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: undefined
    }));
    setErrorMessage("");
    setReport(null);
    setHasGenerated(false);
    resetSort();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validation = validateFilters(filters);

    setErrors(validation.errors);
    setErrorMessage("");
    setReport(null);
    setHasGenerated(false);

    if (!validation.isValid) {
      setErrorMessage("Please correct the highlighted report filters.");
      return;
    }

    setIsLoading(true);

    try {
      try {
        await refreshExchangeRates();
      } catch {
        // Same-currency yearly reports and valid cached rates can still work.
      }

      const nextReport = buildDetailedYearlyReport(
        costsDatabase,
        filters.currency,
        validation.reportYear
      );

      setReport(nextReport);
      setHasGenerated(true);
    } catch (error) {
      setErrorMessage(getReportErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography component="h1" variant="h1">
          Yearly Report
        </Typography>
        <Typography color="text.secondary" variant="body1">
          Select a year and currency to review all cost entries for that year.
        </Typography>
      </Box>

      <Paper
        component="form"
        elevation={0}
        onSubmit={handleSubmit}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          p: 3
        }}
      >
        <Stack spacing={3}>
          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                md: "180px 180px auto"
              }
            }}
          >
            <TextField
              error={Boolean(errors.year)}
              helperText={errors.year ?? " "}
              inputMode="numeric"
              label="Year"
              name="year"
              onChange={handleChange}
              value={filters.year}
            />

            <TextField
              error={Boolean(errors.currency)}
              helperText={errors.currency ?? " "}
              label="Currency"
              name="currency"
              onChange={handleChange}
              select
              value={filters.currency}
            >
              {SUPPORTED_CURRENCIES.map((currency) => (
                <MenuItem key={currency} value={currency}>
                  {currency}
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ alignSelf: "start", pt: { md: 1 } }}>
              <Button disabled={isLoading} type="submit" variant="contained">
                {isLoading ? "Generating..." : "Generate Yearly Report"}
              </Button>
            </Box>
          </Box>
        </Stack>
      </Paper>

      {!hasGenerated && !errorMessage && !isLoading ? (
        <Alert severity="info">
          Choose filters and generate a detailed yearly report.
        </Alert>
      ) : null}

      {report ? (
        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            p: 3
          }}
        >
          <Stack spacing={3}>
            <Box>
              <Typography component="h2" variant="h2">
                {report.year} Yearly Report
              </Typography>
              <Typography color="text.secondary" variant="body1">
                Report currency: {report.total.currency}
              </Typography>
              <Typography fontWeight={700} variant="body1">
                Total: {formatAmount(report.total.sum)} {report.total.currency}
              </Typography>
            </Box>

            {report.costs.length === 0 ? (
              <Alert severity="info">No costs found for this year.</Alert>
            ) : (
              <SortableReportTable
                costs={sortedCosts}
                dateMode="yearly"
                onRequestSort={requestSort}
                sortDirection={sortDirection}
                sortKey={sortKey}
              />
            )}
          </Stack>
        </Paper>
      ) : null}
    </Stack>
  );
}

export default YearlyReportPage;
