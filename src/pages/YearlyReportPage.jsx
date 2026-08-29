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
import { buildDetailedYearlyReport } from "../services/detailedReportsService.js";
import { refreshExchangeRates } from "../services/exchangeRatesService.js";
import * as excelExportService from "../services/export/excelExportService.js";
import {
  buildYearlyReportExportModel
} from "../services/export/exportModels.js";
import * as pdfExportService from "../services/export/pdfExportService.js";
import {
  getYearlyReportExportFilename
} from "../utils/exportFilenames.js";
import { formatDisplayAmount } from "../utils/amountFormat.js";

/*
 * TEAM EXTENSION (X-005): a full-year detail report, in addition to the
 * course-required Monthly Report. Follows the same filter/generate/export
 * pattern as MonthlyReportPage.jsx by design, so the two report screens
 * behave predictably the same way; see that file for the more detailed
 * comments on the shared pattern (rate refresh, sortable table, exports).
 */

function getCurrentFilters() {
  return {
    year: String(new Date().getFullYear()),
    currency: "USD"
  };
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

function YearlyReportPage({ headingComponent = "h1" }) {
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

  function buildCurrentExportModel() {
    return buildYearlyReportExportModel({
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
        getYearlyReportExportFilename({
          year: report.year,
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
        getYearlyReportExportFilename({
          year: report.year,
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
      <PageHeader component={headingComponent} title="Yearly Report">
        Select a year and currency to review all cost entries for that year.
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
                  Generate Yearly Report
                </LoadingButtonLabel>
              </Button>
            </Box>
          </Box>
        </Stack>
      </SectionCard>

      {!hasGenerated && !errorMessage && !isLoading ? (
        <Alert severity="info">
          Choose filters and generate a detailed yearly report.
        </Alert>
      ) : null}

      {report ? (
        <SectionCard>
          <Stack spacing={3}>
            <Box>
              <Typography component="h2" variant="h2">
                {report.year} Yearly Report
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
        </SectionCard>
      ) : null}
    </Stack>
  );
}

export default YearlyReportPage;
