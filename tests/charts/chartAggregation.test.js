import { describe, expect, it } from "vitest";
import { aggregateCostsByCategory } from "../../src/utils/chartAggregation.js";

const validRates = {
  USD: 1,
  GBP: 0.5,
  EURO: 0.8,
  ILS: 4
};

describe("chart aggregation", () => {
  it("returns empty aggregation for an empty cost array", () => {
    expect(aggregateCostsByCategory([], "USD")).toEqual([]);
  });

  it("aggregates one category in one currency", () => {
    expect(
      aggregateCostsByCategory(
        [
          {
            sum: 100,
            currency: "USD",
            category: "FOOD"
          }
        ],
        "USD"
      )
    ).toEqual([
      {
        category: "FOOD",
        total: 100
      }
    ]);
  });

  it("sums multiple costs in the same category", () => {
    expect(
      aggregateCostsByCategory(
        [
          {
            sum: 100,
            currency: "USD",
            category: "FOOD"
          },
          {
            sum: 25,
            currency: "USD",
            category: "FOOD"
          }
        ],
        "USD"
      )
    ).toEqual([
      {
        category: "FOOD",
        total: 125
      }
    ]);
  });

  it("keeps multiple categories separate", () => {
    expect(
      aggregateCostsByCategory(
        [
          {
            sum: 100,
            currency: "USD",
            category: "FOOD"
          },
          {
            sum: 25,
            currency: "USD",
            category: "TRAVEL"
          }
        ],
        "USD"
      )
    ).toEqual([
      {
        category: "FOOD",
        total: 100
      },
      {
        category: "TRAVEL",
        total: 25
      }
    ]);
  });

  it("converts mixed currencies with shared rates", () => {
    const aggregation = aggregateCostsByCategory(
      [
        {
          sum: 100,
          currency: "USD",
          category: "FOOD"
        },
        {
          sum: 50,
          currency: "GBP",
          category: "FOOD"
        },
        {
          sum: 25,
          currency: "USD",
          category: "TRAVEL"
        }
      ],
      "USD",
      validRates
    );

    expect(aggregation).toEqual([
      {
        category: "FOOD",
        total: 200
      },
      {
        category: "TRAVEL",
        total: 25
      }
    ]);
    expect(aggregation.reduce((sum, category) => sum + category.total, 0)).toBe(
      225
    );
  });

  it("aggregates same-currency costs without rates", () => {
    expect(
      aggregateCostsByCategory(
        [
          {
            sum: 40,
            currency: "EURO",
            category: "BOOKS"
          }
        ],
        "EURO"
      )
    ).toEqual([
      {
        category: "BOOKS",
        total: 40
      }
    ]);
  });

  it("fails when rates are missing and conversion is required", () => {
    expect(() =>
      aggregateCostsByCategory(
        [
          {
            sum: 50,
            currency: "GBP",
            category: "TRAVEL"
          }
        ],
        "USD"
      )
    ).toThrow("Exchange rates");
  });

  it("preserves decimal precision without rounding", () => {
    expect(
      aggregateCostsByCategory(
        [
          {
            sum: 0.1,
            currency: "USD",
            category: "FOOD"
          },
          {
            sum: 0.2,
            currency: "USD",
            category: "FOOD"
          }
        ],
        "USD"
      )
    ).toEqual([
      {
        category: "FOOD",
        total: 0.30000000000000004
      }
    ]);
  });

  it("does not mutate input costs", () => {
    const costs = [
      {
        sum: 50,
        currency: "GBP",
        category: "FOOD"
      }
    ];

    aggregateCostsByCategory(costs, "USD", validRates);

    expect(costs).toEqual([
      {
        sum: 50,
        currency: "GBP",
        category: "FOOD"
      }
    ]);
  });

  it("preserves category strings exactly", () => {
    expect(
      aggregateCostsByCategory(
        [
          {
            sum: 10,
            currency: "USD",
            category: "FOOD"
          },
          {
            sum: 20,
            currency: "USD",
            category: "Food"
          },
          {
            sum: 30,
            currency: "USD",
            category: "food"
          }
        ],
        "USD"
      )
    ).toEqual([
      {
        category: "FOOD",
        total: 10
      },
      {
        category: "Food",
        total: 20
      },
      {
        category: "food",
        total: 30
      }
    ]);
  });
});
