import React, { createContext, useContext, useMemo } from 'react';
import { useSite } from './SiteContext';

const ThemeContext = createContext(null);

// Theme registry — lazy-loaded per-theme Home & Layout components
const themeRegistry = {
  starter: {
    Home: React.lazy(() => import('../themes/starter/Home')),
    Layout: React.lazy(() => import('../themes/starter/Layout')),
  },
  default: {
    Home: React.lazy(() => import('../themes/default/Home')),
    Layout: React.lazy(() => import('../themes/default/Layout')),
  },
  dark: {
    Home: React.lazy(() => import('../themes/dark/Home')),
    Layout: React.lazy(() => import('../themes/dark/Layout')),
  },
  minimal: {
    Home: React.lazy(() => import('../themes/minimal/Home')),
    Layout: React.lazy(() => import('../themes/minimal/Layout')),
  },
};

export function ThemeProvider({ children }) {
  const { site } = useSite();
  const themeName = site?.theme_template || 'starter';

  const theme = useMemo(() => {
    const t = themeRegistry[themeName] || themeRegistry.starter;
    return { name: themeName, ...t };
  }, [themeName]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
