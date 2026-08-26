import { CircularProgress, Stack } from "@mui/material";

function LoadingButtonLabel({ children, isLoading, loadingText }) {
  return (
    <Stack
      component="span"
      direction="row"
      spacing={1}
      sx={{ alignItems: "center", justifyContent: "center" }}
    >
      {isLoading ? (
        <CircularProgress color="inherit" size={16} thickness={5} />
      ) : null}
      <span>{isLoading ? loadingText : children}</span>
    </Stack>
  );
}

export default LoadingButtonLabel;
