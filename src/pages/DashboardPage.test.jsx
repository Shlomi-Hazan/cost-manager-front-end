import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import theme from "../theme.js";
import DashboardPage from "./DashboardPage.jsx";

function renderDashboardPage(onNavigate = vi.fn()) {
  return {
    onNavigate,
    ...render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <DashboardPage onNavigate={onNavigate} />
      </ThemeProvider>
    )
  };
}

describe("DashboardPage", () => {
  it("renders current application shortcuts without stale milestone placeholders", () => {
    renderDashboardPage();

    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(
      screen.getByText("Track, review, and visualize your expenses.")
    ).toBeInTheDocument();

    for (const title of [
      "Add Cost",
      "Manage Costs",
      "Reports",
      "Charts",
      "Settings"
    ]) {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    }

    expect(
      screen.queryByText(/will be implemented in a later milestone/i)
    ).not.toBeInTheDocument();
  });

  it("navigates through a dashboard shortcut card", async () => {
    const user = userEvent.setup();
    const { onNavigate } = renderDashboardPage();

    await user.click(screen.getByText("Review saved expenses and keep existing records up to date."));

    expect(onNavigate).toHaveBeenCalledWith("manage-costs");
  });
});
