import { downloadBlob } from "./downloadService.js";

const SHEET_NAMES = {
  summary: "Summary",
  reportCosts: "Costs",
  categoryTotals: "Category Totals",
  monthlyTotals: "Monthly Totals"
};

async function createWorkbook() {
  const ExcelJS = await import("exceljs");
  const library = ExcelJS.default ?? ExcelJS;

  return new library.Workbook();
}

function addSummarySheet(workbook, summaryRows) {
  const sheet = workbook.addWorksheet(SHEET_NAMES.summary);

  sheet.addRow(["Field", "Value"]);
  summaryRows.forEach((row) => sheet.addRow(row));
  sheet.columns = [{ width: 24 }, { width: 24 }];
}

function addRowsSheet(workbook, sheetName, columns, rows) {
  const sheet = workbook.addWorksheet(sheetName);

  sheet.addRow(columns);
  rows.forEach((row) => sheet.addRow(Object.values(row)));
  sheet.columns = columns.map((column) => ({
    header: column,
    width: Math.max(14, column.length + 4)
  }));
}

async function createWorkbookBuffer({ model, rowsSheetName }) {
  const workbook = await createWorkbook();

  addSummarySheet(workbook, model.summary);
  addRowsSheet(workbook, rowsSheetName, model.columns, model.rows);

  return workbook.xlsx.writeBuffer();
}

export function createReportWorkbookBuffer(model) {
  return createWorkbookBuffer({
    model,
    rowsSheetName: SHEET_NAMES.reportCosts
  });
}

export function createPieChartWorkbookBuffer(model) {
  return createWorkbookBuffer({
    model,
    rowsSheetName: SHEET_NAMES.categoryTotals
  });
}

export function createBarChartWorkbookBuffer(model) {
  return createWorkbookBuffer({
    model,
    rowsSheetName: SHEET_NAMES.monthlyTotals
  });
}

export async function downloadWorkbook(model, filename, createBuffer) {
  const buffer = await createBuffer(model);
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });

  downloadBlob(blob, filename);
}

export function downloadReportWorkbook(model, filename) {
  return downloadWorkbook(model, filename, createReportWorkbookBuffer);
}

export function downloadPieChartWorkbook(model, filename) {
  return downloadWorkbook(model, filename, createPieChartWorkbookBuffer);
}

export function downloadBarChartWorkbook(model, filename) {
  return downloadWorkbook(model, filename, createBarChartWorkbookBuffer);
}
