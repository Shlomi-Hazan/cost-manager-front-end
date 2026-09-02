/*
 * TEAM EXTENSION (X-007): generates real .xlsx workbooks (via
 * write-excel-file, not a renamed CSV) for the Monthly/Yearly reports and
 * Pie/Bar charts. All styling constants below only affect how the exported
 * spreadsheet looks — numeric cells are still written as real numbers (see
 * AMOUNT_FORMAT), so the exported file remains usable for further
 * calculation, not just visual inspection.
 */
import { downloadBlob } from './downloadService.js';

const SHEET_NAMES = {
  summary: 'Summary',
  reportCosts: 'Costs',
  categoryTotals: 'Category Totals',
  monthlyTotals: 'Monthly Totals'
};

const AMOUNT_FORMAT = '#,##0.######';
const PERCENTAGE_FORMAT = '0.0%';
const YEAR_FORMAT = '0';

const COLORS = {
  primary: '#2563EB',
  darkText: '#1E293B',
  secondaryText: '#64748B',
  lightBackground: '#F8FAFC',
  border: '#CBD5E1',
  white: '#FFFFFF'
};

const HEADER_STYLE = {
  backgroundColor: COLORS.primary,
  borderColor: COLORS.border,
  borderStyle: 'thin',
  fontWeight: 'bold',
  textColor: COLORS.white
};

const BODY_CELL_STYLE = {
  borderColor: COLORS.border,
  borderStyle: 'thin',
  alignVertical: 'top'
};

const COLUMN_WIDTHS = {
  Category: 22,
  Currency: 14,
  Date: 14,
  Day: 10,
  Description: 36,
  Month: 18,
  Share: 12,
  Sum: 16,
  Time: 10,
  Total: 16
};

// Dynamically imported so the (fairly large) write-excel-file library is
// only downloaded when a user actually exports something, not as part of
// the app's initial bundle.
async function loadWriter() {
  const module = await import('write-excel-file/browser');

  return module.default;
}

function titleCell(value, options = {}) {
  return {
    value,
    columnSpan: 2,
    fontWeight: 'bold',
    textColor: COLORS.darkText,
    ...options
  };
}

function headerCell(value) {
  return {
    value,
    ...HEADER_STYLE
  };
}

function metadataLabelCell(value, isEmphasized = false) {
  return {
    value,
    ...BODY_CELL_STYLE,
    backgroundColor: isEmphasized ? '#DBEAFE' : COLORS.lightBackground,
    fontWeight: 'bold',
    textColor: COLORS.darkText
  };
}

function textCell(value, options = {}) {
  return {
    value,
    ...BODY_CELL_STYLE,
    textColor: COLORS.darkText,
    ...options
  };
}

function numericCell(value, format = AMOUNT_FORMAT, options = {}) {
  return {
    value,
    type: Number,
    format,
    ...BODY_CELL_STYLE,
    align: 'right',
    textColor: COLORS.darkText,
    ...options
  };
}

function createValueCell(label, value) {
  const isEmphasized = label === 'Total' || label === 'Annual Total';

  if (label === 'Year' && typeof value === 'number') {
    return numericCell(value, YEAR_FORMAT);
  }

  if (typeof value === 'number') {
    return numericCell(value, AMOUNT_FORMAT, {
      backgroundColor: isEmphasized ? '#DBEAFE' : undefined,
      fontWeight: isEmphasized ? 'bold' : undefined
    });
  }

  return textCell(value, {
    backgroundColor: isEmphasized ? '#DBEAFE' : undefined,
    fontWeight: isEmphasized ? 'bold' : undefined
  });
}

function createSummarySheet(model) {
  return {
    sheet: SHEET_NAMES.summary,
    data: [
      [titleCell('COST MANAGER', { fontSize: 18 }), null],
      [titleCell(model.title, { fontSize: 14, textColor: COLORS.primary }), null],
      [null, null],
      [headerCell('Field'), headerCell('Value')],
      ...model.summary.map(([label, value]) => {
        const isEmphasized = label === 'Total' || label === 'Annual Total';

        return [
          metadataLabelCell(label, isEmphasized),
          createValueCell(label, value)
        ];
      })
    ],
    columns: [{ width: 24 }, { width: 32 }]
  };
}

function createDataCell(column, value) {
  if (column === 'Sum' || column === 'Total') {
    return numericCell(value);
  }

  if (column === 'Share') {
    return numericCell(value, PERCENTAGE_FORMAT);
  }

  return textCell(value, {
    wrap: column === 'Description' || column === 'Category'
  });
}

// Builds one worksheet: a header row plus one formatted data row per entry.
function createRowsSheet(sheetName, columns, rows) {
  return {
    sheet: sheetName,
    // Header row, then one formatted row per entry, in column order.
    data: [
      columns.map((column) => headerCell(column)),
      ...rows.map((row) =>
        columns.map((column, index) =>
          createDataCell(column, Object.values(row)[index])
        )
      )
    ],
    columns: columns.map((column) => ({
      width: COLUMN_WIDTHS[column] ?? Math.max(14, column.length + 4)
    })),
    stickyRowsCount: 1
  };
}

export function createWorkbookSheets({ model, rowsSheetName }) {
  return [
    createSummarySheet(model),
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
