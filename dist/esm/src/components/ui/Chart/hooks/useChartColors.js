function useChartColors(colors, isDarkTheme) {
    const result = {};
    for (const key in colors) {
        const colorScheme = colors[key];
        if (colorScheme?.light && colorScheme?.dark) {
            result[key] = isDarkTheme ? colorScheme.dark : colorScheme.light;
        }
    }
    return result;
}

export { useChartColors };
