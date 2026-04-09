export type ThemeMode = 'light' | 'dark';
export declare function ThemeProvider({ children }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare const useTheme: () => {
    theme: ThemeMode;
    setTheme: (theme: ThemeMode) => void;
};
