import { ThemeDefaults, ThemeHelpers } from '@homecode/ui';

const { colors, getColors, getConfig } = ThemeDefaults;

const defaultColors = getColors();
const defaultConfig = getConfig();

const alphaMods = [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

export const DEFAULT_THEME_ACTIVE_COLOR = '#9c59ff';

export type GetThemeConfigOptions = {
  activeColor?: string;
};

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

export function getThemeConfig(
  isDarkTheme: boolean,
  options?: GetThemeConfigOptions,
) {
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
