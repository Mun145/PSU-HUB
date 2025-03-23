// src/contexts/ThemeContext.js
import React, { createContext, useState, useMemo, useContext } from 'react';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import getTheme from '../theme'; // Our custom function from theme.js

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const theme = useMemo(() => {
    return getTheme(darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <MUIThemeProvider theme={theme}>{children}</MUIThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}
