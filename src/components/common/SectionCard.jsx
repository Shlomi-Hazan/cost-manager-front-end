import { Paper } from "@mui/material";

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
