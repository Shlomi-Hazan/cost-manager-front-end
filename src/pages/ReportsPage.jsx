import { useState } from "react";
import { Alert, Box, Paper, Stack, Tab, Tabs, Typography } from "@mui/material";
import MonthlyReportPage from "./MonthlyReportPage.jsx";

const REPORT_TABS = {
  monthly: "monthly",
  yearly: "yearly"
};

function ReportsPage() {
  const [activeReport, setActiveReport] = useState(REPORT_TABS.monthly);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography component="h1" variant="h1">
          Reports
        </Typography>
        <Typography color="text.secondary" variant="body1">
          Review monthly cost details now, with yearly reporting planned next.
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider"
        }}
      >
        <Tabs
          aria-label="Reports navigation"
          onChange={(_event, nextReport) => setActiveReport(nextReport)}
          value={activeReport}
          sx={{ px: 2, pt: 1 }}
        >
          <Tab label="Monthly" value={REPORT_TABS.monthly} />
          <Tab label="Yearly" value={REPORT_TABS.yearly} />
        </Tabs>
      </Paper>

      {activeReport === REPORT_TABS.monthly ? <MonthlyReportPage /> : null}

      {activeReport === REPORT_TABS.yearly ? (
        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            p: 3
          }}
        >
          <Stack spacing={2}>
            <Typography component="h2" variant="h2">
              Yearly Report
            </Typography>
            <Alert severity="info">
              Detailed yearly reporting will be implemented in Milestone 9.5C.
            </Alert>
          </Stack>
        </Paper>
      ) : null}
    </Stack>
  );
}

export default ReportsPage;
