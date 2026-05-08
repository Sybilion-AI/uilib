import { useCallback, useMemo, useState } from 'react';

import { ChartAreaInteractive } from '#uilib/components/ui/ChartAreaInteractive';
import type { TimeRange } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.helpers';
import type {
  ChartDataPoint,
  OverlayMode,
} from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';
import { ForecastItemData } from '#uilib/components/ui/ChartAreaInteractive/ChartLines';
import { PageContentSection } from '#uilib/components/ui/Page';
import { Tabs, TabsList, TabsTrigger } from '#uilib/components/ui/Tabs';
import { useTheme } from '#uilib/docs/contexts/theme-context';
import type { ForecastData } from '#uilib/types/forecast-data';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

const DEMO_FORECAST_ID = 1;

const DEMO_FORECAST_DATES = ['2023-06-01', '2023-07-01', '2023-08-01'] as const;

const DEMO_OVERLAY_FORECAST: ForecastData = {
  analysisId: DEMO_FORECAST_ID,
  dates: [...DEMO_FORECAST_DATES],
  forecastValues: [13.5, 14, 15],
  allQuantiles: {
    '0.1': [12.5, 13.2, 14],
    '0.25': [13, 13.6, 14.5],
    '0.5': [13.5, 14, 15],
    '0.75': [14, 14.5, 15.5],
    '0.9': [14.5, 15, 16.2],
  },
};

const INTERVAL_LOWER_QUANTILES = ['0.1', '0.25'];
const INTERVAL_UPPER_QUANTILES = ['0.75', '0.9'];

const DEMO_DISCRETE_THRESHOLDS = (() => {
  const nums = new Set<number>();
  DEMO_OVERLAY_FORECAST.forecastValues.forEach(v => nums.add(v));
  const q = DEMO_OVERLAY_FORECAST.allQuantiles;
  if (q) {
    for (const arr of Object.values(q)) {
      arr.forEach(v => nums.add(v));
    }
  }
  const sorted = [...nums].sort((a, b) => a - b);
  return { lower: sorted, upper: sorted };
})();

const INITIAL_CHART: ChartDataPoint[] = [
  { date: '2021-01-01', historical: 6 },
  { date: '2021-02-01', historical: 8 },
  { date: '2021-03-01', historical: 7 },
  { date: '2021-04-01', historical: 10 },
  { date: '2021-05-01', historical: 9 },
  { date: '2021-06-01', historical: 10 },
  { date: '2021-07-01', historical: 11 },
  { date: '2021-08-01', historical: 10 },
  { date: '2021-09-01', historical: 12 },
  { date: '2021-10-01', historical: 11 },
  { date: '2021-11-01', historical: 13 },
  { date: '2021-12-01', historical: 12 },
  { date: '2022-01-01', historical: 8 },
  { date: '2022-02-01', historical: 10 },
  { date: '2022-03-01', historical: 9 },
  { date: '2022-04-01', historical: 12 },
  { date: '2022-05-01', historical: 11 },
  { date: '2022-06-01', historical: 12 },
  { date: '2022-07-01', historical: 13 },
  { date: '2022-08-01', historical: 12 },
  { date: '2022-09-01', historical: 14 },
  { date: '2022-10-01', historical: 13 },
  { date: '2022-11-01', historical: 15 },
  { date: '2022-12-01', historical: 14 },
  { date: '2023-01-01', historical: 10 },
  { date: '2023-02-01', historical: 12 },
  { date: '2023-03-01', historical: 11 },
  { date: '2023-04-01', historical: 14 },
  { date: '2023-05-01', historical: 13 },
  { date: '2023-06-01', [`forecast_${DEMO_FORECAST_ID}`]: 13.5 },
  { date: '2023-07-01', [`forecast_${DEMO_FORECAST_ID}`]: 14 },
  { date: '2023-08-01', [`forecast_${DEMO_FORECAST_ID}`]: 15 },
];

const DEMO_FORECAST_ITEMS: ForecastItemData[] = [
  { id: DEMO_FORECAST_ID, name: 'Forecast' },
];

type DemoMode = 'none' | OverlayMode;

export default function ChartAreaInteractivePage() {
  const { isDarkMode } = useTheme();
  const [timeRange, setTimeRange] = useState<TimeRange>('1y');
  const [pinMonth, setPinMonth] = useState<string | undefined>(undefined);
  const [demoMode, setDemoMode] = useState<DemoMode>('none');
  const [chartData] = useState<ChartDataPoint[]>(INITIAL_CHART);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [selectedLowerQuantile, setSelectedLowerQuantile] = useState<
    string | null
  >('0.1');
  const [selectedUpperQuantile, setSelectedUpperQuantile] = useState<
    string | null
  >('0.9');
  const [upperThreshold, setUpperThreshold] = useState(15);

  const toggleLegendSeries = useCallback((key: string) => {
    setHidden(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const ensureAnalysisSeriesVisible = useCallback(() => {}, []);

  const showQuantileOverlay =
    demoMode === 'intervals' || demoMode === 'thresholds';

  const overlayForecastData = useMemo(
    () =>
      showQuantileOverlay ? { [DEMO_FORECAST_ID]: DEMO_OVERLAY_FORECAST } : {},
    [showQuantileOverlay],
  );

  const selectedForecast = useMemo(
    () =>
      showQuantileOverlay
        ? { id: DEMO_FORECAST_ID, name: 'Forecast' }
        : undefined,
    [showQuantileOverlay],
  );

  const mode: OverlayMode | undefined =
    demoMode === 'none' ? undefined : demoMode;

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'ChartAreaInteractive' }]}
        title="ChartAreaInteractive"
        subheader="Interactive area chart shell with time range controls."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection>
        <Tabs
          value={demoMode}
          onValueChange={v => setDemoMode(v as DemoMode)}
          style={{ marginBottom: 16 }}
        >
          <TabsList>
            <TabsTrigger value="none">None</TabsTrigger>
            <TabsTrigger value="pin">Pin</TabsTrigger>
            <TabsTrigger value="intervals">Intervals</TabsTrigger>
            <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
          </TabsList>
        </Tabs>
        <ChartAreaInteractive
          timeRange={timeRange}
          onTimeRangeChange={v => setTimeRange(v as TimeRange)}
          pinMonth={pinMonth}
          onPinMonthChange={setPinMonth}
          mode={mode}
          chartData={chartData}
          forecastData={DEMO_FORECAST_ITEMS}
          loading={false}
          isDarkTheme={isDarkMode}
          toggleLegendSeries={toggleLegendSeries}
          ensureAnalysisSeriesVisible={ensureAnalysisSeriesVisible}
          hiddenSeries={hidden}
          overlayForecastData={overlayForecastData}
          selectedForecast={selectedForecast}
          lowerQuantiles={INTERVAL_LOWER_QUANTILES}
          upperQuantiles={INTERVAL_UPPER_QUANTILES}
          selectedLowerQuantile={selectedLowerQuantile}
          selectedUpperQuantile={selectedUpperQuantile}
          onLowerQuantileChange={setSelectedLowerQuantile}
          onUpperQuantileChange={setSelectedUpperQuantile}
          upperThreshold={upperThreshold}
          onUpperThresholdChange={setUpperThreshold}
          discreteThresholdValues={DEMO_DISCRETE_THRESHOLDS}
        />
      </PageContentSection>
    </>
  );
}
