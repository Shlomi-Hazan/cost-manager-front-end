import { Paper } from "@mui/material";

// Small shared UI component: the bordered card/section wrapper used
// throughout the app (forms, filters, generated reports/charts) so section
// boundaries look consistent everywhere without repeating the same
// border/padding styles on every page.
function SectionCard({ children, component = "section", sx = {}, ...props }) {
  return (
    <Paper
      component={component}
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        p: 3,
        position: "relative",
        ...sx
      }}
      {...props}
    >
      {children}
    </Paper>
  );
}

export default SectionCard;
