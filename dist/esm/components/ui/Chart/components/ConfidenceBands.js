import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { Area } from 'recharts';
import { ANIMATION_DURATION, ANIMATION_BEGIN } from '../../ChartForecast/ChartForecast.constants.js';

function ConfidenceBands({ color, hidden = false, animate = false, }) {
    return (jsxs(Fragment, { children: [jsx(Area, { type: "monotone", dataKey: "lower_boundary", stroke: "transparent", fill: "transparent", isAnimationActive: animate, animationDuration: ANIMATION_DURATION, animationBegin: ANIMATION_BEGIN, connectNulls: true, hide: hidden }), jsx(Area, { type: "monotone", dataKey: "upper_boundary", stroke: "transparent", fill: color, fillOpacity: 0.35, isAnimationActive: animate, animationDuration: ANIMATION_DURATION, animationBegin: ANIMATION_BEGIN, connectNulls: true, hide: hidden })] }));
}

export { ConfidenceBands };
