import { red } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

// Create a theme instance.
const theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 28,
          padding: "8px 20px",
          textTransform: 'none',
        },
      }, 
    }, 
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: 'none',
          backgroundColor: '#37374E'
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #666370',
          boxShadow: 'none'
        },
      },
    }
  },
  typography: {
    "fontFamily": `"Rubik", "Helvetica", "Arial", sans-serif`,
    h6: {
      lineHeight: '24px'
    },
    subtitle1: {
      color: "#C4C2CE"
    }
  },
  palette: {
    mode: 'dark',
    background: {
      default: '#27243A',
      paper: '#27243A'
    },
    primary: {
      main: '#763DF0',
    },
    secondary: {
      main: '#FFD338',
    },
    info: {
      main: '#C4C2CE',
    },
    error: {
      main: red.A400,
    }
  },
});

export default theme;

