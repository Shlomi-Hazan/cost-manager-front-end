import { describe, expect, it } from "vitest";
import {
  formatDateForDisplay,
  formatDateForInput,
  formatTime,
  parseDateInput,
  parseTimeInput
} from "../../src/utils/dateTime.js";

/*
 * Protects the display formatting and HTML <input> parsing/round-tripping
 * for the { day, month, year, hour, minute } date shape db.js stores —
 * including that invalid input (bad format, out-of-range values) returns
 * null rather than throwing or silently producing a wrong date.
 */
describe("dateTime utilities", () => {
  it("formats dates for display with zero-padded day and month", () => {
    expect(
      formatDateForDisplay({
        day: 4,
        month: 8,
        year: 2026
      })
    ).toBe("04/08/2026");
  });

  it("formats dates for native input without timezone conversion", () => {
    expect(
      formatDateForInput({
        day: 4,
        month: 8,
        year: 2026
      })
    ).toBe("2026-08-04");
  });

  it("formats time as HH:mm without seconds", () => {
    expect(
      formatTime({
        hour: 9,
        minute: 5
      })
    ).toBe("09:05");
  });

  it("parses date input into numeric local parts", () => {
    expect(parseDateInput("2026-08-04")).toEqual({
      day: 4,
      month: 8,
      year: 2026
    });
  });

  it("rejects malformed date input", () => {
    expect(parseDateInput("04/08/2026")).toBeNull();
    expect(parseDateInput("2026-13-04")).toBeNull();
    expect(parseDateInput("2026-08-00")).toBeNull();
  });

  it("parses time input into numeric parts", () => {
    expect(parseTimeInput("09:05")).toEqual({
      hour: 9,
      minute: 5
    });
  });

  it("rejects malformed time input", () => {
    expect(parseTimeInput("9:05")).toBeNull();
    expect(parseTimeInput("24:00")).toBeNull();
    expect(parseTimeInput("23:60")).toBeNull();
  });
});
