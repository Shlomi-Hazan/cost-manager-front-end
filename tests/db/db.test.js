import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../src/lib/db.js";

function setLocalDate(year, month, day) {
  vi.setSystemTime(new Date(year, month - 1, day, 12, 0, 0));
}

function readStoredCosts(databaseName = "costsdb", databaseVersion = 1) {
  const storageKey = `cost-manager:${encodeURIComponent(databaseName)}:v${databaseVersion}:costs`;

  return JSON.parse(localStorage.getItem(storageKey) ?? "[]");
}

describe("module db contract", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    setLocalDate(2026, 8, 22);
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it("opens a database object with addCost and getReport methods", () => {
    const ob = db.openCostsDB("costsdb", 1);

    expect(ob).toEqual({
      addCost: expect.any(Function),
      getReport: expect.any(Function)
    });
  });

  it("accepts an empty database name because the official contract requires a string", () => {
    const ob = db.openCostsDB("", 1);

    expect(ob).toEqual({
      addCost: expect.any(Function),
      getReport: expect.any(Function)
    });
  });

  it("adds a cost, returns required fields, records the date, and does not mutate input", () => {
    const ob = db.openCostsDB("costsdb", 1);
    const inputCost = {
      sum: 200,
      currency: "USD",
      category: "FOOD",
      description: "pizza"
    };

    const result = ob.addCost(inputCost);

    expect(result).toMatchObject({
      sum: 200,
      currency: "USD",
      category: "FOOD",
      description: "pizza",
      date: {
        day: 22,
        month: 8,
        year: 2026
      }
    });
    expect(inputCost).toEqual({
      sum: 200,
      currency: "USD",
      category: "FOOD",
      description: "pizza"
    });
  });

  it("persists costs so reopened database objects can report them", () => {
    const first = db.openCostsDB("costsdb", 1);
    first.addCost({
      sum: 125,
      currency: "USD",
      category: "BOOKS",
      description: "Course book"
    });

    const second = db.openCostsDB("costsdb", 1);
    const report = second.getReport("USD", 2026, 8);

    expect(report.costs).toHaveLength(1);
    expect(report.costs[0]).toMatchObject({
      sum: 125,
      currency: "USD",
      category: "BOOKS",
      description: "Course book",
      date: {
        day: 22
      }
    });
    expect(report.total).toEqual({
      currency: "USD",
      sum: 125
    });
  });

  it("isolates stored costs by database name and database version", () => {
    const base = db.openCostsDB("costsdb", 1);
    const otherName = db.openCostsDB("otherdb", 1);
    const otherVersion = db.openCostsDB("costsdb", 2);

    base.addCost({
      sum: 50,
      currency: "USD",
      category: "BASE",
      description: "Base database"
    });
    otherName.addCost({
      sum: 75,
      currency: "USD",
      category: "OTHER_NAME",
      description: "Other database name"
    });
    otherVersion.addCost({
      sum: 100,
      currency: "USD",
      category: "OTHER_VERSION",
      description: "Other database version"
    });

    expect(base.getReport("USD", 2026, 8).total.sum).toBe(50);
    expect(otherName.getReport("USD", 2026, 8).total.sum).toBe(75);
    expect(otherVersion.getReport("USD", 2026, 8).total.sum).toBe(100);
  });

  it("filters explicit reports by requested year and month", () => {
    const ob = db.openCostsDB("costsdb", 1);

    setLocalDate(2026, 8, 10);
    ob.addCost({
      sum: 100,
      currency: "USD",
      category: "MATCH",
      description: "August 2026 first"
    });

    setLocalDate(2026, 8, 11);
    ob.addCost({
      sum: 150,
      currency: "USD",
      category: "MATCH",
      description: "August 2026 second"
    });

    setLocalDate(2026, 7, 10);
    ob.addCost({
      sum: 200,
      currency: "USD",
      category: "OUTSIDE_MONTH",
      description: "July 2026"
    });

    setLocalDate(2025, 8, 10);
    ob.addCost({
      sum: 300,
      currency: "USD",
      category: "OUTSIDE_YEAR",
      description: "August 2025"
    });

    const report = ob.getReport("USD", 2026, 8);

    expect(report).toMatchObject({
      year: 2026,
      month: 8,
      total: {
        currency: "USD",
        sum: 250
      }
    });
    expect(report.costs).toHaveLength(2);
    expect(report.costs.map((cost) => cost.description)).toEqual([
      "August 2026 first",
      "August 2026 second"
    ]);
  });

  it("defaults reports to the current month and year", () => {
    const ob = db.openCostsDB("costsdb", 1);

    setLocalDate(2026, 9, 5);
    ob.addCost({
      sum: 90,
      currency: "USD",
      category: "CURRENT",
      description: "Current month"
    });

    const report = ob.getReport("USD");

    expect(report).toMatchObject({
      year: 2026,
      month: 9,
      total: {
        currency: "USD",
        sum: 90
      }
    });
  });

  it("returns an empty report for a month without costs", () => {
    const ob = db.openCostsDB("costsdb", 1);

    const report = ob.getReport("USD", 2026, 8);

    expect(report).toEqual({
      year: 2026,
      month: 8,
      costs: [],
      total: {
        currency: "USD",
        sum: 0
      }
    });
  });

  it("preserves original currencies in localStorage and report items", () => {
    const ob = db.openCostsDB("costsdb", 1);

    ob.addCost({
      sum: 120,
      currency: "GBP",
      category: "Education",
      description: "Course"
    });

    const report = ob.getReport("GBP", 2026, 8);
    const storedCosts = readStoredCosts();

    expect(storedCosts[0]).toMatchObject({
      sum: 120,
      currency: "GBP",
      date: {
        day: 22,
        month: 8,
        year: 2026
      }
    });
    expect(report.costs[0]).toMatchObject({
      sum: 120,
      currency: "GBP",
      date: {
        day: 22
      }
    });
  });

  it("accepts each required currency identifier for same-currency reports", () => {
    const currencies = ["USD", "ILS", "GBP", "EURO"];

    currencies.forEach((currency, index) => {
      const ob = db.openCostsDB(`costsdb-${currency}`, 1);

      ob.addCost({
        sum: 10 + index,
        currency,
        category: "CATEGORY",
        description: `${currency} cost`
      });

      expect(ob.getReport(currency, 2026, 8).total).toEqual({
        currency,
        sum: 10 + index
      });
    });
  });

  it("supports the official same-currency grader-style sample", () => {
    const ob = db.openCostsDB("costsdb", 1);

    const result1 = ob.addCost({
      sum: 200,
      currency: "USD",
      category: "FOOD",
      description: "pizza"
    });
    const result2 = ob.addCost({
      sum: 400,
      currency: "USD",
      category: "CAR",
      description: "fuel"
    });
    const data = ob.getReport("USD");

    expect(result1).toEqual(expect.any(Object));
    expect(result2).toEqual(expect.any(Object));
    expect(data).toEqual(expect.any(Object));
    expect(data.total).toEqual({
      currency: "USD",
      sum: 600
    });
  });
});
