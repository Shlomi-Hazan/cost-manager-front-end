import { useState } from "react";
import { Box, Paper, Stack, Tab, Tabs, Typography } from "@mui/material";
import MonthlyReportPage from "./MonthlyReportPage.jsx";
import YearlyReportPage from "./YearlyReportPage.jsx";

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
          Review detailed monthly and yearly cost reports.
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

      {activeReport === REPORT_TABS.yearly ? <YearlyReportPage /> : null}
    </Stack>
  );
}

export default ReportsPage;
