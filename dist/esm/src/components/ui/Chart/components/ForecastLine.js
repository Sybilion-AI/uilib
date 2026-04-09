import { jsx } from 'react/jsx-runtime';
import { Line } from 'recharts';

function ForecastLine({ color, isDarkTheme, hidden, animate, animationDuration, animationBegin, name = 'Forecast', dataKey = 'forecast', }) {
    return (jsx(Line, { type: "monotone", dataKey: dataKey, stroke: color, strokeWidth: 1, strokeDasharray: "4 2", dot: props => {
            const { index, payload } = props;
            // Show dot only at the last forecast data point
            if (payload &&
                payload[dataKey] !== undefined &&
                index === props.payload?.length - 1) {
                return (jsx("circle", { cx: props.cx, cy: props.cy, r: 3, fill: color }, `forecast-dot-${index}`));
            }
            return jsx("g", {}, `forecast-dot-empty-${index}`);
        }, activeDot: {
            r: 6,
            fill: color,
            stroke: isDarkTheme ? '#000000' : '#FFFFFF',
            strokeWidth: 3,
            filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.2))',
            style: { zIndex: 20 },
        }, name: name, hide: hidden, isAnimationActive: animate, animationDuration: animationDuration, animationBegin: animationBegin, animationEasing: "ease-out", connectNulls: true }));
}

export { ForecastLine };
