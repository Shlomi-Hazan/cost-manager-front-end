import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { describe, expect, it } from "vitest";
import ReportsPage from "./ReportsPage.jsx";
import theme from "../theme.js";

// TEAM EXTENSION test (X-009): confirms the Reports tab group defaults to
// Monthly and correctly switches to Yearly, without re-testing either
// report's own internal behavior (covered separately).
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

  it("switches to the functional Yearly Report", async () => {
    const user = userEvent.setup();
    renderReportsPage();

    await user.click(screen.getByRole("tab", { name: "Yearly" }));

    expect(screen.getByRole("tab", { name: "Yearly" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByRole("heading", { name: "Yearly Report" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Select a year and currency to review all cost entries for that year."
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Generate Yearly Report" })
    ).toBeInTheDocument();
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
