import { Box, Card, CardContent, Stack, Typography } from "@mui/material";

const futureSections = [
  {
    title: "Add Cost",
    description: "Cost entry will be implemented in a later milestone."
  },
  {
    title: "Monthly Report",
    description: "Detailed monthly reporting will be implemented in a later milestone."
  },
  {
    title: "Charts",
    description: "Expense visualizations will be implemented in a later milestone."
  }
];

function DashboardPage() {
  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography component="h1" variant="h1">
          Dashboard
        </Typography>
        <Typography color="text.secondary" variant="h6">
          Track, review, and visualize your expenses.
        </Typography>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            md: "repeat(3, minmax(0, 1fr))"
          }
        }}
      >
        {futureSections.map((section) => (
          <Box key={section.title}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Typography component="h2" gutterBottom variant="h2">
                  {section.title}
                </Typography>
                <Typography color="text.secondary">
                  {section.description}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </Stack>
  );
}

export default DashboardPage;
