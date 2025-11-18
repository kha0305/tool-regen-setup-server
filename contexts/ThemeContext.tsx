import React, { createContext, useState, useContext, ReactNode, useLayoutEffect } from 'react';

type Theme = 'dark' | 'light' | 'rainbow';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
        const storedTheme = window.localStorage.getItem('app-theme') as Theme;
        // Basic validation in case of invalid value in localStorage
        if (['dark', 'light', 'rainbow'].includes(storedTheme)) {
            return storedTheme;
        }
        return 'light';
    } catch (error) {
        console.warn('Could not read theme from localStorage.', error);
        return 'light';
    }
  });

  // useLayoutEffect prevents a "flash of the wrong theme" on page load.
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
        window.localStorage.setItem('app-theme', theme);
    } catch (error) {
        console.error("Failed to save theme to localStorage", error);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};