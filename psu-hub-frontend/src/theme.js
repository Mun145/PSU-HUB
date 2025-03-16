// src/theme.js
import { createTheme } from '@mui/material/styles';

export default function getTheme(mode) {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#1976d2' : '#90caf9',
      },
      background: {
        default: mode === 'light' ? '#f5faff' : '#121212',
      },
    },
    typography: {
      fontFamily: 'Roboto, sans-serif',
    },
  });
}
