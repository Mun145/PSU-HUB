// src/theme.js
import { createTheme } from '@mui/material/styles';

// This function returns a theme object based on mode = 'light' or 'dark'.
export default function getTheme(mode) {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#1976d2' : '#90caf9'
      },
      secondary: {
        main: mode === 'light' ? '#9c27b0' : '#ce93d8'
      },
      background: {
        default: mode === 'light' ? '#f5faff' : '#121212',
        paper: mode === 'light' ? '#fff' : '#1e1e1e'
      }
    },
    typography: {
      fontFamily: 'Roboto, sans-serif',
      h6: {
        fontWeight: 600
      }
    },
    shape: {
      borderRadius: 8
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          colorPrimary: {
            backgroundColor: mode === 'light' ? '#1976d2' : '#1e1e1e'
          }
        }
      }
    }
  });
}
