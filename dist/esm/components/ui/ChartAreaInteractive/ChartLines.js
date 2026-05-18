import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { memo, useMemo } from 'react';
import { Line } from 'recharts';

const ANIMATION_DURATION = 300;
// Colors for different forecast series
const FORECAST_COLORS_MAP = {
    '#C08F09': '#F9D56733',
    '#216BF7': '#84C6FB33',
    '#F103F1': '#EDB1F733',
    '#059643': '#80F3B033',
    '#FD1515': '#80F3B033',
    '#04ADC3': '#65EEFF33',
    '#3C42A9': '#ADB1F633',
    '#795548': '#D0B8AF33',
};
const FORECAST_LINE_COLORS = Object.keys(FORECAST_COLORS_MAP);
const getForecastColor = (index) => FORECAST_LINE_COLORS[index % FORECAST_LINE_COLORS.length];
const getForecastQuantileBandColor = (index) => FORECAST_COLORS_MAP[FORECAST_LINE_COLORS[index % FORECAST_LINE_COLORS.length]];
/** Same tint logic as intervals/threshold overlays: band fill follows forecast line hex when known. */
function resolveQuantileBandFillForForecastLine(lineColor, forecastIndex) {
    const mapped = FORECAST_COLORS_MAP[lineColor];
    return mapped ?? getForecastQuantileBandColor(forecastIndex);
}
// Memoized component for chart lines - only re-renders when data/analyses/hiddenSeries change
const ChartLines = memo(({ chartData, forecastData, hiddenSeries, isDarkTheme, shouldAnimate, historicalLineColor = isDarkTheme ? '#ffffff' : '#000000', showLegend = true, forecastLineStyle = 'dashed', disableHistoricalAnimation = false, }) => {
    const dotStroke = isDarkTheme ? '#000000' : '#FFFFFF';
    const activeDotHistorical = {
        r: 6,
        fill: historicalLineColor,
        stroke: dotStroke,
        strokeWidth: 3,
        filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.2))',
        style: { zIndex: 20 },
    };
    const activeDotForecast = (color) => ({
        ...activeDotHistorical,
        fill: color,
    });
    // Memoize last historical index to avoid recalculating on every render call
    const lastHistoricalIndex = useMemo(() => {
        for (let i = chartData.length - 1; i >= 0; i--) {
            const value = chartData[i].historical;
            if (value !== undefined && value !== null) {
                return i;
            }
        }
        return -1;
    }, [chartData]);
    // Memoize last forecast indices per forecast ID
    const lastForecastIndices = useMemo(() => {
        const indices = {};
        forecastData?.forEach(({ id }) => {
            const dataKey = `forecast_${id}`;
            for (let i = chartData.length - 1; i >= 0; i--) {
                const value = chartData[i][dataKey];
                if (value !== undefined && value !== null) {
                    indices[id] = i;
                    break;
                }
            }
        });
        return indices;
    }, [chartData, forecastData]);
    // Helper to render dot at last data point
    const renderDot = (props, lastIndex, dataKey, color) => {
        if (lastIndex >= 0 &&
            props.index === lastIndex &&
            chartData[props.index]?.[dataKey] != null &&
            props.cy != null &&
            props.cx != null) {
            return jsx("circle", { cx: props.cx, cy: props.cy, r: 3, fill: color });
        }
        return null;
    };
    const renderHistoricalDot = (props) => renderDot(props, lastHistoricalIndex, 'historical', historicalLineColor);
    const renderForecastDot = (props, id, color) => renderDot(props, lastForecastIndices[id] ?? -1, `forecast_${id}`, color);
    return (jsxs(Fragment, { children: [jsx(Line, { type: "monotone", dataKey: "historical", stroke: historicalLineColor, strokeWidth: 1, dot: props => renderHistoricalDot(props), activeDot: activeDotHistorical, name: "Historical Data", legendType: showLegend === false ? 'none' : undefined, strokeDasharray: "0", hide: hiddenSeries?.has('historical'), isAnimationActive: shouldAnimate && !disableHistoricalAnimation, animationDuration: disableHistoricalAnimation ? 0 : ANIMATION_DURATION, animationBegin: 0, animationEasing: "ease-out" }, "historical"), forecastData?.map((data, index) => {
                const { id, name, color = FORECAST_LINE_COLORS[index % FORECAST_LINE_COLORS.length], } = data;
                const dataKey = `forecast_${id}`;
                return (jsx(Line, { type: "monotone", dataKey: dataKey, stroke: color, strokeWidth: 1, strokeDasharray: forecastLineStyle === 'dashed' ? '4 2' : '0', dot: props => renderForecastDot(props, id, color), activeDot: activeDotForecast(color), name: `${name || `${id}`}`, legendType: showLegend === false ? 'none' : undefined, hide: hiddenSeries?.has(dataKey), isAnimationActive: shouldAnimate, animationDuration: ANIMATION_DURATION, animationBegin: 0, animationEasing: "ease-out", className: "chart-line-blinking" }, `forecast-${id}`));
            })] }));
});
ChartLines.displayName = 'ChartLines';

export { ChartLines, FORECAST_COLORS_MAP, FORECAST_LINE_COLORS, getForecastColor, getForecastQuantileBandColor, resolveQuantileBandFillForForecastLine };
