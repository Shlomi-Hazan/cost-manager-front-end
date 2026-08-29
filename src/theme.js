import { createTheme } from "@mui/material/styles";

// The application's single MUI theme (colors, shape, typography), applied
// once in main.jsx via ThemeProvider. Centralizing it here means no
// component needs its own hard-coded colors/fonts.
const theme = createTheme({
  customShadows: {
    card: "0 16px 40px rgba(15, 23, 42, 0.08)",
    cardHover: "0 22px 52px rgba(15, 23, 42, 0.12)",
    focus: "0 0 0 3px rgba(37, 99, 235, 0.22)"
  },
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
      fontWeight: 700,
      lineHeight: 1.18
    },
    h2: {
      fontSize: "1.5rem",
      fontWeight: 700,
      lineHeight: 1.25
    },
    h3: {
      fontSize: "1.125rem",
      fontWeight: 700,
      lineHeight: 1.35
    },
    button: {
      fontWeight: 700,
      textTransform: "none"
    }
  },
  components: {
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 40
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8
        }
      }
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          gap: 8,
          padding: "16px 24px 24px"
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none"
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 48,
          "&.Mui-focusVisible": {
            backgroundColor: "rgba(37, 99, 235, 0.08)"
          }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: "rgba(37, 99, 235, 0.07)",
          color: "#172033",
          fontWeight: 700
        }
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:last-child td": {
            borderBottom: 0
          },
          "tbody &:hover": {
            backgroundColor: "rgba(15, 118, 110, 0.04)"
          }
        }
      }
    }
  }
});

export default theme;
