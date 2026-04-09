import * as RechartsPrimitive from 'recharts';

import { ChartContainer, ChartStyle } from './components/ChartContainer';
import { ChartLegendContent } from './components/ChartLegendContent';
import { ChartTooltipContent } from './components/ChartTooltipContent';

const ChartTooltip = RechartsPrimitive.Tooltip;
const ChartLegend = RechartsPrimitive.Legend;

export * from './Chart.types';
export { ChartTooltipItem } from './components/ChartTooltipItem';
export { ChartLegendItem } from './components/ChartLegendItem';
export { CustomChartLegend } from './components/CustomChartLegend/CustomChartLegend';
export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};
