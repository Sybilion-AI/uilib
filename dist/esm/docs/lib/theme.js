import { ThemeHelpers, ThemeDefaults } from '@homecode/ui';

const { colors, getColors, getConfig } = ThemeDefaults;
getColors();
getConfig();
({
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
});
