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
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { SUPPORTED_CURRENCIES } from "../../constants/currencies.js";
import { costsDatabase } from "../../lib/costsDatabase.js";
import { refreshExchangeRates } from "../../services/exchangeRatesService.js";
import { buildYearlyMonthlyTotals } from "../../utils/yearlyAggregation.js";

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
  const chartYear = Number(trimmedYear);

  if (trimmedYear === "") {
    errors.year = "Enter a chart year.";
  } else if (!Number.isFinite(chartYear) || !Number.isInteger(chartYear)) {
    errors.year = "Enter a whole chart year.";
  }

  if (!SUPPORTED_CURRENCIES.includes(filters.currency)) {
    errors.currency = "Select a supported currency.";
  }

  return {
    chartYear,
    errors,
    isValid: Object.keys(errors).length === 0
  };
}

function getYearlyErrorMessage(error) {
  if (
    error instanceof Error &&
    (error.message.includes("cached exchange rates") ||
      error.message.includes("Exchange rates"))
  ) {
    return "Exchange rates are unavailable for converting this yearly chart. Please try again.";
  }

  return "Could not generate the yearly chart. Please try again.";
}

function YearlyBarChartSection() {
  const [filters, setFilters] = useState(getCurrentFilters);
  const [errors, setErrors] = useState({});
  const [yearlyResult, setYearlyResult] = useState(null);
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
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validation = validateFilters(filters);

    setErrors(validation.errors);
    setErrorMessage("");

    if (!validation.isValid) {
      setErrorMessage("Please correct the highlighted yearly chart filters.");
      return;
    }

    setIsLoading(true);

    try {
      try {
        await refreshExchangeRates();
      } catch {
        // Same-currency yearly charts and valid cached rates can still work.
      }

      const monthlyTotals = buildYearlyMonthlyTotals(
        (currency, year, month) => costsDatabase.getReport(currency, year, month),
        filters.currency,
        validation.chartYear
      );

      setYearlyResult({
        currency: filters.currency,
        monthlyTotals,
        year: validation.chartYear
      });
      setHasGenerated(true);
    } catch (error) {
      setYearlyResult(null);
      setHasGenerated(false);
      setErrorMessage(getYearlyErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  const monthlyTotals = yearlyResult?.monthlyTotals ?? [];
  const hasYearlyCosts = monthlyTotals.some((entry) => entry.total > 0);

  return (
    <Stack spacing={3}>
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
          <Box>
            <Typography component="h2" variant="h2">
              Yearly 12-Month Bar Chart
            </Typography>
            <Typography color="text.secondary" variant="body1">
              Select a year and target currency for monthly totals.
            </Typography>
          </Box>

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
              label="Yearly Chart Year"
              name="year"
              onChange={handleChange}
              value={filters.year}
            />

            <TextField
              error={Boolean(errors.currency)}
              helperText={errors.currency ?? " "}
              label="Yearly Chart Currency"
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
                {isLoading ? "Generating..." : "Generate Yearly Chart"}
              </Button>
            </Box>
          </Box>
        </Stack>
      </Paper>

      {!hasGenerated && !errorMessage && !isLoading ? (
        <Alert severity="info">
          Choose filters and generate a yearly 12-month Bar Chart.
        </Alert>
      ) : null}

      {yearlyResult ? (
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
                {yearlyResult.year} Yearly Costs
              </Typography>
              <Typography color="text.secondary" variant="body1">
                Chart currency: {yearlyResult.currency}
              </Typography>
            </Box>

            {!hasYearlyCosts ? (
              <Alert severity="info">No costs found for this year.</Alert>
            ) : null}

            <Box
              aria-label="Yearly monthly bar chart"
              role="img"
              sx={{
                height: 360,
                width: "100%"
              }}
            >
              <ResponsiveContainer height="100%" width="100%">
                <RechartsBarChart
                  data={monthlyTotals}
                  margin={{
                    bottom: 16,
                    left: 12,
                    right: 12,
                    top: 16
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="shortLabel" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) =>
                      `${formatAmount(value)} ${yearlyResult.currency}`
                    }
                    labelFormatter={(_label, payload) =>
                      payload?.[0]?.payload?.label ?? ""
                    }
                  />
                  <Bar dataKey="total" fill="#2563eb" name="Monthly total" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </Box>

            <TableContainer>
              <Table aria-label="Yearly monthly totals">
                <TableHead>
                  <TableRow>
                    <TableCell>Month</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell>Currency</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {monthlyTotals.map((entry) => (
                    <TableRow key={entry.month}>
                      <TableCell>{entry.label}</TableCell>
                      <TableCell align="right">
                        {formatAmount(entry.total)}
                      </TableCell>
                      <TableCell>{entry.currency}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </Paper>
      ) : null}
    </Stack>
  );
}

export default YearlyBarChartSection;
