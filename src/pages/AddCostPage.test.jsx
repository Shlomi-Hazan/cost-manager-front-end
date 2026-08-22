import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { costsDatabase } from "../lib/costsDatabase.js";
import AddCostPage from "./AddCostPage.jsx";
import theme from "../theme.js";

function renderAddCostPage() {
  return render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AddCostPage />
    </ThemeProvider>
  );
}

function setLocalDate(year, month, day) {
  vi.setSystemTime(new Date(year, month - 1, day, 12, 0, 0));
}

function setupUser() {
  return userEvent.setup();
}

async function chooseCurrency(user, currency) {
  await user.click(screen.getByRole("combobox", { name: "Currency" }));
  await user.click(screen.getByRole("option", { name: currency }));
}

async function submitCost(user, { sum, currency = "USD", category, description }) {
  await user.type(screen.getByLabelText("Sum"), sum);

  if (currency !== "USD") {
    await chooseCurrency(user, currency);
  }

  await user.type(screen.getByLabelText("Category"), category);
  await user.type(screen.getByLabelText("Description"), description);
  await user.click(screen.getByRole("button", { name: "Add Cost" }));
}

describe("AddCostPage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({
      toFake: ["Date"]
    });
    setLocalDate(2026, 8, 22);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    localStorage.clear();
  });

  it("renders the required Add Cost form controls with USD as the initial currency", () => {
    renderAddCostPage();

    expect(screen.getByRole("heading", { name: "Add Cost" })).toBeInTheDocument();
    expect(screen.getByLabelText("Sum")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Currency" })).toHaveTextContent(
      "USD"
    );
    expect(screen.getByLabelText("Category")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Cost" })).toBeInTheDocument();
  });

  it("submits a valid cost through db.js, persists it, records the date, and resets the form", async () => {
    const user = setupUser();
    renderAddCostPage();

    await submitCost(user, {
      sum: "125.5",
      category: "FOOD",
      description: "Lunch"
    });

    expect(screen.getByText("Cost added successfully.")).toBeInTheDocument();

    const report = costsDatabase.getReport("USD", 2026, 8);

    expect(report.costs).toEqual([
      {
        sum: 125.5,
        currency: "USD",
        category: "FOOD",
        description: "Lunch",
        date: {
          day: 22
        }
      }
    ]);
    expect(report.total).toEqual({
      currency: "USD",
      sum: 125.5
    });

    expect(screen.getByLabelText("Sum")).toHaveValue("");
    expect(screen.getByRole("combobox", { name: "Currency" })).toHaveTextContent(
      "USD"
    );
    expect(screen.getByLabelText("Category")).toHaveValue("");
    expect(screen.getByLabelText("Description")).toHaveValue("");
  });

  it("preserves a selected non-USD currency when saving", async () => {
    const user = setupUser();
    renderAddCostPage();

    await submitCost(user, {
      sum: "44",
      currency: "GBP",
      category: "TRAVEL",
      description: "Train"
    });

    const report = costsDatabase.getReport("GBP", 2026, 8);

    expect(report.costs).toHaveLength(1);
    expect(report.costs[0]).toMatchObject({
      sum: 44,
      currency: "GBP",
      category: "TRAVEL",
      description: "Train"
    });
    expect(report.total).toEqual({
      currency: "GBP",
      sum: 44
    });
  });

  it("shows required-field validation and does not persist an empty submission", async () => {
    const user = setupUser();
    renderAddCostPage();

    await user.click(screen.getByRole("button", { name: "Add Cost" }));

    expect(screen.getByText("Please correct the highlighted fields.")).toBeInTheDocument();
    expect(screen.getByText("Enter a cost sum.")).toBeInTheDocument();
    expect(screen.getByText("Enter a category.")).toBeInTheDocument();
    expect(screen.getByText("Enter a description.")).toBeInTheDocument();
    expect(costsDatabase.getReport("USD", 2026, 8).costs).toHaveLength(0);
  });

  it("rejects non-numeric sums before persistence", async () => {
    const user = setupUser();
    renderAddCostPage();

    await user.type(screen.getByLabelText("Sum"), "not a number");
    await user.type(screen.getByLabelText("Category"), "FOOD");
    await user.type(screen.getByLabelText("Description"), "Lunch");
    await user.click(screen.getByRole("button", { name: "Add Cost" }));

    expect(screen.getByText("Enter a valid numeric sum.")).toBeInTheDocument();
    expect(costsDatabase.getReport("USD", 2026, 8).costs).toHaveLength(0);
  });

  it("shows an error alert if the database layer rejects the cost", async () => {
    const user = setupUser();
    const addCostSpy = vi
      .spyOn(costsDatabase, "addCost")
      .mockImplementationOnce(() => {
        throw new Error("Storage unavailable");
      });
    renderAddCostPage();

    await submitCost(user, {
      sum: "22",
      category: "FOOD",
      description: "Snack"
    });

    expect(addCostSpy).toHaveBeenCalledWith({
      sum: 22,
      currency: "USD",
      category: "FOOD",
      description: "Snack"
    });
    expect(screen.getByText("Could not add cost. Please try again.")).toBeInTheDocument();
  });

  it("offers exactly the required currency identifiers", async () => {
    const user = setupUser();
    renderAddCostPage();

    await user.click(screen.getByRole("combobox", { name: "Currency" }));

    const listbox = screen.getByRole("listbox");

    expect(within(listbox).getAllByRole("option").map((option) => option.textContent)).toEqual([
      "USD",
      "ILS",
      "GBP",
      "EURO"
    ]);
  });
});
