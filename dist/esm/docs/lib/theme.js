import { ThemeHelpers, ThemeDefaults } from '@homecode/ui';

const { colors, getColors, getConfig } = ThemeDefaults;
getColors();
const defaultConfig = getConfig();
const alphaMods = [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
const DEFAULT_THEME_ACTIVE_COLOR = '#9c59ff';
const colorsConfig = {
    light: {
        ...ThemeHelpers.colorsConfigToVars({
            ...getColors({
                accent: colors.dark,
                decent: colors.light,
            }),
        }),
    },
    dark: {
        ...ThemeHelpers.colorsConfigToVars({
            ...getColors({
                accent: colors.light,
                decent: colors.dark,
            }),
        }),
    },
};
function getThemeConfig(isDarkTheme, options) {
    const activeColor = options?.activeColor ?? DEFAULT_THEME_ACTIVE_COLOR;
    return {
        ...defaultConfig,
        ...colorsConfig[isDarkTheme ? 'dark' : 'light'],
        ...ThemeHelpers.colorsConfigToVars({
            active: {
                color: activeColor,
                mods: {
                    // @ts-ignore
                    alpha: alphaMods,
                },
            },
            danger: {
                color: '#ee0000',
                mods: {
                    alpha: alphaMods,
                },
            },
            warning: {
                color: '#ffa500',
                mods: {
                    alpha: alphaMods,
                },
            },
        }),
    };
}

export { DEFAULT_THEME_ACTIVE_COLOR, colorsConfig, getThemeConfig };
