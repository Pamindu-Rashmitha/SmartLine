import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { lightThemeConfig, darkThemeConfig } from '../styles/antdTheme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    const saved = localStorage.getItem('smartline_theme');
    return saved ? saved : 'light'; // Default to light theme!
  });

  useEffect(() => {
    localStorage.setItem('smartline_theme', themeMode);
    const root = document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDark = themeMode === 'dark';
  const antdTheme = isDark ? darkThemeConfig : lightThemeConfig;

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme, isDark, setThemeMode }}>
      <ConfigProvider theme={antdTheme}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
