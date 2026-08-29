import { describe, expect, it } from "vitest";
import {
  getCategoryDisplayName,
  getCategoryKey,
  normalizeCategoryInput
} from "../../src/utils/category.js";

/*
 * Protects the case-insensitive category grouping used by the Pie Chart
 * (e.g. "food"/"FOOD"/"Food" must aggregate together) without ever
 * rejecting a free-text category db.js would otherwise accept — see
 * OQ-004 in docs/REQUIREMENTS.md for why no fixed category list exists.
 */
describe("category utilities", () => {
  it("trims category whitespace", () => {
    expect(normalizeCategoryInput(" Food ")).toBe("Food");
  });

  it("collapses repeated internal whitespace", () => {
    expect(normalizeCategoryInput("Pet   Supplies")).toBe("Pet Supplies");
    expect(normalizeCategoryInput("  My   Pets  ")).toBe("My Pets");
  });

  it("canonicalizes lowercase common categories", () => {
    expect(normalizeCategoryInput("food")).toBe("Food");
  });

  it("canonicalizes uppercase common categories", () => {
    expect(normalizeCategoryInput("FOOD")).toBe("Food");
  });

  it("uses case-insensitive category keys", () => {
    expect(getCategoryKey("Food")).toBe(getCategoryKey("fOoD"));
  });

  it("uses whitespace-insensitive category keys", () => {
    expect(getCategoryKey(" Pet   Supplies ")).toBe(
      getCategoryKey("pet supplies")
    );
  });

  it("keeps custom categories allowed", () => {
    expect(normalizeCategoryInput("Vinyl Records")).toBe("Vinyl Records");
  });

  it("does not aggressively title-case custom categories", () => {
    expect(normalizeCategoryInput("my pets")).toBe("my pets");
    expect(getCategoryDisplayName("MY PETS")).toBe("MY PETS");
  });

  it("returns an empty string for empty or whitespace-only category input", () => {
    expect(normalizeCategoryInput("")).toBe("");
    expect(normalizeCategoryInput("     ")).toBe("");
  });

  it("does not mutate input strings", () => {
    const category = "  food  ";

    normalizeCategoryInput(category);

    expect(category).toBe("  food  ");
  });
});
