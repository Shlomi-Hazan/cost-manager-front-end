import { readFileSync } from "node:fs";
import path from "node:path";
import { cwd } from "node:process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/*
 * Contract tests for the standalone Vanilla version of db.js
 * (vanilla/db.js) — the exact file that will be submitted separately for
 * grading. This suite is intentionally structured to mirror
 * tests/db/db.test.js so both db.js versions are checked against
 * equivalent cases (see docs/TEST_PLAN.md §15, module/Vanilla parity).
 *
 * Crucially, this does NOT import vanilla/db.js as an ES module (which
 * would prove nothing about standalone <script> compatibility, since the
 * file has no import/export statements to import in the first place).
 * Instead it reads the file's raw source text and evaluates it directly
 * (see loadVanillaDb() below), the same way a browser would after
 * <script src="db.js"></script> — so a passing suite here is real evidence
 * that the file works standalone, not just that its logic is correct.
 */
const vanillaDbSource = readFileSync(
  path.join(cwd(), "vanilla", "db.js"),
  "utf8"
);

function setLocalDate(year, month, day, hour = 12, minute = 0) {
  vi.setSystemTime(new Date(year, month - 1, day, hour, minute, 0));
}

function getStorageKey(databaseName, databaseVersion) {
  return `cost-manager:${encodeURIComponent(databaseName)}:v${databaseVersion}:costs`;
}

function setCachedExchangeRates(rates) {
  localStorage.setItem("cost-manager:exchange-rates-cache", JSON.stringify(rates));
}

function readStoredCosts(databaseName = "costsdb", databaseVersion = 1) {
  return JSON.parse(localStorage.getItem(getStorageKey(databaseName, databaseVersion)) ?? "[]");
}

// Clears any previous global `db` first so each test starts from a fresh
// load, exactly like opening a new page that includes the script tag.
function loadVanillaDb() {
  delete window.db;
  delete globalThis.db;
  window.eval(vanillaDbSource);

  return window.db;
}

function expectDatabaseObject(ob) {
  expect(ob).toEqual({
    addCost: expect.any(Function),
    getAllCosts: expect.any(Function),
    getCostById: expect.any(Function),
    updateCost: expect.any(Function),
    deleteCost: expect.any(Function),
    getReport: expect.any(Function)
  });
}

function editableCost(overrides = {}) {
  return {
    sum: 300,
    currency: "USD",
    category: "Updated",
    description: "Updated cost",
    date: {
      day: 29,
      month: 2,
      year: 2028,
      hour: 9,
      minute: 45
    },
    ...overrides
  };
}

describe("standalone Vanilla db.js", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    setLocalDate(2026, 8, 22);
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
    delete window.db;
    delete globalThis.db;
  });

  // --- Standalone-file guarantees: no module syntax, real global exposure ---

  it("has no executable import or export module declarations", () => {
    expect(vanillaDbSource).not.toMatch(/^\s*import\s/m);
    expect(vanillaDbSource).not.toMatch(/^\s*export\s/m);
  });

  it("creates a global db object with openCostsDB when loaded as a classic script", () => {
    const vanillaDb = loadVanillaDb();

    expect(vanillaDb).toBe(window.db);
    expect(vanillaDb).toBe(globalThis.db);
    expect(vanillaDb).toEqual({
      openCostsDB: expect.any(Function)
    });
  });

  // --- Required contract: same coverage as tests/db/db.test.js ---

  it("opens a database object with addCost and getReport methods", () => {
    const vanillaDb = loadVanillaDb();
    const ob = vanillaDb.openCostsDB("costsdb", 1);

    expectDatabaseObject(ob);
  });

  it("accepts an empty database name because the official contract requires a string", () => {
    const vanillaDb = loadVanillaDb();
    const ob = vanillaDb.openCostsDB("", 1);

    expectDatabaseObject(ob);
  });

  it("adds a cost, returns required fields, records the date, and does not mutate input", () => {
    const vanillaDb = loadVanillaDb();
    const ob = vanillaDb.openCostsDB("costsdb", 1);
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
        year: 2026,
        hour: 12,
        minute: 0
      }
    });
    expect(result.id).toEqual(expect.any(String));
    expect(result.id).not.toBe("");
    expect(inputCost).toEqual({
      sum: 200,
      currency: "USD",
      category: "FOOD",
      description: "pizza"
    });
  });

  it("persists costs so reopened database objects can report them", () => {
    const vanillaDb = loadVanillaDb();
    const first = vanillaDb.openCostsDB("costsdb", 1);
    first.addCost({
      sum: 125,
      currency: "USD",
      category: "BOOKS",
      description: "Course book"
    });

    const second = vanillaDb.openCostsDB("costsdb", 1);
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
    const vanillaDb = loadVanillaDb();
    const base = vanillaDb.openCostsDB("costsdb", 1);
    const otherName = vanillaDb.openCostsDB("otherdb", 1);
    const otherVersion = vanillaDb.openCostsDB("costsdb", 2);

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
    const vanillaDb = loadVanillaDb();
    const ob = vanillaDb.openCostsDB("costsdb", 1);

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
    const vanillaDb = loadVanillaDb();
    const ob = vanillaDb.openCostsDB("costsdb", 1);

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
    const vanillaDb = loadVanillaDb();
    const ob = vanillaDb.openCostsDB("costsdb", 1);

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
    const vanillaDb = loadVanillaDb();
    const ob = vanillaDb.openCostsDB("costsdb", 1);

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
        year: 2026,
        hour: 12,
        minute: 0
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
    const vanillaDb = loadVanillaDb();
    const currencies = ["USD", "ILS", "GBP", "EURO"];

    currencies.forEach((currency, index) => {
      const ob = vanillaDb.openCostsDB(`costsdb-${currency}`, 1);

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
    const vanillaDb = loadVanillaDb();
    const ob = vanillaDb.openCostsDB("costsdb", 1);

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

  it("generates stable unique IDs for identical new costs", () => {
    const vanillaDb = loadVanillaDb();
    const ob = vanillaDb.openCostsDB("costsdb", 1);
    const first = ob.addCost({
      sum: 20,
      currency: "USD",
      category: "Food",
      description: "Coffee"
    });
    const second = ob.addCost({
      sum: 20,
      currency: "USD",
      category: "Food",
      description: "Coffee"
    });

    expect(first.id).toEqual(expect.any(String));
    expect(second.id).toEqual(expect.any(String));
    expect(first.id).not.toBe("");
    expect(second.id).not.toBe("");
    expect(first.id).not.toBe(second.id);
    expect(ob.getCostById(first.id)?.id).toBe(first.id);
  });

  it("records hour and minute on new stored costs", () => {
    const vanillaDb = loadVanillaDb();
    const ob = vanillaDb.openCostsDB("costsdb", 1);

    setLocalDate(2026, 8, 22, 16, 37);

    const added = ob.addCost({
      sum: 42,
      currency: "USD",
      category: "Time",
      description: "Timed cost"
    });

    expect(added.date).toEqual({
      day: 22,
      month: 8,
      year: 2026,
      hour: 16,
      minute: 37
    });
    expect(readStoredCosts()[0].date).toEqual(added.date);
  });

  it("returns all stored costs as defensive copies", () => {
    const vanillaDb = loadVanillaDb();
    const ob = vanillaDb.openCostsDB("costsdb", 1);
    ob.addCost({
      sum: 15,
      currency: "USD",
      category: "Copy",
      description: "First"
    });
    ob.addCost({
      sum: 25,
      currency: "USD",
      category: "Copy",
      description: "Second"
    });

    const costs = ob.getAllCosts();

    costs[0].description = "Mutated outside";
    costs[0].date.day = 1;

    expect(costs).toHaveLength(2);
    expect(ob.getAllCosts()[0]).toMatchObject({
      description: "First",
      date: { day: 22 }
    });
  });

  it("gets a cost by ID as a defensive copy", () => {
    const vanillaDb = loadVanillaDb();
    const ob = vanillaDb.openCostsDB("costsdb", 1);
    const added = ob.addCost({
      sum: 60,
      currency: "USD",
      category: "Lookup",
      description: "Lookup cost"
    });

    const found = ob.getCostById(added.id);

    found.description = "Mutated outside";

    expect(found).toMatchObject({
      id: added.id,
      sum: 60,
      description: "Mutated outside"
    });
    expect(ob.getCostById(added.id)).toMatchObject({
      id: added.id,
      description: "Lookup cost"
    });
  });

  it("returns null for missing valid IDs", () => {
    const vanillaDb = loadVanillaDb();
    const ob = vanillaDb.openCostsDB("costsdb", 1);

    expect(ob.getCostById("missing-id")).toBeNull();
    expect(ob.updateCost("missing-id", editableCost())).toBeNull();
    expect(ob.deleteCost("missing-id")).toBeNull();
  });

  it("returns null before payload validation when updateCost cannot find a valid ID", () => {
    const vanillaDb = loadVanillaDb();
    const ob = vanillaDb.openCostsDB("costsdb", 1);

    expect(
      ob.updateCost("missing-id", {
        ...editableCost(),
        sum: Number.NaN,
        date: { day: 29, month: 2, year: 2026, hour: 99, minute: 99 }
      })
    ).toBeNull();
  });

  it("throws for invalid cost IDs", () => {
    const vanillaDb = loadVanillaDb();
    const ob = vanillaDb.openCostsDB("costsdb", 1);

    expect(() => ob.getCostById("")).toThrow("id must be a non-empty string.");
    expect(() => ob.updateCost("   ", editableCost())).toThrow(
      "id must be a non-empty string."
    );
    expect(() => ob.deleteCost(123)).toThrow("id must be a non-empty string.");
  });

  it("updates a cost by ID while preserving the original ID", () => {
    const vanillaDb = loadVanillaDb();
    const ob = vanillaDb.openCostsDB("costsdb", 1);
    const added = ob.addCost({
      sum: 100,
      currency: "USD",
      category: "Before",
      description: "Before update"
    });
    const input = editableCost({
      id: "ignored-id",
      sum: 250,
      currency: "GBP",
      category: "After",
      description: "After update"
    });

    const updated = ob.updateCost(added.id, input);

    expect(updated).toEqual({
      id: added.id,
      sum: 250,
      currency: "GBP",
      category: "After",
      description: "After update",
      date: {
        day: 29,
        month: 2,
        year: 2028,
        hour: 9,
        minute: 45
      }
    });
    expect(input.id).toBe("ignored-id");
    expect(ob.getCostById(added.id)).toEqual(updated);
  });

  it("validates the full editable cost payload on update", () => {
    const vanillaDb = loadVanillaDb();
    const ob = vanillaDb.openCostsDB("costsdb", 1);
    const added = ob.addCost({
      sum: 100,
      currency: "USD",
      category: "Before",
      description: "Before update"
    });

    expect(() =>
      ob.updateCost(added.id, {
        ...editableCost(),
        date: { day: 29, month: 2, year: 2026, hour: 8, minute: 30 }
      })
    ).toThrow("cost.date must be a real calendar date.");
    expect(() =>
      ob.updateCost(added.id, {
        ...editableCost(),
        date: { day: 20, month: 8, year: 2026, hour: 24, minute: 30 }
      })
    ).toThrow("cost.date.hour must be an integer from 0 to 23.");
    expect(() =>
      ob.updateCost(added.id, { ...editableCost(), currency: "EUR" })
    ).toThrow("cost.currency must be one of USD, ILS, GBP, EURO.");
  });

  it("deletes the requested cost by ID without touching matching content", () => {
    const vanillaDb = loadVanillaDb();
    const ob = vanillaDb.openCostsDB("costsdb", 1);
    const first = ob.addCost({
      sum: 30,
      currency: "USD",
      category: "Same",
      description: "Same content"
    });
    const second = ob.addCost({
      sum: 30,
      currency: "USD",
      category: "Same",
      description: "Same content"
    });

    const deleted = ob.deleteCost(first.id);

    expect(deleted).toMatchObject({ id: first.id });
    expect(ob.getCostById(first.id)).toBeNull();
    expect(ob.getCostById(second.id)).toMatchObject({ id: second.id });
    expect(ob.getAllCosts()).toHaveLength(1);
  });

  it("does not expose ID or time fields through the required report item shape", () => {
    const vanillaDb = loadVanillaDb();
    const ob = vanillaDb.openCostsDB("costsdb", 1);
    ob.addCost({
      sum: 70,
      currency: "USD",
      category: "Report",
      description: "Report item"
    });

    const [reportCost] = ob.getReport("USD", 2026, 8).costs;

    expect(reportCost).toEqual({
      sum: 70,
      currency: "USD",
      category: "Report",
      description: "Report item",
      date: {
        day: 22
      }
    });
  });

  it("uses updated and deleted costs in report results", () => {
    const vanillaDb = loadVanillaDb();
    const ob = vanillaDb.openCostsDB("costsdb", 1);
    const moved = ob.addCost({
      sum: 80,
      currency: "USD",
      category: "Move",
      description: "Moved month"
    });
    const deleted = ob.addCost({
      sum: 20,
      currency: "USD",
      category: "Delete",
      description: "Deleted cost"
    });

    ob.updateCost(
      moved.id,
      editableCost({
        sum: 80,
        category: "Move",
        description: "Moved month",
        date: { day: 15, month: 9, year: 2026, hour: 11, minute: 20 }
      })
    );
    ob.deleteCost(deleted.id);

    expect(ob.getReport("USD", 2026, 8).costs).toEqual([]);
    expect(ob.getReport("USD", 2026, 9).total.sum).toBe(80);
  });

  it("keeps CRUD operations isolated by database name and version", () => {
    const vanillaDb = loadVanillaDb();
    const base = vanillaDb.openCostsDB("costsdb", 1);
    const otherName = vanillaDb.openCostsDB("otherdb", 1);
    const otherVersion = vanillaDb.openCostsDB("costsdb", 2);
    const added = base.addCost({
      sum: 110,
      currency: "USD",
      category: "Base",
      description: "Base only"
    });

    expect(otherName.getCostById(added.id)).toBeNull();
    expect(otherVersion.getCostById(added.id)).toBeNull();
    expect(base.getCostById(added.id)).toMatchObject({ id: added.id });
  });

  it("converts cross-currency report totals from cached rates while preserving original cost values", () => {
    const vanillaDb = loadVanillaDb();
    setCachedExchangeRates({
      USD: 1,
      GBP: 0.5,
      EURO: 0.8,
      ILS: 4
    });
    const ob = vanillaDb.openCostsDB("costsdb", 1);

    ob.addCost({
      sum: 100,
      currency: "USD",
      category: "FOOD",
      description: "Groceries"
    });
    ob.addCost({
      sum: 50,
      currency: "GBP",
      category: "TRAVEL",
      description: "Train"
    });

    const report = ob.getReport("USD", 2026, 8);
    const storedCosts = readStoredCosts();

    expect(report).not.toBeInstanceOf(Promise);
    expect(report.total).toEqual({
      currency: "USD",
      sum: 200
    });
    expect(report.costs[1]).toMatchObject({
      sum: 50,
      currency: "GBP",
      category: "TRAVEL",
      description: "Train"
    });
    expect(storedCosts[1]).toMatchObject({
      sum: 50,
      currency: "GBP"
    });
  });

  it("fails explicitly for cross-currency totals when no valid rate cache exists", () => {
    const vanillaDb = loadVanillaDb();
    const ob = vanillaDb.openCostsDB("costsdb", 1);

    ob.addCost({
      sum: 100,
      currency: "USD",
      category: "FOOD",
      description: "Groceries"
    });
    ob.addCost({
      sum: 50,
      currency: "GBP",
      category: "TRAVEL",
      description: "Train"
    });

    expect(() => ob.getReport("USD", 2026, 8)).toThrow(
      "Cross-currency report totals require cached exchange rates."
    );
  });

  it("treats malformed stored cost data as an empty list instead of throwing", () => {
    localStorage.setItem(
      "cost-manager:costsdb:v1:costs",
      "{not valid JSON"
    );
    const vanillaDb = loadVanillaDb();
    const ob = vanillaDb.openCostsDB("costsdb", 1);

    expect(() => ob.getReport("USD", 2026, 8)).not.toThrow();
    expect(ob.getReport("USD", 2026, 8)).toEqual({
      year: 2026,
      month: 8,
      costs: [],
      total: { currency: "USD", sum: 0 }
    });
    expect(ob.getAllCosts()).toEqual([]);

    ob.addCost({
      sum: 40,
      currency: "USD",
      category: "Recovered",
      description: "Added after malformed data"
    });

    expect(ob.getReport("USD", 2026, 8).total.sum).toBe(40);
  });

  it("preserves unrelated localStorage keys when adding, updating, and deleting costs", () => {
    const unrelatedKey = "some-other-app:preference";
    const unrelatedValue = JSON.stringify({ theme: "dark" });

    localStorage.setItem(unrelatedKey, unrelatedValue);

    const vanillaDb = loadVanillaDb();
    const ob = vanillaDb.openCostsDB("costsdb", 1);
    const added = ob.addCost({
      sum: 10,
      currency: "USD",
      category: "Isolation",
      description: "Should not touch other keys"
    });

    expect(localStorage.getItem(unrelatedKey)).toBe(unrelatedValue);

    ob.updateCost(added.id, editableCost());
    expect(localStorage.getItem(unrelatedKey)).toBe(unrelatedValue);

    ob.deleteCost(added.id);
    expect(localStorage.getItem(unrelatedKey)).toBe(unrelatedValue);
  });
});
