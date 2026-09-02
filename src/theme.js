import { createTheme } from '@mui/material/styles';

// The application's single MUI theme (colors, shape, typography), applied
// once in main.jsx via ThemeProvider. Centralizing it here means no
// component needs its own hard-coded colors/fonts.
const theme = createTheme({
  // Custom card shadows, layered on top of MUI's default elevation scale.
  customShadows: {
    card: '0 16px 40px rgba(15, 23, 42, 0.08)',
    cardHover: '0 22px 52px rgba(15, 23, 42, 0.12)',
    focus: '0 0 0 3px rgba(37, 99, 235, 0.22)'
  },
  // Brand colors: blue primary, teal secondary, light neutral background.
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb'
    },
    secondary: {
      main: '#0f766e'
    },
    // Off-white page background, plain white for cards/paper surfaces.
    background: {
      default: '#f5f7fb',
      paper: '#ffffff'
    },
    text: {
      primary: '#172033',
      secondary: '#5f6b7a'
    }
  },
  // Single shared corner radius, reused by the component overrides below.
  shape: {
    borderRadius: 8
  },
  // Font family plus heading/button type scale.
  typography: {
    fontFamily:
      '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    // Largest heading, used for the page-level PageHeader title.
    h1: {
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.18
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 700,
      lineHeight: 1.25
    },
    // Smallest heading level, used for card/section titles.
    h3: {
      fontSize: '1.125rem',
      fontWeight: 700,
      lineHeight: 1.35
    },
    button: {
      fontWeight: 700,
      textTransform: 'none'
    }
  },
  // Per-component style overrides, one MUI component per key below.
  components: {
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8
        }
      }
    },
    // Buttons get a taller minimum tap target than MUI's default.
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 40
        }
      }
    },
    // Cards share the same corner radius as the rest of the app.
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8
        }
      }
    },
    // Dialog action rows: consistent gap/padding across every confirm dialog.
    MuiDialogActions: {
      styleOverrides: {
        root: {
          gap: 8,
          padding: '16px 24px 24px'
        }
      }
    },
    // Removes MUI's default gradient background image from paper surfaces.
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        }
      }
    },
    // Keyboard-focus highlight for tab controls (Reports navigation).
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 48,
          '&.Mui-focusVisible': {
            backgroundColor: 'rgba(37, 99, 235, 0.08)'
          }
        }
      }
    },
    // Table header cells: tinted background so headers stand out from rows.
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: 'rgba(37, 99, 235, 0.07)',
          color: '#172033',
          fontWeight: 700
        }
      }
    },
    // Table rows: no border under the last row, subtle hover highlight.
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td': {
            borderBottom: 0
          },
          // Subtle highlight so the hovered data row is easy to track.
          'tbody &:hover': {
            backgroundColor: 'rgba(15, 118, 110, 0.04)'
          }
        }
      }
    }
  }
});

export default theme;
