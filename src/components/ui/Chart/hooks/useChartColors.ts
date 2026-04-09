type ColorScheme = {
  light: string;
  dark: string;
};

type ChartColors = Record<string, ColorScheme | any>;

export function useChartColors(colors: ChartColors, isDarkTheme: boolean) {
  const result: Record<string, string> = {};

  for (const key in colors) {
    const colorScheme = colors[key];
    if (colorScheme?.light && colorScheme?.dark) {
      result[key] = isDarkTheme ? colorScheme.dark : colorScheme.light;
    }
  }

  return result as {
    historical: string;
    forecast: string;
    confidence?: string;
    [key: string]: string | undefined;
  };
}
