import {
  BaseChartWrapper,
  formatNumber,
} from '#uilib/components/ui/Chart/components';
import { chartConfig } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive';
import type { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';
import type { ForecastItemData } from '#uilib/components/ui/ChartAreaInteractive/ChartLines';

export interface MessageChartProps {
  chartData: ChartDataPoint[];
  forecastData: ForecastItemData[];
  loading: boolean;
  isDarkTheme?: boolean;
}

export function MessageChart({
  chartData,
  forecastData,
  loading,
  isDarkTheme = false,
}: MessageChartProps) {
  return (
    <BaseChartWrapper
      chartConfig={chartConfig}
      chartData={chartData}
      forecastData={forecastData}
      loading={loading}
      isDarkTheme={isDarkTheme}
      formatNumber={formatNumber}
    />
  );
}
