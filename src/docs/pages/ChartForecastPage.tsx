import { ChartForecast } from '#uilib/components/ui/ChartForecast';
import type {
  ForecastData,
  TimeSeriesPoint,
} from '#uilib/components/ui/ChartForecast/ChartForecast.types';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

const HISTORICAL: TimeSeriesPoint[] = [
  ['2024-01-01', 100],
  ['2024-02-01', 105],
  ['2024-03-01', 102],
];

const FORECAST: ForecastData = {
  forecast_series: {
    '2024-04-01': { forecast: 108 },
    '2024-05-01': { forecast: 110 },
  },
};

export default function ChartForecastPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'ChartForecast' }]}
        title="ChartForecast"
        subheader="Historical line with deterministic forecast."
        actions={<DocsHeaderActions />}
      />
      <ChartForecast
        historicalData={HISTORICAL}
        forecastData={FORECAST}
        mode="deterministic"
        showConfidenceBands
        loading={false}
        isDarkTheme={false}
        height={320}
      />
    </>
  );
}
