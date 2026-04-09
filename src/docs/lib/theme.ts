import { ThemeDefaults, ThemeHelpers } from '@homecode/ui';

const { colors, getColors, getConfig } = ThemeDefaults;

const defaultColors = getColors();
const defaultConfig = getConfig();

export const colorsConfig = {
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

export function getThemeConfig(isDarkTheme: boolean) {
  return {
    ...defaultConfig,
    ...colorsConfig[isDarkTheme ? 'dark' : 'light'],
    ...ThemeHelpers.colorsConfigToVars({
      active: {
        color: '#00a9c7',
        mods: {
          // @ts-ignore
          alpha: [0, 50, 100, 200, ...defaultColors.active.mods.alpha],
        },
      },
      danger: {
        color: '#ee0000',
        mods: {
          alpha: [100, 200, 300, 500, 700],
        },
      },
      warning: {
        color: '#ffa500',
        mods: {
          alpha: [50, 100, 200, 900],
        },
      },
    }),
  };
}
