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
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { SUPPORTED_CURRENCIES } from "../constants/currencies.js";
import { costsDatabase } from "../lib/costsDatabase.js";
import {
  getCachedExchangeRates,
  refreshExchangeRates
} from "../services/exchangeRatesService.js";
import { aggregateCostsByCategory } from "../utils/chartAggregation.js";

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

const CHART_COLORS = [
  "#2563eb",
  "#0f766e",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#0891b2"
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
  const chartMonth = Number(filters.month);
  const trimmedYear = filters.year.trim();
  const chartYear = Number(trimmedYear);

  if (!Number.isInteger(chartMonth) || chartMonth < 1 || chartMonth > 12) {
    errors.month = "Select a chart month.";
  }

  if (trimmedYear === "") {
    errors.year = "Enter a chart year.";
  } else if (!Number.isFinite(chartYear) || !Number.isInteger(chartYear)) {
    errors.year = "Enter a whole chart year.";
  }

  if (!SUPPORTED_CURRENCIES.includes(filters.currency)) {
    errors.currency = "Select a supported currency.";
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    chartMonth,
    chartYear
  };
}

function getChartErrorMessage(error) {
  if (
    error instanceof Error &&
    (error.message.includes("cached exchange rates") ||
      error.message.includes("Exchange rates"))
  ) {
    return "Exchange rates are unavailable for converting this chart. Please try again.";
  }

  return "Could not generate the monthly category chart. Please try again.";
}

function ChartsPage() {
  const [filters, setFilters] = useState(getCurrentFilters);
  const [errors, setErrors] = useState({});
  const [chartResult, setChartResult] = useState(null);
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
    setChartResult(null);
    setHasGenerated(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validation = validateFilters(filters);

    setErrors(validation.errors);
    setErrorMessage("");
    setChartResult(null);
    setHasGenerated(false);

    if (!validation.isValid) {
      setErrorMessage("Please correct the highlighted chart filters.");
      return;
    }

    setIsLoading(true);

    try {
      try {
        await refreshExchangeRates();
      } catch {
        // Same-currency charts and valid cached rates can still work after refresh failure.
      }

      const report = costsDatabase.getReport(
        filters.currency,
        validation.chartYear,
        validation.chartMonth
      );
      const chartData = aggregateCostsByCategory(
        report.costs,
        filters.currency,
        getCachedExchangeRates()
      );

      setChartResult({
        report,
        chartData
      });
      setHasGenerated(true);
    } catch (error) {
      setErrorMessage(getChartErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  const chartData = chartResult?.chartData ?? [];
  const hasChartData = chartData.length > 0;
  const hasPositiveChartData = chartData.some((entry) => entry.total > 0);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography component="h1" variant="h1">
          Charts
        </Typography>
        <Typography color="text.secondary" variant="body1">
          Visualize monthly cost categories in a selected currency.
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
          <Box>
            <Typography component="h2" variant="h2">
              Monthly Category Pie Chart
            </Typography>
            <Typography color="text.secondary" variant="body1">
              Select a month, year, and target currency for category totals.
            </Typography>
          </Box>

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
                {isLoading ? "Generating..." : "Generate Chart"}
              </Button>
            </Box>
          </Box>
        </Stack>
      </Paper>

      {!hasGenerated && !errorMessage && !isLoading ? (
        <Alert severity="info">
          Choose filters and generate a monthly category Pie Chart.
        </Alert>
      ) : null}

      {chartResult ? (
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
                {getMonthLabel(chartResult.report.month)} {chartResult.report.year}
              </Typography>
              <Typography color="text.secondary" variant="body1">
                Chart currency: {chartResult.report.total.currency}
              </Typography>
            </Box>

            {!hasChartData ? (
              <Alert severity="info">No costs found for this month.</Alert>
            ) : !hasPositiveChartData ? (
              <Alert severity="info">
                Category totals are zero for this month.
              </Alert>
            ) : (
              <Box
                aria-label="Monthly category pie chart"
                role="img"
                sx={{
                  height: 360,
                  width: "100%"
                }}
              >
                <ResponsiveContainer height="100%" width="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="total"
                      innerRadius={60}
                      nameKey="category"
                      outerRadius={120}
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                          key={entry.category}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [
                        `${formatAmount(value)} ${chartResult.report.total.currency}`,
                        name
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            )}

            {hasChartData ? (
              <TableContainer>
                <Table aria-label="Monthly category totals">
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell>Currency</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {chartData.map((entry) => (
                      <TableRow key={entry.category}>
                        <TableCell>{entry.category}</TableCell>
                        <TableCell align="right">
                          {formatAmount(entry.total)}
                        </TableCell>
                        <TableCell>{chartResult.report.total.currency}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : null}
          </Stack>
        </Paper>
      ) : null}

      <Alert severity="info">
        Yearly Bar Chart functionality will be implemented in a later milestone.
      </Alert>
    </Stack>
  );
}

export default ChartsPage;
