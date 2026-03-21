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

// Full-screen loading spinner shown while site info is being fetched
// Prevents theme flash (rendering default theme before API returns the real one)
function ThemeLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
    </div>
  );
}

export function ThemeProvider({ children }) {
  const { site, loading } = useSite();

  // Block rendering until site info is loaded so we know the correct theme
  if (loading) {
    return <ThemeLoading />;
  }

  const themeName = site?.theme_template || 'starter';

  return (
    <ThemeInner themeName={themeName}>
      {children}
    </ThemeInner>
  );
}

// Inner component to keep useMemo stable after loading completes
function ThemeInner({ themeName, children }) {
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
