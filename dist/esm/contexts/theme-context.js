import { jsxs, jsx } from 'react/jsx-runtime';
import { createContext, useMemo, useState, useCallback, useEffect, useContext } from 'react';
import { Theme } from '@homecode/ui';
import { getThemeConfig } from '../docs/lib/theme.js';

const ThemeContext = createContext({
    theme: 'light',
    isDarkMode: false,
    setTheme: () => { },
    toggleTheme: () => { },
});
function ThemeProvider({ children, allowLocalStorage = true, activeColor, getThemeConfig: getThemeConfigProp, }) {
    const getThemeConfig$1 = getThemeConfigProp ?? getThemeConfig;
    const themeConfigOptions = useMemo(() => ({ activeColor }), [activeColor]);
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });
    const [currThemeConfig, setCurrThemeConfig] = useState(() => getThemeConfig$1(theme === 'dark', themeConfigOptions));
    const toggleTheme = useCallback(() => {
        setTheme(t => (t === 'dark' ? 'light' : 'dark'));
    }, []);
    useEffect(() => {
        setCurrThemeConfig(getThemeConfig$1(theme === 'dark', themeConfigOptions));
    }, [theme, getThemeConfig$1, themeConfigOptions]);
    useEffect(() => {
        const root = document.documentElement;
        const effectiveTheme = theme;
        root.classList.remove('light', 'dark');
        root.classList.add(effectiveTheme);
        if (allowLocalStorage) {
            localStorage.setItem('theme', theme);
        }
    }, [theme, allowLocalStorage]);
    const value = useMemo(() => ({
        theme,
        isDarkMode: theme === 'dark',
        setTheme,
        toggleTheme,
    }), [theme, toggleTheme]);
    return (jsxs(ThemeContext.Provider, { value: value, children: [jsx(Theme, { config: currThemeConfig }), children] }));
}
const useTheme = () => useContext(ThemeContext);

export { ThemeProvider, useTheme };
