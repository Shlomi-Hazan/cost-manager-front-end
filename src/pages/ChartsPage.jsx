import { useRef, useState } from "react";
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
import YearlyBarChartSection from "../components/charts/YearlyBarChartSection.jsx";
import * as excelExportService from "../services/export/excelExportService.js";
import { buildPieChartExportModel } from "../services/export/exportModels.js";
import * as pdfExportService from "../services/export/pdfExportService.js";
import { captureChartSvgAsPngDataUrl } from "../utils/chartCapture.js";
import {
  addCategoryShare,
  shouldShowPieSliceLabel
} from "../utils/chartPresentation.js";
import { getPieChartExportFilename } from "../utils/exportFilenames.js";
import {
  formatDisplayAmount,
  formatDisplayPercentage
} from "../utils/amountFormat.js";

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

function renderPieLabel(labelProps) {
  const payload = labelProps.payload ?? labelProps;
  const category = payload.category ?? labelProps.name;
  const percentage = payload.percentage ?? labelProps.percent ?? 0;
  const { midAngle } = labelProps;

  if (!shouldShowPieSliceLabel({ percentage })) {
    return null;
  }

  const radius =
    labelProps.middleRadius ??
    (Number(labelProps.innerRadius) + Number(labelProps.outerRadius)) / 2;
  const radians = (Math.PI / 180) * -midAngle;
  const x = labelProps.cx + radius * Math.cos(radians);
  const y = labelProps.cy + radius * Math.sin(radians);

  return (
    <text
      dominantBaseline="central"
      fill="#FFFFFF"
      fontSize={12}
      fontWeight="700"
      textAnchor="middle"
      x={x}
      y={y}
    >
      {`${category} ${formatDisplayPercentage(percentage)}`}
    </text>
  );
}

function ChartsPage() {
  const [filters, setFilters] = useState(getCurrentFilters);
  const [errors, setErrors] = useState({});
  const [chartResult, setChartResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [exportErrorMessage, setExportErrorMessage] = useState("");
  const [exportingAction, setExportingAction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const chartContainerRef = useRef(null);

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
    setExportErrorMessage("");
    setChartResult(null);
    setHasGenerated(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validation = validateFilters(filters);

    setErrors(validation.errors);
    setErrorMessage("");
    setExportErrorMessage("");
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

  function buildCurrentExportModel() {
    return buildPieChartExportModel({
      chartData,
      report: chartResult.report
    });
  }

  async function handleExcelExport() {
    if (!chartResult) {
      return;
    }

    setExportErrorMessage("");
    setExportingAction("excel");

    try {
      await excelExportService.downloadPieChartWorkbook(
        buildCurrentExportModel(),
        getPieChartExportFilename({
          year: chartResult.report.year,
          month: chartResult.report.month,
          currency: chartResult.report.total.currency,
          extension: "xlsx"
        })
      );
    } catch {
      setExportErrorMessage("Could not export the Excel file. Please try again.");
    } finally {
      setExportingAction(null);
    }
  }

  async function handlePdfExport() {
    if (!chartResult) {
      return;
    }

    setExportErrorMessage("");
    setExportingAction("pdf");

    try {
      const chartImageDataUrl = hasPositiveChartData
        ? await captureChartSvgAsPngDataUrl(chartContainerRef.current)
        : null;

      if (hasPositiveChartData && chartImageDataUrl === null) {
        throw new Error("Pie chart image capture failed.");
      }

      await pdfExportService.downloadChartPdf(
        buildCurrentExportModel(),
        getPieChartExportFilename({
          year: chartResult.report.year,
          month: chartResult.report.month,
          currency: chartResult.report.total.currency,
          extension: "pdf"
        }),
        chartImageDataUrl
      );
    } catch {
      setExportErrorMessage("Could not export the chart PDF. Please try again.");
    } finally {
      setExportingAction(null);
    }
  }

  const chartData = chartResult?.chartData ?? [];
  const pieDisplayData = addCategoryShare(chartData);
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

            {exportErrorMessage ? (
              <Alert severity="error">{exportErrorMessage}</Alert>
            ) : null}

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button
                disabled={Boolean(exportingAction)}
                onClick={handleExcelExport}
                variant="outlined"
              >
                {exportingAction === "excel" ? "Exporting..." : "Export Excel"}
              </Button>
              <Button
                disabled={Boolean(exportingAction)}
                onClick={handlePdfExport}
                variant="outlined"
              >
                {exportingAction === "pdf" ? "Exporting..." : "Export PDF"}
              </Button>
            </Stack>

            {!hasChartData ? (
              <Alert severity="info">No costs found for this month.</Alert>
            ) : !hasPositiveChartData ? (
              <Alert severity="info">
                Category totals are zero for this month.
              </Alert>
            ) : (
              <Box
                aria-label="Monthly category pie chart"
                ref={chartContainerRef}
                role="img"
                sx={{
                  height: 360,
                  width: "100%"
                }}
              >
                <ResponsiveContainer height="100%" width="100%">
                  <PieChart>
                    <Pie
                      data={pieDisplayData}
                      dataKey="total"
                      cx="50%"
                      cy={150}
                      innerRadius={60}
                      isAnimationActive={false}
                      label={renderPieLabel}
                      labelLine={false}
                      nameKey="category"
                      outerRadius={120}
                    >
                      {pieDisplayData.map((entry, index) => (
                        <Cell
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                          key={entry.category}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [
                        `${formatDisplayAmount(value)} ${chartResult.report.total.currency}`,
                        name
                      ]}
                    />
                    <Legend
                      formatter={(value, entry) => {
                        const item = entry.payload;

                        return `${value} - ${formatDisplayAmount(item.total)} ${chartResult.report.total.currency} - ${formatDisplayPercentage(item.percentage)}`;
                      }}
                    />
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
                      <TableCell align="right">Share</TableCell>
                      <TableCell>Currency</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pieDisplayData.map((entry) => (
                      <TableRow key={entry.category}>
                        <TableCell>{entry.category}</TableCell>
                        <TableCell align="right">
                          {formatDisplayAmount(entry.total)}
                        </TableCell>
                        <TableCell align="right">
                          {formatDisplayPercentage(entry.percentage)}
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

      <YearlyBarChartSection />
    </Stack>
  );
}

export default ChartsPage;
