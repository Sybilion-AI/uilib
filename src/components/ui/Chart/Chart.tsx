import * as RechartsPrimitive from 'recharts';

import {
  BaseChartWrapper,
  type BaseChartWrapperProps,
} from './components/BaseChartWrapper';
import { ChartContainer, ChartStyle } from './components/ChartContainer';
import { ChartLegendContent } from './components/ChartLegendContent';
import {
  ChartPlacedTooltip,
  NARROW_CHART_PX,
} from './components/ChartPlacedTooltip';
import { ChartTooltipContent } from './components/ChartTooltipContent';

/** recharts' Tooltip, opening under any chart narrower than {@link NARROW_CHART_PX}. */
const ChartTooltip = ChartPlacedTooltip;
const ChartLegend = RechartsPrimitive.Legend;

export * from './Chart.types';
export { ChartTooltipItem } from './components/ChartTooltipItem';
export { ChartLegendItem } from './components/ChartLegendItem';
export { CustomChartLegend } from './components/CustomChartLegend/CustomChartLegend';
export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  NARROW_CHART_PX,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  BaseChartWrapper,
  type BaseChartWrapperProps,
};
export {
  LightweightForecastChart,
  type LightweightForecastChartProps,
} from './lightweight/LightweightForecastChart';
export {
  ChartEmptyState,
  type ChartEmptyStateProps,
  type ChartEmptyStatusTone,
} from './components/ChartEmptyState/ChartEmptyState';
export { ConfidenceBands } from './components/ConfidenceBands';
export { ForecastBoundaries } from './components/ForecastBoundaries';
export { ForecastLine } from './components/ForecastLine';
export { HistoricalLine } from './components/HistoricalLine';
export {
  DEFAULT_QUANTILE_BAND_COLOR,
  QuantileBands,
} from './components/QuantileBands';
export {
  formatCompactAxisNumber,
  formatDate,
  formatNumber,
} from './tools/formatters';
export { useChartAnimation } from './hooks/useChartAnimation';
export { useChartColors } from './hooks/useChartColors';
export { useLegendState } from './hooks/useLegendState';
