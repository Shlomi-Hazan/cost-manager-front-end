import { useMemo, useState } from "react";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import DonutLargeOutlinedIcon from "@mui/icons-material/DonutLargeOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import DashboardPage from "./pages/DashboardPage.jsx";
import AddCostPage from "./pages/AddCostPage.jsx";
import ManageCostsPage from "./pages/ManageCostsPage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";
import ChartsPage from "./pages/ChartsPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";

const pages = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <DashboardOutlinedIcon aria-hidden="true" fontSize="small" />,
    component: DashboardPage
  },
  {
    id: "add-cost",
    label: "Add Cost",
    icon: <AddCircleOutlineIcon aria-hidden="true" fontSize="small" />,
    component: AddCostPage
  },
  {
    id: "manage-costs",
    label: "Manage Costs",
    icon: <EditNoteOutlinedIcon aria-hidden="true" fontSize="small" />,
    component: ManageCostsPage
  },
  {
    id: "reports",
    label: "Reports",
    icon: <AssessmentOutlinedIcon aria-hidden="true" fontSize="small" />,
    component: ReportsPage
  },
  {
    id: "charts",
    label: "Charts",
    icon: <DonutLargeOutlinedIcon aria-hidden="true" fontSize="small" />,
    component: ChartsPage
  },
  {
    id: "settings",
    label: "Settings",
    icon: <SettingsOutlinedIcon aria-hidden="true" fontSize="small" />,
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
      <ActivePage onNavigate={setActivePageId} />
    </AppLayout>
  );
}

export default App;
