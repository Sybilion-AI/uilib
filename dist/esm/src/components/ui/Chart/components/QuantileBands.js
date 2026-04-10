import { jsx, Fragment } from 'react/jsx-runtime';
import { getForecastQuantileBandColor, FORECAST_COLORS_MAP } from '../../ChartAreaInteractive/ChartLines.js';
import { Area } from 'recharts';

const DEFAULT_QUANTILE_BAND_COLOR = FORECAST_COLORS_MAP['#04ADC3'];
/**
 * Renders quantile bands as Area components using array values
 * Each band uses [lower, upper] array format to fill between two values
 */
function QuantileBands({ color, hiddenBands = new Set(), quantileBandKey, animate = true, animationDuration, animationBegin, customBands, showLegend = true, }) {
    return (jsx(Fragment, { children: customBands.map((band, index) => {
            if (hiddenBands.has(band.key))
                return null;
            const fillColor = color || band.color || getForecastQuantileBandColor(index);
            return (jsx(Area, { type: band.type || 'monotone', dataKey: band.key, name: band.name, stroke: band.strokeWidth ? fillColor : 'none', strokeWidth: band.strokeWidth || 0, strokeDasharray: band.strokeDasharray, strokeOpacity: band.strokeOpacity, fill: fillColor, 
                // fillOpacity={band.opacity}
                legendType: showLegend === false ? 'none' : undefined, connectNulls: true, dot: false, activeDot: false, isAnimationActive: animate, animationDuration: animationDuration, animationBegin: animationBegin, animationEasing: "ease-out" }, quantileBandKey
                ? `${quantileBandKey}-${index}`
                : `quantile-band-${index}`));
        }) }));
}

export { DEFAULT_QUANTILE_BAND_COLOR, QuantileBands };
