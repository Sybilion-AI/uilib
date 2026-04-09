import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { Area } from 'recharts';
import { TREND_COLORS } from '../ChartTrend.constants.js';

function TrendAreas({ boundaries, meanCPD, chartData, isDarkTheme, restricted, }) {
    if (!meanCPD.change_points.length)
        return null;
    const cpd = meanCPD.change_points[0];
    const sign = cpd.sign;
    // Prepare area data by adding boundary values to chart data
    chartData.map(point => {
        const dateIndex = boundaries.dates.indexOf(point.date);
        if (dateIndex !== -1) {
            return {
                ...point,
                upper_boundary: boundaries.upper[dateIndex],
                lower_boundary: boundaries.lower[dateIndex],
            };
        }
        return point;
    });
    if (sign === 0) {
        // Neutral trend - show symmetric risk areas
        const thresholdPercentage = meanCPD.cpd_metrics.fc_metrics.recall;
        return (jsxs(Fragment, { children: [jsx(Area, { type: "monotone", dataKey: "lower_boundary", stroke: "transparent", fill: "transparent", connectNulls: true }), jsx(Area, { type: "monotone", dataKey: "upper_boundary", stroke: "transparent", fill: TREND_COLORS.area.neutral, fillOpacity: thresholdPercentage, connectNulls: true })] }));
    }
    // Directional trend - show main trend and risk areas
    const focusPercentage = meanCPD.cpd_metrics.consistency_metrics.fc_with_noise_class;
    const remnantPercentage = 1 - meanCPD.cpd_metrics.consistency_metrics.fc_ignore_noise_class;
    if (sign > 0) {
        // Positive trend
        return (jsxs(Fragment, { children: [jsx(Area, { type: "monotone", dataKey: "lower_boundary", stroke: "transparent", fill: TREND_COLORS.area.negative, fillOpacity: Math.max(0.05, remnantPercentage), connectNulls: true }), jsx(Area, { type: "monotone", dataKey: "upper_boundary", stroke: "transparent", fill: TREND_COLORS.area.positive, fillOpacity: Math.max(0.1, focusPercentage), connectNulls: true })] }));
    }
    // Negative trend
    return (jsxs(Fragment, { children: [jsx(Area, { type: "monotone", dataKey: "upper_boundary", stroke: "transparent", fill: TREND_COLORS.area.positive, fillOpacity: Math.max(0.05, remnantPercentage), connectNulls: true }), jsx(Area, { type: "monotone", dataKey: "lower_boundary", stroke: "transparent", fill: TREND_COLORS.area.negative, fillOpacity: Math.max(0.1, focusPercentage), connectNulls: true })] }));
}

export { TrendAreas };
