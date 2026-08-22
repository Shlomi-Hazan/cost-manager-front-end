import {
  AppBar,
  Box,
  Container,
  Tab,
  Tabs,
  Toolbar,
  Typography
} from "@mui/material";

function AppLayout({ activePageId, appTitle, children, navigationItems, onNavigate }) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" color="inherit" elevation={0}>
        <Toolbar
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            gap: 4,
            minHeight: 72
          }}
        >
          <Typography
            component="div"
            sx={{
              color: "primary.main",
              flexShrink: 0,
              fontSize: "1.25rem",
              fontWeight: 800
            }}
          >
            {appTitle}
          </Typography>

          <Tabs
            aria-label="Main navigation"
            onChange={(_, nextPageId) => onNavigate(nextPageId)}
            value={activePageId}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 48,
              ".MuiTab-root": {
                minHeight: 48
              }
            }}
          >
            {navigationItems.map((item) => (
              <Tab key={item.id} label={item.label} value={item.id} />
            ))}
          </Tabs>
        </Toolbar>
      </AppBar>

      <Container component="main" maxWidth="lg" sx={{ py: 5 }}>
        {children}
      </Container>
    </Box>
  );
}

export default AppLayout;
