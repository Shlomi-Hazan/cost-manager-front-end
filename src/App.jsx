import { useMemo, useState } from "react";
import DashboardPage from "./pages/DashboardPage.jsx";
import AddCostPage from "./pages/AddCostPage.jsx";
import MonthlyReportPage from "./pages/MonthlyReportPage.jsx";
import ChartsPage from "./pages/ChartsPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";

const pages = [
  {
    id: "dashboard",
    label: "Dashboard",
    component: DashboardPage
  },
  {
    id: "add-cost",
    label: "Add Cost",
    component: AddCostPage
  },
  {
    id: "monthly-report",
    label: "Monthly Report",
    component: MonthlyReportPage
  },
  {
    id: "charts",
    label: "Charts",
    component: ChartsPage
  },
  {
    id: "settings",
    label: "Settings",
    component: SettingsPage
  }
];

function App() {
  const [activePageId, setActivePageId] = useState(pages[0].id);

  const activePage = useMemo(
    () => pages.find((page) => page.id === activePageId) ?? pages[0],
    [activePageId]
  );

  const ActivePage = activePage.component;

  return (
    <AppLayout
      activePageId={activePageId}
      appTitle="Cost Manager"
      navigationItems={pages}
      onNavigate={setActivePageId}
    >
      <ActivePage />
    </AppLayout>
  );
}

export default App;
