import { ThemeHelpers, ThemeDefaults } from '@homecode/ui';

const { colors, getColors, getConfig } = ThemeDefaults;
const defaultPalette = getColors();
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
/** Homecode `<Theme config={...}>` shape for workspace mini-apps (generic palette). */
function getDefaultMiniAppThemeConfig(isDarkMode) {
    return {
        ...getConfig(),
        ...colorsConfig[isDarkMode ? 'dark' : 'light'],
        ...ThemeHelpers.colorsConfigToVars({
            active: {
                color: '#00a9c7',
                mods: {
                    // @ts-ignore — extend defaults so --active-color-alpha-* variants match Homecode
                    alpha: [0, 50, 100, 200, ...defaultPalette.active.mods.alpha],
                },
            },
        }),
    };
}

export { getDefaultMiniAppThemeConfig };
