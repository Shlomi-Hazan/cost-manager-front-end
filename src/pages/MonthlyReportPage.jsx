import { useState } from "react";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import LoadingButtonLabel from "../components/common/LoadingButtonLabel.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import SectionCard from "../components/common/SectionCard.jsx";
import SortableReportTable from "../components/reports/SortableReportTable.jsx";
import { SUPPORTED_CURRENCIES } from "../constants/currencies.js";
import { useReportSorting } from "../hooks/useReportSorting.js";
import { costsDatabase } from "../lib/costsDatabase.js";
import { buildDetailedMonthlyReport } from "../services/detailedReportsService.js";
import { refreshExchangeRates } from "../services/exchangeRatesService.js";
import * as excelExportService from "../services/export/excelExportService.js";
import {
  buildMonthlyReportExportModel
} from "../services/export/exportModels.js";
import * as pdfExportService from "../services/export/pdfExportService.js";
import {
  getMonthlyReportExportFilename
} from "../utils/exportFilenames.js";
import { formatDisplayAmount } from "../utils/amountFormat.js";

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

function MonthlyReportPage({ headingComponent = "h1" }) {
  const [filters, setFilters] = useState(getCurrentFilters);
  const [errors, setErrors] = useState({});
  const [report, setReport] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [exportErrorMessage, setExportErrorMessage] = useState("");
  const [exportingAction, setExportingAction] = useState(null);
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
    setExportErrorMessage("");
    setReport(null);
    setHasGenerated(false);
    resetSort();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validation = validateFilters(filters);

    setErrors(validation.errors);
    setErrorMessage("");
    setExportErrorMessage("");
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

      const nextReport = buildDetailedMonthlyReport(
        costsDatabase,
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

  function buildCurrentExportModel() {
    return buildMonthlyReportExportModel({
      costs: sortedCosts,
      report
    });
  }

  async function handleExcelExport() {
    if (!report) {
      return;
    }

    setExportErrorMessage("");
    setExportingAction("excel");

    try {
      await excelExportService.downloadReportWorkbook(
        buildCurrentExportModel(),
        getMonthlyReportExportFilename({
          year: report.year,
          month: report.month,
          currency: report.total.currency,
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
    if (!report) {
      return;
    }

    setExportErrorMessage("");
    setExportingAction("pdf");

    try {
      await pdfExportService.downloadReportPdf(
        buildCurrentExportModel(),
        getMonthlyReportExportFilename({
          year: report.year,
          month: report.month,
          currency: report.total.currency,
          extension: "pdf"
        })
      );
    } catch {
      setExportErrorMessage("Could not export the PDF file. Please try again.");
    } finally {
      setExportingAction(null);
    }
  }

  return (
    <Stack spacing={3}>
      <PageHeader component={headingComponent} title="Monthly Report">
        Select a month, year, and currency to review detailed cost entries.
      </PageHeader>

      <SectionCard
        component="form"
        onSubmit={handleSubmit}
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
              <Button
                disabled={isLoading}
                startIcon={
                  isLoading ? null : <AssessmentOutlinedIcon aria-hidden="true" />
                }
                type="submit"
                variant="contained"
              >
                <LoadingButtonLabel
                  isLoading={isLoading}
                  loadingText="Generating..."
                >
                  Generate Report
                </LoadingButtonLabel>
              </Button>
            </Box>
          </Box>
        </Stack>
      </SectionCard>

      {!hasGenerated && !errorMessage && !isLoading ? (
        <Alert severity="info">
          Choose filters and generate a detailed monthly report.
        </Alert>
      ) : null}

      {report ? (
        <SectionCard>
          <Stack spacing={3}>
            <Box>
              <Typography component="h2" variant="h2">
                {getMonthLabel(report.month)} {report.year}
              </Typography>
              <Typography color="text.secondary" variant="body1">
                Report currency: {report.total.currency}
              </Typography>
              <Typography fontWeight={700} variant="body1">
                Total: {formatDisplayAmount(report.total.sum)}{" "}
                {report.total.currency}
              </Typography>
            </Box>

            {exportErrorMessage ? (
              <Alert severity="error">{exportErrorMessage}</Alert>
            ) : null}

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button
                disabled={Boolean(exportingAction)}
                onClick={handleExcelExport}
                startIcon={
                  exportingAction === "excel" ? null : (
                    <TableChartOutlinedIcon aria-hidden="true" />
                  )
                }
                variant="outlined"
              >
                <LoadingButtonLabel
                  isLoading={exportingAction === "excel"}
                  loadingText="Exporting..."
                >
                  Export Excel
                </LoadingButtonLabel>
              </Button>
              <Button
                disabled={Boolean(exportingAction)}
                onClick={handlePdfExport}
                startIcon={
                  exportingAction === "pdf" ? null : (
                    <PictureAsPdfOutlinedIcon aria-hidden="true" />
                  )
                }
                variant="outlined"
              >
                <LoadingButtonLabel
                  isLoading={exportingAction === "pdf"}
                  loadingText="Exporting..."
                >
                  Export PDF
                </LoadingButtonLabel>
              </Button>
            </Stack>

            {report.costs.length === 0 ? (
              <Alert severity="info">No costs found for this month.</Alert>
            ) : (
              <SortableReportTable
                costs={sortedCosts}
                dateMode="monthly"
                onRequestSort={requestSort}
                sortDirection={sortDirection}
                sortKey={sortKey}
              />
            )}
          </Stack>
        </SectionCard>
      ) : null}
    </Stack>
  );
}

export default MonthlyReportPage;
