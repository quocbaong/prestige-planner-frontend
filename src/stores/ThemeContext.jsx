import React, { useState, useMemo, useCallback } from 'react';
import { ThemeContext } from './themeContext';

export const ThemeProviderWrapper = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = useCallback(() => setIsDarkMode((current) => !current), []);

  const value = useMemo(() => ({
    isDarkMode,
    toggleTheme
  }), [isDarkMode, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      <div className={isDarkMode ? 'dark-mode' : ''}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
