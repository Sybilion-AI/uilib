import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { Theme as ThemeRoot } from '@homecode/ui';

import { getThemeConfig } from '../lib/theme';

export type ThemeMode = 'light' | 'dark';

const ThemeContext = createContext<{
  theme: ThemeMode;
  isDarkMode: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}>({
  theme: 'light',
  isDarkMode: false,
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('theme') as ThemeMode) || 'light';
  });

  const [currThemeConfig, setCurrThemeConfig] = useState(() =>
    getThemeConfig(theme === 'dark'),
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  useEffect(() => {
    setCurrThemeConfig(getThemeConfig(theme === 'dark'));
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const effectiveTheme = theme;

    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkMode: theme === 'dark',
        setTheme,
        toggleTheme,
      }}
    >
      <ThemeRoot config={currThemeConfig} />
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
