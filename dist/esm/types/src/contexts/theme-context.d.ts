import { getThemeConfig as defaultGetThemeConfig, type GetThemeConfigOptions } from '#uilib/docs/lib/theme';
export type ThemeMode = 'light' | 'dark';
export type GetThemeConfigFn = (isDarkTheme: boolean, options?: GetThemeConfigOptions) => ReturnType<typeof defaultGetThemeConfig>;
export type { GetThemeConfigOptions };
export type ThemeProviderProps = {
    children: React.ReactNode;
    /** When false, DOM classes still update but theme is not persisted to `localStorage`. */
    allowLocalStorage?: boolean;
    /** Override docs default active/accent token (`DEFAULT_THEME_ACTIVE_COLOR`). Passed into `getThemeConfig`. */
    activeColor?: string;
    /** Homecode theme config; defaults to uilib docs palette. */
    getThemeConfig?: GetThemeConfigFn;
};
export declare function ThemeProvider({ children, allowLocalStorage, activeColor, getThemeConfig: getThemeConfigProp, }: ThemeProviderProps): import("react/jsx-runtime").JSX.Element;
export declare const useTheme: () => {
    theme: ThemeMode;
    isDarkMode: boolean;
    setTheme: (theme: ThemeMode) => void;
    toggleTheme: () => void;
};
