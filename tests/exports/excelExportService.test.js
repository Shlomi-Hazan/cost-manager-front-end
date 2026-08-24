import { describe, expect, it } from "vitest";
import {
  createBarChartWorkbookBuffer,
  createPieChartWorkbookBuffer,
  createReportWorkbookBuffer
} from "../../src/services/export/excelExportService.js";
import {
  buildBarChartExportModel,
  buildMonthlyReportExportModel,
  buildPieChartExportModel,
  buildYearlyReportExportModel
} from "../../src/services/export/exportModels.js";

async function loadWorkbook(buffer) {
  const ExcelJS = await import("exceljs");
  const library = ExcelJS.default ?? ExcelJS;
  const workbook = new library.Workbook();

  await workbook.xlsx.load(buffer);

  return workbook;
}

function createCost(description, sum) {
  return {
    id: description,
    sum,
    currency: "USD",
    category: "Food",
    description,
    date: {
      day: 2,
      month: 8,
      year: 2026,
      hour: 9,
      minute: 5
    }
  };
}

describe("excelExportService", () => {
  it("creates a real Monthly XLSX workbook with sorted numeric cost rows", async () => {
    const model = buildMonthlyReportExportModel({
      report: {
        month: 8,
        year: 2026,
        total: { currency: "USD", sum: 127.5 }
      },
      costs: [
        createCost("small", 2),
        createCost("middle", 25.5),
        createCost("large", 100)
      ]
    });
    const buffer = await createReportWorkbookBuffer(model);
    const bytes = new Uint8Array(buffer);
    const workbook = await loadWorkbook(buffer);
    const costsSheet = workbook.getWorksheet("Costs");

    expect(String.fromCharCode(bytes[0], bytes[1])).toBe("PK");
    expect(workbook.getWorksheet("Summary")).toBeTruthy();
    expect(costsSheet).toBeTruthy();
    expect(costsSheet.getCell("E2").value).toBe(2);
    expect(costsSheet.getCell("C2").value).toBe("small");
    expect(costsSheet.getCell("E3").value).toBe(25.5);
    expect(costsSheet.getCell("E4").value).toBe(100);
  });

  it("creates a Yearly XLSX workbook with full Date rows", async () => {
    const model = buildYearlyReportExportModel({
      report: {
        year: 2026,
        total: { currency: "USD", sum: 100 }
      },
      costs: [createCost("January", 100)]
    });
    const workbook = await loadWorkbook(await createReportWorkbookBuffer(model));
    const costsSheet = workbook.getWorksheet("Costs");

    expect(costsSheet.getCell("A2").value).toBe("02/08/2026");
    expect(costsSheet.getCell("E2").value).toBe(100);
  });

  it("creates Pie chart XLSX category totals with numeric totals", async () => {
    const model = buildPieChartExportModel({
      report: {
        month: 8,
        year: 2026,
        total: { currency: "USD", sum: 125 }
      },
      chartData: [{ category: "Food", total: 125 }]
    });
    const workbook = await loadWorkbook(await createPieChartWorkbookBuffer(model));
    const sheet = workbook.getWorksheet("Category Totals");

    expect(sheet.getCell("A2").value).toBe("Food");
    expect(sheet.getCell("B2").value).toBe(125);
  });

  it("creates Bar chart XLSX with all 12 monthly rows including zeros", async () => {
    const monthlyTotals = Array.from({ length: 12 }, (_value, index) => ({
      month: index + 1,
      label: `Month ${index + 1}`,
      shortLabel: `M${index + 1}`,
      total: index === 0 ? 100 : 0,
      currency: "USD"
    }));
    const model = buildBarChartExportModel({
      yearlyResult: {
        year: 2026,
        currency: "USD",
        monthlyTotals
      }
    });
    const workbook = await loadWorkbook(await createBarChartWorkbookBuffer(model));
    const sheet = workbook.getWorksheet("Monthly Totals");

    expect(sheet.rowCount).toBe(13);
    expect(sheet.getCell("A2").value).toBe("Month 1");
    expect(sheet.getCell("B2").value).toBe(100);
    expect(sheet.getCell("B3").value).toBe(0);
    expect(sheet.getCell("B13").value).toBe(0);
  });
});
