"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const availableThemes = [
  "vocabmastertheme", "light", "dark", "cupcake", "bumblebee", "emerald", "corporate", 
  "synthwave", "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", 
  "aqua", "lofi", "pastel", "fantasy", "wireframe", "black", "luxury", "dracula", 
  "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", "winter"
];

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<string>('vocabmastertheme');

  useEffect(() => {
    const storedTheme = localStorage.getItem('vocabmaster-theme') || 'vocabmastertheme';
    if (availableThemes.includes(storedTheme)) {
      setThemeState(storedTheme);
      document.documentElement.setAttribute('data-theme', storedTheme);
    } else {
      // Fallback to default if stored theme is invalid
      localStorage.setItem('vocabmaster-theme', 'vocabmastertheme');
      document.documentElement.setAttribute('data-theme', 'vocabmastertheme');
    }
  }, []);

  const setTheme = (newTheme: string) => {
    if (availableThemes.includes(newTheme)) {
      setThemeState(newTheme);
      localStorage.setItem('vocabmaster-theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
