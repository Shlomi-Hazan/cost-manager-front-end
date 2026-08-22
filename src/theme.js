import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2563eb"
    },
    secondary: {
      main: "#0f766e"
    },
    background: {
      default: "#f5f7fb",
      paper: "#ffffff"
    },
    text: {
      primary: "#172033",
      secondary: "#5f6b7a"
    }
  },
  shape: {
    borderRadius: 8
  },
  typography: {
    fontFamily:
      '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2.25rem",
      fontWeight: 700
    },
    h2: {
      fontSize: "1.5rem",
      fontWeight: 700
    },
    button: {
      fontWeight: 700,
      textTransform: "none"
    }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8
        }
      }
    }
  }
});

export default theme;
