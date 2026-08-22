import { Stack, Typography } from "@mui/material";

function SettingsPage() {
  return (
    <Stack spacing={1}>
      <Typography component="h1" variant="h1">
        Settings
      </Typography>
      <Typography color="text.secondary" variant="body1">
        Exchange-rate settings will be implemented in a later milestone.
      </Typography>
    </Stack>
  );
}

export default SettingsPage;
