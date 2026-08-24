import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setCachedExchangeRates } from "../../lib/exchangeRatesCache.js";
import { costsDatabase } from "../../lib/costsDatabase.js";
import theme from "../../theme.js";
import YearlyBarChartSection from "./YearlyBarChartSection.jsx";

const validRates = {
  USD: 1,
  GBP: 0.5,
  EURO: 0.8,
  ILS: 4
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const originalFetch = globalThis.fetch;
const originalResizeObserver = globalThis.ResizeObserver;

class TestResizeObserver {
  observe() {}

  unobserve() {}

  disconnect() {}
}

function renderYearlyBarChartSection() {
  return render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <YearlyBarChartSection />
    </ThemeProvider>
  );
}

function setLocalDate(year, month, day) {
  vi.setSystemTime(new Date(year, month - 1, day, 12, 0, 0));
}

function setupUser() {
  return userEvent.setup();
}

function mockSuccessfulRatesFetch(rates = validRates) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: vi.fn().mockResolvedValue(rates)
  });
}

function mockFailedRatesFetch() {
  globalThis.fetch = vi.fn().mockRejectedValue(new TypeError("Network error"));
}

function addCostOnDate({ year = 2026, month, day = 1, cost }) {
  setLocalDate(year, month, day);
  costsDatabase.addCost(cost);
}

async function chooseYearlyCurrency(user, currency) {
  await user.click(screen.getByRole("combobox", { name: "Yearly Chart Currency" }));
  await user.click(screen.getByRole("option", { name: currency }));
}

async function generateYearlyChart(user) {
  await user.click(screen.getByRole("button", { name: "Generate Yearly Chart" }));
}

function getYearlyTotalsTable() {
  return screen.getByRole("table", { name: "Yearly monthly totals" });
}

function getYearlyTotalRows() {
  return within(getYearlyTotalsTable()).getAllByRole("row").slice(1);
}

function expectMonthTotal(monthName, total, currency) {
  const table = getYearlyTotalsTable();
  const row = within(table).getByRole("row", { name: new RegExp(monthName) });

  expect(within(row).getByText(monthName)).toBeInTheDocument();
  expect(within(row).getByText(String(total))).toBeInTheDocument();
  expect(within(row).getByText(currency)).toBeInTheDocument();
}

describe("YearlyBarChartSection", () => {
  beforeEach(() => {
    localStorage.clear();
    globalThis.ResizeObserver = TestResizeObserver;
    vi.useFakeTimers({
      toFake: ["Date"]
    });
    setLocalDate(2026, 8, 22);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    localStorage.clear();

    if (originalFetch === undefined) {
      delete globalThis.fetch;
    } else {
      globalThis.fetch = originalFetch;
    }

    if (originalResizeObserver === undefined) {
      delete globalThis.ResizeObserver;
    } else {
      globalThis.ResizeObserver = originalResizeObserver;
    }
  });

  it("renders the yearly controls with current defaults", () => {
    renderYearlyBarChartSection();

    expect(
      screen.getByRole("heading", { name: "Yearly 12-Month Bar Chart" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Yearly Chart Year")).toHaveValue("2026");
    expect(
      screen.getByRole("combobox", { name: "Yearly Chart Currency" })
    ).toHaveTextContent("USD");
    expect(
      screen.getByRole("button", { name: "Generate Yearly Chart" })
    ).toBeInTheDocument();
  });

  it("renders a Bar Chart region and exactly 12 calendar-ordered rows", async () => {
    const user = setupUser();
    mockSuccessfulRatesFetch();
    addCostOnDate({
      month: 1,
      cost: {
        sum: 100,
        currency: "USD",
        category: "Food",
        description: "January groceries"
      }
    });
    setLocalDate(2026, 8, 22);

    renderYearlyBarChartSection();
    await generateYearlyChart(user);

    expect(
      screen.getByRole("img", { name: "Yearly monthly bar chart" })
    ).toBeInTheDocument();
    expect(getYearlyTotalRows()).toHaveLength(12);
    expect(getYearlyTotalRows().map((row) => row.cells[0].textContent)).toEqual(
      monthNames
    );
  });

  it("keeps zero months visible with zero totals", async () => {
    const user = setupUser();
    mockSuccessfulRatesFetch();
    addCostOnDate({
      month: 1,
      cost: {
        sum: 100,
        currency: "USD",
        category: "Food",
        description: "January groceries"
      }
    });
    setLocalDate(2026, 8, 22);

    renderYearlyBarChartSection();
    await generateYearlyChart(user);

    expectMonthTotal("January", 100, "USD");
    expectMonthTotal("February", 0, "USD");
    expectMonthTotal("December", 0, "USD");
  });

  it("displays the selected currency", async () => {
    const user = setupUser();
    mockSuccessfulRatesFetch();

    renderYearlyBarChartSection();
    await chooseYearlyCurrency(user, "ILS");
    await generateYearlyChart(user);

    expect(screen.getByText("Chart currency: ILS")).toBeInTheDocument();
    expectMonthTotal("January", 0, "ILS");
  });

  it("uses converted getReport totals for a mixed-currency year", async () => {
    const user = setupUser();
    mockSuccessfulRatesFetch();
    addCostOnDate({
      month: 1,
      cost: {
        sum: 100,
        currency: "USD",
        category: "Food",
        description: "January groceries"
      }
    });
    addCostOnDate({
      month: 2,
      cost: {
        sum: 50,
        currency: "GBP",
        category: "Travel",
        description: "February train"
      }
    });
    setLocalDate(2026, 8, 22);

    renderYearlyBarChartSection();
    await generateYearlyChart(user);

    expect(getYearlyTotalRows()).toHaveLength(12);
    expectMonthTotal("January", 100, "USD");
    expectMonthTotal("February", 100, "USD");
    expectMonthTotal("March", 0, "USD");
  });

  it("renders an empty year as 12 zero months", async () => {
    const user = setupUser();
    mockSuccessfulRatesFetch();

    renderYearlyBarChartSection();
    await generateYearlyChart(user);

    expect(screen.getByText("No costs found for this year.")).toBeInTheDocument();
    expect(getYearlyTotalRows()).toHaveLength(12);
    expect(
      getYearlyTotalRows().every((row) => row.cells[1].textContent === "0")
    ).toBe(true);
  });

  it("uses an existing valid rate cache when refresh fails", async () => {
    const user = setupUser();
    setCachedExchangeRates(validRates);
    mockFailedRatesFetch();
    addCostOnDate({
      month: 1,
      cost: {
        sum: 100,
        currency: "USD",
        category: "Food",
        description: "Cached groceries"
      }
    });
    addCostOnDate({
      month: 2,
      cost: {
        sum: 50,
        currency: "GBP",
        category: "Travel",
        description: "Cached train"
      }
    });
    setLocalDate(2026, 8, 22);

    renderYearlyBarChartSection();
    await generateYearlyChart(user);

    expectMonthTotal("January", 100, "USD");
    expectMonthTotal("February", 100, "USD");
  });

  it("works for same-currency yearly data when refresh fails and no cache exists", async () => {
    const user = setupUser();
    mockFailedRatesFetch();
    addCostOnDate({
      month: 1,
      cost: {
        sum: 75,
        currency: "USD",
        category: "Food",
        description: "Same currency lunch"
      }
    });
    setLocalDate(2026, 8, 22);

    renderYearlyBarChartSection();
    await generateYearlyChart(user);

    expectMonthTotal("January", 75, "USD");
    expectMonthTotal("February", 0, "USD");
  });

  it("shows a conversion error when mixed-currency rates are unavailable", async () => {
    const user = setupUser();
    mockFailedRatesFetch();
    addCostOnDate({
      month: 1,
      cost: {
        sum: 100,
        currency: "USD",
        category: "Food",
        description: "No-rate groceries"
      }
    });
    addCostOnDate({
      month: 2,
      cost: {
        sum: 50,
        currency: "GBP",
        category: "Travel",
        description: "No-rate train"
      }
    });
    setLocalDate(2026, 8, 22);

    renderYearlyBarChartSection();
    await generateYearlyChart(user);

    expect(
      screen.getByText(
        "Exchange rates are unavailable for converting this yearly chart. Please try again."
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("table", { name: "Yearly monthly totals" })
    ).not.toBeInTheDocument();
  });

  it("rejects invalid years before requesting rates", async () => {
    const user = setupUser();
    mockSuccessfulRatesFetch();

    renderYearlyBarChartSection();
    await user.clear(screen.getByLabelText("Yearly Chart Year"));
    await user.type(screen.getByLabelText("Yearly Chart Year"), "2026.5");
    await generateYearlyChart(user);

    expect(screen.getByText("Enter a whole chart year.")).toBeInTheDocument();
    expect(
      screen.getByText("Please correct the highlighted yearly chart filters.")
    ).toBeInTheDocument();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("disables Generate Yearly Chart and shows loading feedback while rates load", async () => {
    const user = setupUser();
    let resolveFetch;

    globalThis.fetch = vi.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        resolveFetch = resolve;
      });
    });
    renderYearlyBarChartSection();

    await generateYearlyChart(user);

    const loadingButton = screen.getByRole("button", { name: "Generating..." });

    expect(loadingButton).toBeDisabled();

    resolveFetch({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(validRates)
    });

    expect(await screen.findByText("No costs found for this year.")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Generate Yearly Chart" })
    ).toBeEnabled();
  });

  it("does not leave a partial yearly chart after a month failure", async () => {
    const user = setupUser();
    mockFailedRatesFetch();
    addCostOnDate({
      month: 1,
      cost: {
        sum: 100,
        currency: "USD",
        category: "Food",
        description: "January groceries"
      }
    });
    addCostOnDate({
      month: 8,
      cost: {
        sum: 50,
        currency: "GBP",
        category: "Travel",
        description: "August train"
      }
    });
    setLocalDate(2026, 8, 22);

    renderYearlyBarChartSection();
    await generateYearlyChart(user);

    expect(
      screen.getByText(
        "Exchange rates are unavailable for converting this yearly chart. Please try again."
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: "Yearly monthly bar chart" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("table", { name: "Yearly monthly totals" })
    ).not.toBeInTheDocument();
  });
});
