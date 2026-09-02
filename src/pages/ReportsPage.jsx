import { useState } from 'react';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';
import { Stack, Tab, Tabs } from '@mui/material';
import PageHeader from '../components/common/PageHeader.jsx';
import SectionCard from '../components/common/SectionCard.jsx';
import MonthlyReportPage from './MonthlyReportPage.jsx';
import YearlyReportPage from './YearlyReportPage.jsx';

/*
 * TEAM EXTENSION (X-009): a top-level "Reports" navigation group hosting the
 * required Monthly Report (R-050 to R-053) alongside the team's own
 * additional Yearly Report, as two tabs rather than two separate top-level
 * nav items.
 */
const REPORT_TABS = {
  monthly: 'monthly',
  yearly: 'yearly'
};

function ReportsPage() {
  const [activeReport, setActiveReport] = useState(REPORT_TABS.monthly);

  return (
    <Stack spacing={3}>
      <PageHeader title="Reports">
        Review detailed monthly and yearly cost reports.
      </PageHeader>

      {/* Tab bar only switches which report page is rendered below. */}
      <SectionCard sx={{ p: 0 }}>
        <Tabs
          aria-label="Reports navigation"
          onChange={(_event, nextReport) => setActiveReport(nextReport)}
          value={activeReport}
          sx={{ px: 2, pt: 1 }}
        >
          <Tab
            icon={<CalendarMonthOutlinedIcon aria-hidden="true" fontSize="small" />}
            iconPosition="start"
            label="Monthly"
            value={REPORT_TABS.monthly}
          />
          {/* Yearly tab: the team's own extension, not a course requirement. */}
          <Tab
            icon={<DateRangeOutlinedIcon aria-hidden="true" fontSize="small" />}
            iconPosition="start"
            label="Yearly"
            value={REPORT_TABS.yearly}
          />
        </Tabs>
      </SectionCard>

      {activeReport === REPORT_TABS.monthly ? (
        <MonthlyReportPage headingComponent="h2" />
      ) : null}

      {activeReport === REPORT_TABS.yearly ? (
        <YearlyReportPage headingComponent="h2" />
      ) : null}
    </Stack>
  );
}

export default ReportsPage;
