import { describe, expect, it } from "vitest";
import {
  createChartPdfBuffer,
  createReportPdfBuffer
} from "../../src/services/export/pdfExportService.js";
import {
  buildBarChartExportModel,
  buildMonthlyReportExportModel,
  buildPieChartExportModel,
  buildYearlyReportExportModel
} from "../../src/services/export/exportModels.js";

function decodePdf(buffer) {
  return new TextDecoder().decode(new Uint8Array(buffer));
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

describe("pdfExportService", () => {
  it("creates a Monthly report PDF with title, metadata, total, and rows", async () => {
    const model = buildMonthlyReportExportModel({
      report: {
        month: 8,
        year: 2026,
        total: { currency: "USD", sum: 127.5 }
      },
      costs: [
        createCost("large", 100),
        createCost("small", 2)
      ]
    });
    const text = decodePdf(await createReportPdfBuffer(model));

    expect(text.startsWith("%PDF-")).toBe(true);
    expect(text).toContain("Monthly Report");
    expect(text).toContain("Period: August 2026");
    expect(text).toContain("Total: 127.5 USD");
    expect(text.indexOf("large")).toBeLessThan(text.indexOf("small"));
  });

  it("creates a Yearly report PDF with year and date rows", async () => {
    const model = buildYearlyReportExportModel({
      report: {
        year: 2026,
        total: { currency: "USD", sum: 100 }
      },
      costs: [createCost("year row", 100)]
    });
    const text = decodePdf(await createReportPdfBuffer(model));

    expect(text.startsWith("%PDF-")).toBe(true);
    expect(text).toContain("Yearly Report");
    expect(text).toContain("Year: 2026");
    expect(text).toContain("02/08/2026");
  });

  it("creates a Pie chart PDF with supporting data and no-data handling", async () => {
    const model = buildPieChartExportModel({
      report: {
        month: 8,
        year: 2026,
        total: { currency: "USD", sum: 0 }
      },
      chartData: []
    });
    const text = decodePdf(await createChartPdfBuffer(model, null));

    expect(text.startsWith("%PDF-")).toBe(true);
    expect(text).toContain("Monthly Category Pie Chart");
    expect(text).toContain("No chart visualization is available");
  });

  it("creates a Bar chart PDF with all supporting rows", async () => {
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
    const text = decodePdf(await createChartPdfBuffer(model, null));

    expect(text.startsWith("%PDF-")).toBe(true);
    expect(text).toContain("Yearly 12-Month Bar Chart");
    expect(text).toContain("Month 1");
    expect(text).toContain("Month 12");
  });
});
