import { Box, Stack, Typography } from '@mui/material';

// Small shared UI component: the title + description banner every page
// starts with. `component="h2"` is used for pages nested one level deeper
// in the navigation (e.g. Monthly/Yearly under Reports) to keep heading
// levels semantically correct rather than every page using an <h1>.
function PageHeader({ actions = null, children, component = 'h1', title }) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      sx={{
        alignItems: { xs: 'flex-start', md: 'flex-end' },
        justifyContent: 'space-between'
      }}
    >
      {/* Title + optional description on the left, actions on the right. */}
      <Box>
        <Typography component={component} variant={component === 'h1' ? 'h1' : 'h2'}>
          {title}
        </Typography>
        {children ? (
          <Typography color="text.secondary" sx={{ mt: 0.75 }} variant="body1">
            {children}
          </Typography>
        ) : null}
      </Box>

      {/* Optional action buttons (e.g. export), right-aligned on desktop. */}
      {actions ? (
        <Box sx={{ flexShrink: 0 }}>
          {actions}
        </Box>
      ) : null}
    </Stack>
  );
}

export default PageHeader;
