import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import { SUPPORTED_CURRENCIES } from "../constants/currencies.js";
import { costsDatabase } from "../lib/costsDatabase.js";
import { refreshExchangeRates } from "../services/exchangeRatesService.js";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" }
];

function getCurrentFilters() {
  const now = new Date();

  return {
    month: String(now.getMonth() + 1),
    year: String(now.getFullYear()),
    currency: "USD"
  };
}

function getMonthLabel(month) {
  return MONTHS.find((option) => option.value === month)?.label ?? String(month);
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
  const reportMonth = Number(filters.month);
  const trimmedYear = filters.year.trim();
  const reportYear = Number(trimmedYear);

  if (
    !Number.isInteger(reportMonth) ||
    reportMonth < 1 ||
    reportMonth > 12
  ) {
    errors.month = "Select a report month.";
  }

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
    reportMonth,
    reportYear
  };
}

function getReportErrorMessage(error) {
  if (
    error instanceof Error &&
    error.message.includes("cached exchange rates")
  ) {
    return "Exchange rates are unavailable for converting this report. Please try again.";
  }

  return "Could not generate the monthly report. Please try again.";
}

function MonthlyReportPage() {
  const [filters, setFilters] = useState(getCurrentFilters);
  const [errors, setErrors] = useState({});
  const [report, setReport] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

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
        // A failed refresh should not block same-currency reports or valid cached rates.
      }

      const nextReport = costsDatabase.getReport(
        filters.currency,
        validation.reportYear,
        validation.reportMonth
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
          Monthly Report
        </Typography>
        <Typography color="text.secondary" variant="body1">
          Select a month, year, and currency to review detailed cost entries.
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
                md: "220px 180px 180px auto"
              }
            }}
          >
            <TextField
              error={Boolean(errors.month)}
              helperText={errors.month ?? " "}
              label="Month"
              name="month"
              onChange={handleChange}
              select
              value={filters.month}
            >
              {MONTHS.map((month) => (
                <MenuItem key={month.value} value={String(month.value)}>
                  {month.label}
                </MenuItem>
              ))}
            </TextField>

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
                {isLoading ? "Generating..." : "Generate Report"}
              </Button>
            </Box>
          </Box>
        </Stack>
      </Paper>

      {!hasGenerated && !errorMessage && !isLoading ? (
        <Alert severity="info">
          Choose filters and generate a detailed monthly report.
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
                {getMonthLabel(report.month)} {report.year}
              </Typography>
              <Typography color="text.secondary" variant="body1">
                Report currency: {report.total.currency}
              </Typography>
              <Typography fontWeight={700} variant="body1">
                Total: {formatAmount(report.total.sum)} {report.total.currency}
              </Typography>
            </Box>

            {report.costs.length === 0 ? (
              <Alert severity="info">No costs found for this month.</Alert>
            ) : (
              <TableContainer>
                <Table aria-label="Monthly report costs">
                  <TableHead>
                    <TableRow>
                      <TableCell>Day</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Sum</TableCell>
                      <TableCell>Currency</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {report.costs.map((cost, index) => (
                      <TableRow
                        key={`${cost.description}-${cost.category}-${index}`}
                      >
                        <TableCell>{cost.date.day}</TableCell>
                        <TableCell>{cost.description}</TableCell>
                        <TableCell>{cost.category}</TableCell>
                        <TableCell align="right">
                          {formatAmount(cost.sum)}
                        </TableCell>
                        <TableCell>{cost.currency}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Stack>
        </Paper>
      ) : null}
    </Stack>
  );
}

export default MonthlyReportPage;
