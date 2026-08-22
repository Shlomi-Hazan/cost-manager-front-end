import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import App from "./App.jsx";
import theme from "./theme.js";

function renderApp() {
  return render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}

describe("App skeleton", () => {
  it("renders the Cost Manager application shell", () => {
    renderApp();

    expect(screen.getByText("Cost Manager")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(
      screen.getByText("Track, review, and visualize your expenses.")
    ).toBeInTheDocument();
  });

  it("switches between placeholder views without reloading", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("tab", { name: "Monthly Report" }));

    expect(
      screen.getByRole("heading", { name: "Monthly Report" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Detailed monthly report functionality will be implemented in a later milestone."
      )
    ).toBeInTheDocument();
  });
});
