import { describe, expect, it } from "vitest";
import {
  createBarChartWorkbookBlob,
  createPieChartWorkbookBlob,
  createReportWorkbookBlob,
  createWorkbookSheets
} from "../../src/services/export/excelExportService.js";
import {
  buildBarChartExportModel,
  buildMonthlyReportExportModel,
  buildPieChartExportModel,
  buildYearlyReportExportModel
} from "../../src/services/export/exportModels.js";

async function getBlobSignature(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());

  return String.fromCharCode(bytes[0], bytes[1]);
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
  it("creates a real Monthly XLSX Blob and passes sorted numeric cost rows", async () => {
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
    const sheets = createWorkbookSheets({
      model,
      rowsSheetName: "Costs"
    });
    const blob = await createReportWorkbookBlob(model);

    expect(await getBlobSignature(blob)).toBe("PK");
    expect(blob.size).toBeGreaterThan(0);
    expect(sheets.map((sheet) => sheet.sheet)).toEqual(["Summary", "Costs"]);
    expect(sheets[1].data).toEqual([
      ["Day", "Time", "Description", "Category", "Sum", "Currency"],
      [2, "09:05", "small", "Food", 2, "USD"],
      [2, "09:05", "middle", "Food", 25.5, "USD"],
      [2, "09:05", "large", "Food", 100, "USD"]
    ]);
    expect(typeof sheets[1].data[1][4]).toBe("number");
  });

  it("creates a Yearly XLSX Blob with full Date rows", async () => {
    const model = buildYearlyReportExportModel({
      report: {
        year: 2026,
        total: { currency: "USD", sum: 100 }
      },
      costs: [createCost("January", 100)]
    });
    const sheets = createWorkbookSheets({
      model,
      rowsSheetName: "Costs"
    });
    const blob = await createReportWorkbookBlob(model);

    expect(await getBlobSignature(blob)).toBe("PK");
    expect(sheets[1].data[1][0]).toBe("02/08/2026");
    expect(sheets[1].data[1][4]).toBe(100);
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
    const sheets = createWorkbookSheets({
      model,
      rowsSheetName: "Category Totals"
    });
    const blob = await createPieChartWorkbookBlob(model);

    expect(await getBlobSignature(blob)).toBe("PK");
    expect(sheets[1].sheet).toBe("Category Totals");
    expect(sheets[1].data[1]).toEqual(["Food", 125, "USD"]);
    expect(typeof sheets[1].data[1][1]).toBe("number");
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
    const sheets = createWorkbookSheets({
      model,
      rowsSheetName: "Monthly Totals"
    });
    const blob = await createBarChartWorkbookBlob(model);

    expect(await getBlobSignature(blob)).toBe("PK");
    expect(sheets[1].data).toHaveLength(13);
    expect(sheets[1].data[1]).toEqual(["Month 1", 100, "USD"]);
    expect(sheets[1].data[2][1]).toBe(0);
    expect(sheets[1].data[12][1]).toBe(0);
  });
});
