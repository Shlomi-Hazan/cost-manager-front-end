import { downloadBlob } from "./downloadService.js";

const SHEET_NAMES = {
  summary: "Summary",
  reportCosts: "Costs",
  categoryTotals: "Category Totals",
  monthlyTotals: "Monthly Totals"
};

async function loadWriter() {
  const module = await import("write-excel-file/browser");

  return module.default;
}

function createSummarySheet(summaryRows) {
  return {
    sheet: SHEET_NAMES.summary,
    data: [["Field", "Value"], ...summaryRows],
    columns: [{ width: 24 }, { width: 24 }]
  };
}

function createRowsSheet(sheetName, columns, rows) {
  return {
    sheet: sheetName,
    data: [columns, ...rows.map((row) => Object.values(row))],
    columns: columns.map((column) => ({
      width: Math.max(14, column.length + 4)
    }))
  };
}

export function createWorkbookSheets({ model, rowsSheetName }) {
  return [
    createSummarySheet(model.summary),
    createRowsSheet(rowsSheetName, model.columns, model.rows)
  ];
}

async function createWorkbookBlob({ model, rowsSheetName }) {
  const writeExcelFile = await loadWriter();
  const sheets = createWorkbookSheets({ model, rowsSheetName });

  return writeExcelFile(sheets).toBlob();
}

export function createReportWorkbookBlob(model) {
  return createWorkbookBlob({
    model,
    rowsSheetName: SHEET_NAMES.reportCosts
  });
}

export function createPieChartWorkbookBlob(model) {
  return createWorkbookBlob({
    model,
    rowsSheetName: SHEET_NAMES.categoryTotals
  });
}

export function createBarChartWorkbookBlob(model) {
  return createWorkbookBlob({
    model,
    rowsSheetName: SHEET_NAMES.monthlyTotals
  });
}

export async function downloadWorkbook(model, filename, createBlob) {
  const blob = await createBlob(model);

  downloadBlob(blob, filename);
}

export function downloadReportWorkbook(model, filename) {
  return downloadWorkbook(model, filename, createReportWorkbookBlob);
}

export function downloadPieChartWorkbook(model, filename) {
  return downloadWorkbook(model, filename, createPieChartWorkbookBlob);
}

export function downloadBarChartWorkbook(model, filename) {
  return downloadWorkbook(model, filename, createBarChartWorkbookBlob);
}
