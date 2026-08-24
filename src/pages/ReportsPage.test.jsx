import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { describe, expect, it } from "vitest";
import ReportsPage from "./ReportsPage.jsx";
import theme from "../theme.js";

function renderReportsPage() {
  return render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ReportsPage />
    </ThemeProvider>
  );
}

describe("ReportsPage", () => {
  it("renders monthly reporting by default", () => {
    renderReportsPage();

    expect(screen.getByRole("heading", { name: "Reports" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Monthly" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(
      screen.getByRole("heading", { name: "Monthly Report" })
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Month" })).toBeInTheDocument();
  });

  it("switches to the Yearly Report placeholder without starting yearly reporting", async () => {
    const user = userEvent.setup();
    renderReportsPage();

    await user.click(screen.getByRole("tab", { name: "Yearly" }));

    expect(screen.getByRole("tab", { name: "Yearly" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByRole("heading", { name: "Yearly Report" })).toBeInTheDocument();
    expect(
      screen.getByText("Detailed yearly reporting will be implemented in Milestone 9.5C.")
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Generate Yearly Report" })
    ).not.toBeInTheDocument();
  });

  it("can return from Yearly to the functional Monthly Report", async () => {
    const user = userEvent.setup();
    renderReportsPage();

    await user.click(screen.getByRole("tab", { name: "Yearly" }));
    await user.click(screen.getByRole("tab", { name: "Monthly" }));

    expect(screen.getByRole("tab", { name: "Monthly" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(
      screen.getByRole("heading", { name: "Monthly Report" })
    ).toBeInTheDocument();
  });
});
