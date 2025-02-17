// psu-hub-frontend/src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',  // Light-ish blue, similar to PSU’s theme
    },
    secondary: {
      main: '#ffffff',  // White
    },
    background: {
      default: '#f5faff', // A very light blue/white background
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

export default theme;
