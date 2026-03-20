import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSiteInfo } from '../api';

const SiteContext = createContext(null);

export function SiteProvider({ children }) {
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSiteInfo()
      .then((res) => {
        if (res.data.success) {
          setSite(res.data.data);
          // Update page title
          if (res.data.data?.name) {
            document.title = res.data.data.name;
          }
          // Update favicon
          if (res.data.data?.favicon) {
            const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
            link.rel = 'icon';
            link.href = res.data.data.favicon;
            document.head.appendChild(link);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <SiteContext.Provider value={{ site, loading }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used within SiteProvider');
  return ctx;
}
