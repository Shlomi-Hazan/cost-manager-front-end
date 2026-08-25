import { describe, expect, it } from "vitest";
import { findChartSvgForCapture } from "../../src/utils/chartCapture.js";

describe("chartCapture", () => {
  it("selects the largest chart SVG instead of small legend icons", () => {
    const container = document.createElement("div");

    container.innerHTML = `
      <svg class="recharts-surface" aria-label="Food legend icon" width="14" height="14"></svg>
      <svg class="recharts-surface" aria-label="Shopping legend icon" width="14" height="14"></svg>
      <svg class="recharts-surface" width="1102" height="360"></svg>
    `;

    expect(findChartSvgForCapture(container)).toBe(
      container.querySelectorAll("svg")[2]
    );
  });

  it("returns null when no SVG is available", () => {
    const container = document.createElement("div");

    expect(findChartSvgForCapture(container)).toBeNull();
  });
});
