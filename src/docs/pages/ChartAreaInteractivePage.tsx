import { useCallback, useMemo, useState } from 'react';

import { ChartAreaInteractive } from '#uilib/components/ui/ChartAreaInteractive';
import ChartAreaInteractiveGuidance from '#uilib/components/ui/ChartAreaInteractive/AGENT.md';
import type {
  ChartDataPoint,
  OverlayMode,
} from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';
import { ForecastItemData } from '#uilib/components/ui/ChartAreaInteractive/ChartLines';
import type { HistoryItemData } from '#uilib/components/ui/ChartAreaInteractive/chartHistories';
import { Label } from '#uilib/components/ui/Label';
import { PageContentSection } from '#uilib/components/ui/Page';
import { Switch } from '#uilib/components/ui/Switch';
import { Tabs, TabsList, TabsTrigger } from '#uilib/components/ui/Tabs';
import { useTheme } from '#uilib/contexts/theme-context';
import type { ForecastData } from '#uilib/types/forecast-data';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
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
  {
    id: DEMO_FORECAST_ID,
    name: 'My custom forecast with an extremely long descriptive name that should wrap and clamp inside the chart tooltip after three lines',
  },
];

type DemoMode = 'none' | OverlayMode;

// Two products, each with its own history; each forecast `continues` its own.
const MULTI_HISTORIES: HistoryItemData[] = [
  { id: 'a', name: 'Product A', color: '#216BF7' },
  { id: 'b', name: 'Product B', color: '#059643' },
];

const MULTI_FORECASTS: ForecastItemData[] = [
  { id: 11, name: 'Product A forecast', color: '#216BF7', continues: 'a' },
  { id: 12, name: 'Product B forecast', color: '#059643', continues: 'b' },
];

const MULTI_CHART: ChartDataPoint[] = [
  { date: '2025-10-01', historical_a: 10, historical_b: 14 },
  { date: '2025-11-01', historical_a: 10.4, historical_b: 13.6 },
  { date: '2025-12-01', historical_a: 10.9, historical_b: 13.1 },
  { date: '2026-01-01', historical_a: 11.2, historical_b: 12.8 },
  { date: '2026-02-01', historical_a: 11.0, historical_b: 12.9 },
  { date: '2026-03-01', historical_a: 11.6, historical_b: 12.4 },
  { date: '2026-04-01', forecast_11: 11.9, forecast_12: 12.2 },
  { date: '2026-05-01', forecast_11: 12.3, forecast_12: 12.0 },
  { date: '2026-06-01', forecast_11: 12.6, forecast_12: 11.7 },
];

function MultiHistoryDemo({ isDarkTheme }: { isDarkTheme: boolean }) {
  const [timeRange, setTimeRange] = useState<string>('All');
  const [pinMonth, setPinMonth] = useState<string | undefined>(undefined);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const toggleLegendSeries = useCallback((key: string) => {
    setHidden(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  return (
    <ChartAreaInteractive
      chartRenderId="multi-history-demo"
      timeRange={timeRange}
      onTimeRangeChange={setTimeRange}
      pinMonth={pinMonth}
      onPinMonthChange={setPinMonth}
      chartData={MULTI_CHART}
      historyData={MULTI_HISTORIES}
      forecastData={MULTI_FORECASTS}
      loading={false}
      isDarkTheme={isDarkTheme}
      toggleLegendSeries={toggleLegendSeries}
      ensureAnalysisSeriesVisible={() => {}}
      hiddenSeries={hidden}
      maxVisibleItems={MULTI_FORECASTS.length}
    />
  );
}

function SegmentedHeaderDemo({ isDarkTheme }: { isDarkTheme: boolean }) {
  const [timeRange, setTimeRange] = useState<string>('1y');
  const [pinMonth, setPinMonth] = useState<string | undefined>(undefined);

  return (
    <ChartAreaInteractive
      chartRenderId="segmented-header-demo"
      headerTitle="Fair value 12.4 · horizon 3m · model A"
      timeRangeVariant="segmented"
      timeRange={timeRange}
      onTimeRangeChange={setTimeRange}
      pinMonth={pinMonth}
      onPinMonthChange={setPinMonth}
      chartData={INITIAL_CHART}
      forecastData={DEMO_FORECAST_ITEMS}
      loading={false}
      isDarkTheme={isDarkTheme}
      toggleLegendSeries={() => {}}
      ensureAnalysisSeriesVisible={() => {}}
      hiddenSeries={new Set()}
    />
  );
}

export default function ChartAreaInteractivePage() {
  const { isDarkMode } = useTheme();
  const [timeRange, setTimeRange] = useState<string>('1y');
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
  const [loading, setLoading] = useState(false);

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
      <DocsGuidance source={ChartAreaInteractiveGuidance} />
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
          }}
        >
          <Switch
            id="chart-loading"
            checked={loading}
            onCheckedChange={setLoading}
          />
          <Label htmlFor="chart-loading">Loading</Label>
        </div>
        <ChartAreaInteractive
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          pinMonth={pinMonth}
          onPinMonthChange={setPinMonth}
          mode={mode}
          chartData={chartData}
          forecastData={DEMO_FORECAST_ITEMS}
          loading={loading}
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
      <PageContentSection>
        <h3 style={{ marginBottom: '1rem' }}>Several history lines</h3>
        <p>
          One history per product via <code>historyData</code> (data keys{' '}
          <code>historical_&lt;id&gt;</code>). A forecast joins the history its{' '}
          <code>continues</code> names; with several histories and no{' '}
          <code>continues</code>, it starts on its own first point.
        </p>
        <MultiHistoryDemo isDarkTheme={isDarkMode} />
      </PageContentSection>
      <PageContentSection>
        <h3 style={{ marginBottom: '1rem' }}>Title and segmented range</h3>
        <p>
          <code>headerTitle</code> puts a caption at the start of the header
          row, with the range control at its end;{' '}
          <code>timeRangeVariant="segmented"</code> draws the compact picker on
          a grey track.
        </p>
        <SegmentedHeaderDemo isDarkTheme={isDarkMode} />
      </PageContentSection>
    </>
  );
}
