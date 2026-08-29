import {
  AppBar,
  Box,
  Container,
  Tab,
  Tabs,
  Toolbar,
  Typography
} from "@mui/material";

/*
 * The application shell: top navigation bar plus a content area that
 * renders whichever page App.jsx has selected as `children`. This
 * component has no knowledge of what a "page" actually does — it only
 * renders the tab bar from `navigationItems` and reports clicks back via
 * `onNavigate`, keeping page-switching logic in one place (App.jsx).
 */
function AppLayout({ activePageId, appTitle, children, navigationItems, onNavigate }) {
  return (
    <Box
      className="app-shell"
      data-page={activePageId}
      sx={{ minHeight: "100vh", bgcolor: "background.default" }}
    >
      <Box aria-hidden="true" className="ambient-background">
        <span />
      </Box>
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
                gap: 0.75,
                minHeight: 48
              }
            }}
          >
            {navigationItems.map((item) => (
              <Tab
                icon={item.icon}
                iconPosition="start"
                key={item.id}
                label={item.label}
                value={item.id}
              />
            ))}
          </Tabs>
        </Toolbar>
      </AppBar>

      <Container
        component="main"
        maxWidth="xl"
        sx={{ position: "relative", py: 5, zIndex: 1 }}
      >
        {children}
      </Container>
    </Box>
  );
}

export default AppLayout;
