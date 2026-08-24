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

describe("App", () => {
  it("renders the Cost Manager application shell", () => {
    renderApp();

    expect(screen.getByText("Cost Manager")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(
      screen.getByText("Track, review, and visualize your expenses.")
    ).toBeInTheDocument();
  });

  it("switches to the Monthly Report view without reloading", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("tab", { name: "Monthly Report" }));

    expect(
      screen.getByRole("heading", { name: "Monthly Report" })
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Month" })).toBeInTheDocument();
    expect(screen.getByLabelText("Year")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Currency" })).toBeInTheDocument();
  });

  it("switches to the Charts view without reloading", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("tab", { name: "Charts" }));

    expect(screen.getByRole("heading", { name: "Charts" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Monthly Category Pie Chart" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Yearly 12-Month Bar Chart" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Generate Chart" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Generate Yearly Chart" })
    ).toBeInTheDocument();
  });
});
