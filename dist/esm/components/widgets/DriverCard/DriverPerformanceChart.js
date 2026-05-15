import { jsxs, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { useMemo } from 'react';
import { LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts';
import '../../ui/Chart/components/BaseChartWrapper.js';
import { ChartContainer } from '../../ui/Chart/components/ChartContainer.js';
import '../../ui/Chart/Chart.context.js';
import '../../ui/Chart/Chart.styl.js';
import '../../ui/AnalysisLineIcon/AnalysisLineIcon.styl.js';
import '@radix-ui/react-slot';
import '../../ui/Badge/Badge.styl.js';
import '../../ui/LabelWithId/LabelWithId.styl.js';
import '@radix-ui/react-select';
import 'lucide-react';
import '../../ui/Select/Select.styl.js';
import '../../ui/TextShimmer/TextShimmer.js';
import '@phosphor-icons/react';
import '../../ui/AnalysesSelector/AnalysesSelector.styl.js';
import '../../ui/Chart/components/CustomChartLegend/CustomChartLegend.styl.js';
import { ChartEmptyState } from '../../ui/Chart/components/ChartEmptyState/ChartEmptyState.js';
import S from './DriverPerformanceChart.styl.js';
import { generateDriverChartData } from './driverPerformanceChartData.js';

const driverChartConfig = {
    value: {
        label: 'Performance',
        color: 'var(--primary)',
    },
};
function DriverPerformanceChart({ driver, }) {
    const precision = useMemo(() => {
        if (!driver.normalized_series)
            return 7;
        const values = Object.values(driver.normalized_series).filter((v) => typeof v === 'number' && v !== null);
        if (values.length === 0)
            return 7;
        const absoluteValues = values.map(Math.abs).filter(v => v > 0);
        if (absoluteValues.length === 0)
            return 7;
        const minAbs = Math.min(...absoluteValues);
        if (minAbs < 0.0001)
            return 7;
        if (minAbs < 0.001)
            return 6;
        if (minAbs < 0.01)
            return 5;
        if (minAbs < 0.1)
            return 4;
        if (minAbs < 1)
            return 3;
        return 2;
    }, [driver.normalized_series]);
    const chartData = useMemo(() => generateDriverChartData(driver, precision), [driver, precision]);
    const noSeriesData = useMemo(() => {
        if (!driver.normalized_series)
            return false;
        return Object.values(driver.normalized_series).every(value => value === null);
    }, [driver.normalized_series]);
    const renderTooltipContent = ({ active, payload, }) => {
        if (active && payload?.length) {
            const dataPoint = payload[0];
            const row = dataPoint?.payload;
            const date = row?.date;
            const value = dataPoint?.value;
            return (jsxs("div", { className: S.chartTooltip, children: [jsx("div", { className: S.tooltipDate, children: date instanceof Date
                            ? date.toLocaleDateString('en-US', {
                                month: 'long',
                                year: 'numeric',
                            })
                            : 'Unknown Date' }), jsxs("div", { className: S.tooltipPerformance, children: ["Performance:", ' ', typeof value === 'number'
                                ? value.toFixed(precision)
                                : String(value ?? '')] })] }));
        }
        return null;
    };
    return (jsxs("div", { className: S.driverChartContainer, children: [jsx(ChartContainer, { config: driverChartConfig, className: cn(S.chartContainer, noSeriesData && S.chartContainerDisabled), children: jsxs(LineChart, { data: chartData, margin: { left: 8, right: 8, top: 8, bottom: -20 }, children: [jsx(CartesianGrid, { vertical: false }), jsx(XAxis, { dataKey: "date", tickLine: false, axisLine: false, tick: false, tickMargin: 0, minTickGap: 0 }), jsx(YAxis, { tickLine: false, axisLine: false, tick: false, tickMargin: 0, minTickGap: 0, width: 0, domain: ['dataMin', 'dataMax'] }), jsx(Tooltip, { cursor: false, content: renderTooltipContent }), jsx(Line, { dataKey: "value", type: "natural", stroke: "var(--color-value)" })] }) }), noSeriesData && (jsx(ChartEmptyState, { variant: "inline", align: "center", status: "No series data", className: S.noDataMessage }))] }));
}

export { DriverPerformanceChart };
