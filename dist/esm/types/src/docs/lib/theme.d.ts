export declare const DEFAULT_THEME_ACTIVE_COLOR = "#9c59ff";
export type GetThemeConfigOptions = {
    activeColor?: string;
};
export declare const colorsConfig: {
    light: {};
    dark: {};
};
export declare function getThemeConfig(isDarkTheme: boolean, options?: GetThemeConfigOptions): any;
