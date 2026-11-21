import { createTheme } from '@mui/material/styles';

/**
 * Karatly's look: MUI defaults with a warm gold primary colour, light and dark schemes, and
 * slightly tighter components for a numbers-heavy app.
 * The colour scheme follows the operating system until the user picks one in the top bar.
 */
export const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'class' },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#a16207' },
        secondary: { main: '#475569' },
        background: { default: '#f8f7f4' },
      },
    },
    dark: {
      palette: {
        primary: { main: '#facc15' },
        secondary: { main: '#cbd5e1' },
        background: { default: '#121110', paper: '#1b1a18' },
      },
    },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: { fontSize: '1.6rem', fontWeight: 600 },
    h2: { fontSize: '1.25rem', fontWeight: 600 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: { defaultProps: { variant: 'outlined' } },
    MuiTextField: { defaultProps: { size: 'small' } },
  },
});
