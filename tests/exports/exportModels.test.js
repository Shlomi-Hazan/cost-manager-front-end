import { describe, expect, it } from "vitest";
import {
  buildBarChartExportModel,
  buildMonthlyReportExportModel,
  buildPieChartExportModel,
  buildYearlyReportExportModel
} from "../../src/services/export/exportModels.js";

function createCost(description, overrides = {}) {
  return {
    id: description,
    sum: 1,
    currency: "USD",
    category: "Food",
    description,
    date: {
      day: 2,
      month: 8,
      year: 2026,
      hour: 9,
      minute: 5
    },
    ...overrides
  };
}

describe("exportModels", () => {
  it("builds Monthly metadata and preserves sorted row order", () => {
    const costs = [
      createCost("largest", { sum: 100 }),
      createCost("middle", { sum: 25.5, currency: "GBP" }),
      createCost("smallest", { sum: 2 })
    ];
    const model = buildMonthlyReportExportModel({
      report: {
        month: 8,
        year: 2026,
        total: { currency: "USD", sum: 177.5 }
      },
      costs
    });

    expect(model.summary).toContainEqual(["Period", "August 2026"]);
    expect(model.summary).toContainEqual(["Number of Costs", 3]);
    expect(model.metadata.numberOfCosts).toBe(3);
    expect(model.metadata.total).toBe(177.5);
    expect(model.rows.map((row) => row.description)).toEqual([
      "largest",
      "middle",
      "smallest"
    ]);
    expect(model.rows[0]).toMatchObject({
      day: 2,
      time: "09:05",
      sum: 100,
      currency: "USD"
    });
    expect(model.rows[1].currency).toBe("GBP");
  });

  it("builds Yearly metadata with Date and Time formatting", () => {
    const model = buildYearlyReportExportModel({
      report: {
        year: 2026,
        total: { currency: "ILS", sum: 400 }
      },
      costs: [
        createCost("December", {
          date: {
            day: 5,
            month: 12,
            year: 2026,
            hour: 21,
            minute: 14
          }
        })
      ]
    });

    expect(model.summary).toContainEqual(["Year", 2026]);
    expect(model.summary).toContainEqual(["Report Currency", "ILS"]);
    expect(model.summary).toContainEqual(["Number of Costs", 1]);
    expect(model.metadata.numberOfCosts).toBe(1);
    expect(model.rows[0]).toMatchObject({
      date: "05/12/2026",
      time: "21:14",
      description: "December"
    });
  });

  it("builds Pie chart metadata and category rows", () => {
    const model = buildPieChartExportModel({
      report: {
        month: 8,
        year: 2026,
        total: { currency: "USD", sum: 125 }
      },
      chartData: [
        { category: "Food", total: 100 },
        { category: "Travel", total: 25 }
      ]
    });

    expect(model.summary).toContainEqual(["Period", "August 2026"]);
    expect(model.summary).toContainEqual(["Total", 125]);
    expect(model.summary).toContainEqual(["Number of Categories", 2]);
    expect(model.metadata.total).toBe(125);
    expect(model.metadata.categoryCount).toBe(2);
    expect(model.rows).toEqual([
      { category: "Food", total: 100, percentage: 0.8, currency: "USD" },
      { category: "Travel", total: 25, percentage: 0.2, currency: "USD" }
    ]);
    expect(model.rows.reduce((sum, row) => sum + row.percentage, 0)).toBeCloseTo(
      1
    );
  });

  it("builds Bar chart metadata and preserves all 12 rows", () => {
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

    expect(model.summary).toContainEqual(["Year", 2026]);
    expect(model.summary).toContainEqual(["Annual Total", 100]);
    expect(model.summary).toContainEqual(["Months With Costs", 1]);
    expect(model.metadata.annualTotal).toBe(100);
    expect(model.metadata.monthsWithCosts).toBe(1);
    expect(model.rows).toHaveLength(12);
    expect(model.rows[0]).toEqual({
      month: "Month 1",
      total: 100,
      currency: "USD"
    });
    expect(model.rows[1].total).toBe(0);
  });

  it("builds empty Pie chart percentages without division by zero", () => {
    const model = buildPieChartExportModel({
      report: {
        month: 8,
        year: 2026,
        total: { currency: "USD", sum: 0 }
      },
      chartData: []
    });

    expect(model.rows).toEqual([]);
    expect(model.summary).toContainEqual(["Total", 0]);
    expect(model.summary).toContainEqual(["Number of Categories", 0]);
    expect(model.metadata.categoryCount).toBe(0);
  });

  it("keeps numeric values numeric and does not mutate inputs", () => {
    const costs = [createCost("original", { sum: 25.5 })];
    const originalCost = structuredClone(costs[0]);
    const model = buildMonthlyReportExportModel({
      report: {
        month: 8,
        year: 2026,
        total: { currency: "USD", sum: 25.5 }
      },
      costs
    });

    expect(typeof model.summary.find(([field]) => field === "Total")[1]).toBe(
      "number"
    );
    expect(typeof model.rows[0].sum).toBe("number");
    expect(costs[0]).toEqual(originalCost);
  });

  it("supports empty data", () => {
    const model = buildMonthlyReportExportModel({
      report: {
        month: 9,
        year: 2026,
        total: { currency: "USD", sum: 0 }
      },
      costs: []
    });

    expect(model.rows).toEqual([]);
    expect(model.summary).toContainEqual(["Total", 0]);
  });
});
