import { ChartForecastProbabilistic } from '#uilib/components/ui/ChartForecastProbabilistic';
import type {
  ForecastData,
  TimeSeriesPoint,
} from '#uilib/components/ui/ChartForecastProbabilistic/ChartForecastProbabilistic.types';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

const HISTORICAL: TimeSeriesPoint[] = [
  ['2024-01-01', 100],
  ['2024-02-01', 105],
  ['2024-03-01', 102],
];

const FORECAST: ForecastData = {
  forecast_series: {
    '2024-04-01': {
      forecast: 108,
      quantile_forecast: {
        '0.1': 98,
        '0.5': 108,
        '0.9': 118,
      },
    },
    '2024-05-01': {
      forecast: 110,
      quantile_forecast: {
        '0.1': 100,
        '0.5': 110,
        '0.9': 120,
      },
    },
  },
};

export default function ChartForecastProbabilisticPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'ChartForecastProbabilistic' }]}
        title="ChartForecastProbabilistic"
        subheader="Forecast with quantile bands."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection>
        <ChartForecastProbabilistic
          historicalData={HISTORICAL}
          forecastData={FORECAST}
          showQuantiles
          loading={false}
          isDarkTheme={false}
          height={320}
        />
      </PageContentSection>
    </>
  );
}
