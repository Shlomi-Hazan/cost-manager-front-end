import { Paper } from '@mui/material';

// Small shared UI component: the bordered card/section wrapper used
// throughout the app (forms, filters, generated reports/charts) so section
// boundaries look consistent everywhere without repeating the same
// border/padding styles on every page.
function SectionCard({ children, component = 'section', sx = {}, ...props }) {
  return (
    // elevation={0} + an explicit border, rather than MUI's drop-shadow look.
    <Paper
      component={component}
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        // Caller's own sx merges last, so it can override any of these.
        p: 3,
        position: 'relative',
        ...sx
      }}
      {...props}
    >
      {/* Caller-supplied content, unaware it is sitting inside a Paper. */}
      {children}
    </Paper>
  );
}

export default SectionCard;
