import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Theme as ThemeRoot } from '@homecode/ui';

import {
  getThemeConfig as defaultGetThemeConfig,
  type GetThemeConfigOptions,
} from '#uilib/docs/lib/theme';

export type ThemeMode = 'light' | 'dark';

export type GetThemeConfigFn = (
  isDarkTheme: boolean,
  options?: GetThemeConfigOptions,
) => ReturnType<typeof defaultGetThemeConfig>;

export type { GetThemeConfigOptions };

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

export type ThemeProviderProps = {
  children: React.ReactNode;
  /** When false, DOM classes still update but theme is not persisted to `localStorage`. */
  allowLocalStorage?: boolean;
  /** Override docs default active/accent token (`DEFAULT_THEME_ACTIVE_COLOR`). Passed into `getThemeConfig`. */
  activeColor?: string;
  /** Homecode theme config; defaults to uilib docs palette. */
  getThemeConfig?: GetThemeConfigFn;
};

export function ThemeProvider({
  children,
  allowLocalStorage = true,
  activeColor,
  getThemeConfig: getThemeConfigProp,
}: ThemeProviderProps) {
  const getThemeConfig = getThemeConfigProp ?? defaultGetThemeConfig;

  const themeConfigOptions = useMemo<GetThemeConfigOptions>(
    () => ({ activeColor }),
    [activeColor],
  );

  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('theme') as ThemeMode) || 'light';
  });

  const [currThemeConfig, setCurrThemeConfig] = useState(() =>
    getThemeConfig(theme === 'dark', themeConfigOptions),
  );

  const toggleTheme = useCallback(() => {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  useEffect(() => {
    setCurrThemeConfig(getThemeConfig(theme === 'dark', themeConfigOptions));
  }, [theme, getThemeConfig, themeConfigOptions]);

  useEffect(() => {
    const root = document.documentElement;
    const effectiveTheme = theme;

    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);
    if (allowLocalStorage) {
      localStorage.setItem('theme', theme);
    }
  }, [theme, allowLocalStorage]);

  const value = useMemo(
    () => ({
      theme,
      isDarkMode: theme === 'dark',
      setTheme,
      toggleTheme,
    }),
    [theme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <ThemeRoot config={currThemeConfig} />
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
