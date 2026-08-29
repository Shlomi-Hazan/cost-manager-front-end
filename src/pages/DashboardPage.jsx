import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import DonutLargeOutlinedIcon from "@mui/icons-material/DonutLargeOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography
} from "@mui/material";
import PageHeader from "../components/common/PageHeader.jsx";

const dashboardCards = [
  {
    description: "Record a new expense with amount, currency, category, and notes.",
    icon: AddCircleOutlineIcon,
    pageId: "add-cost",
    title: "Add Cost"
  },
  {
    description: "Review saved expenses and keep existing records up to date.",
    icon: EditNoteOutlinedIcon,
    pageId: "manage-costs",
    title: "Manage Costs"
  },
  {
    description: "Generate detailed monthly and yearly reports with export options.",
    icon: AssessmentOutlinedIcon,
    pageId: "reports",
    title: "Reports"
  },
  {
    description: "Visualize category and monthly totals in the selected currency.",
    icon: DonutLargeOutlinedIcon,
    pageId: "charts",
    title: "Charts"
  },
  {
    description: "Control the exchange-rate source used by reports and charts.",
    icon: SettingsOutlinedIcon,
    pageId: "settings",
    title: "Settings"
  }
];

function DashboardPage({ onNavigate }) {
  return (
    <Stack spacing={4}>
      <PageHeader title="Dashboard">
        Track, review, and visualize your expenses.
      </PageHeader>

      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(3, minmax(0, 1fr))"
          }
        }}
      >
        {dashboardCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card
              className="interactive-card"
              key={card.title}
              variant="outlined"
              sx={(theme) => ({
                borderColor: "rgba(37, 99, 235, 0.18)",
                boxShadow: theme.customShadows.card,
                height: "100%",
                overflow: "hidden",
                "&:hover": {
                  borderColor: "rgba(37, 99, 235, 0.38)",
                  boxShadow: theme.customShadows.cardHover
                },
                "&:focus-within": {
                  borderColor: "rgba(37, 99, 235, 0.38)",
                  boxShadow: `${theme.customShadows.cardHover}, ${theme.customShadows.focus}`
                }
              })}
            >
              <CardActionArea
                onClick={() => onNavigate?.(card.pageId)}
                sx={{
                  alignItems: "stretch",
                  display: "flex",
                  height: "100%",
                  textAlign: "left"
                }}
              >
                <CardContent sx={{ height: "100%", p: 3 }}>
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        alignItems: "center",
                        bgcolor: "rgba(37, 99, 235, 0.09)",
                        borderRadius: 2,
                        color: "primary.main",
                        display: "inline-flex",
                        height: 44,
                        justifyContent: "center",
                        width: 44
                      }}
                    >
                      <Icon aria-hidden="true" fontSize="small" />
                    </Box>
                    <Box>
                      <Typography component="h2" gutterBottom variant="h2">
                        {card.title}
                      </Typography>
                      <Typography color="text.secondary">
                        {card.description}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>
    </Stack>
  );
}

export default DashboardPage;
