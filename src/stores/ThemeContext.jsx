import React, { createContext, useContext, useState, useMemo } from 'react';

const ThemeContext = createContext();

export const ThemeProviderWrapper = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const value = useMemo(() => ({
    isDarkMode,
    toggleTheme
  }), [isDarkMode]);

  return (
    <ThemeContext.Provider value={value}>
      <div className={isDarkMode ? 'dark-mode' : ''}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
