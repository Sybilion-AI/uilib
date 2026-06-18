import { useCallback, useMemo, useState } from 'react';

import { ChartAreaInteractive } from '#uilib/components/ui/ChartAreaInteractive';
import ChartAreaInteractiveGuidance from '#uilib/components/ui/ChartAreaInteractive/AGENT.md';
import type { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';
import type { ForecastItemData } from '#uilib/components/ui/ChartAreaInteractive/ChartLines';
import { calculateChartYRange } from '#uilib/components/ui/ChartAreaInteractive/overlays/useChartYRange';
import { Label } from '#uilib/components/ui/Label';
import { PageContentSection } from '#uilib/components/ui/Page';
import { Switch } from '#uilib/components/ui/Switch';
import { useTheme } from '#uilib/contexts/theme-context';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

const FORECAST_BASELINE_ID = 1;
const FORECAST_HIGH_ID = 2;

const DEMO_FORECAST_ITEMS: ForecastItemData[] = [
  { id: FORECAST_BASELINE_ID, name: 'Baseline forecast' },
  { id: FORECAST_HIGH_ID, name: 'High scenario (hidden)' },
];

const INITIAL_CHART: ChartDataPoint[] = [
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
  {
    date: '2023-06-01',
    [`forecast_${FORECAST_BASELINE_ID}`]: 13.5,
    [`forecast_${FORECAST_HIGH_ID}`]: 88,
  },
  {
    date: '2023-07-01',
    [`forecast_${FORECAST_BASELINE_ID}`]: 14,
    [`forecast_${FORECAST_HIGH_ID}`]: 92,
  },
  {
    date: '2023-08-01',
    [`forecast_${FORECAST_BASELINE_ID}`]: 15,
    [`forecast_${FORECAST_HIGH_ID}`]: 95,
  },
];

export default function IncludeHiddenInYScalePage() {
  const { isDarkMode } = useTheme();
  const [timeRange, setTimeRange] = useState<string>('All');
  const [chartData] = useState<ChartDataPoint[]>(INITIAL_CHART);
  const [hidden, setHidden] = useState<Set<string>>(
    () => new Set([`forecast_${FORECAST_HIGH_ID}`]),
  );
  const [includeHiddenInYScale, setIncludeHiddenInYScale] = useState(false);

  const toggleLegendSeries = useCallback((key: string) => {
    setHidden(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const ensureAnalysisSeriesVisible = useCallback(() => {}, []);

  const yRange = useMemo(
    () =>
      calculateChartYRange(chartData, {
        excludeQuantileBands: true,
        hiddenSeries: hidden,
        includeHiddenInYScale,
      }),
    [chartData, hidden, includeHiddenInYScale],
  );

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'includeHiddenInYScale' }]}
        title="includeHiddenInYScale"
        subheader={
          <>
            <code>BaseChartWrapper</code> / <code>ChartAreaInteractive</code>{' '}
            prop. When <code>false</code> (default), hidden legend series are
            excluded from Y-axis domain; when <code>true</code>, hidden values
            still expand the scale (legacy behavior). Toggle the high scenario
            in the legend, then flip the switch to compare.
          </>
        }
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={ChartAreaInteractiveGuidance} />
      <PageContentSection>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 16,
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Switch
              id="include-hidden-y-scale"
              checked={includeHiddenInYScale}
              onCheckedChange={setIncludeHiddenInYScale}
            />
            <Label htmlFor="include-hidden-y-scale">
              includeHiddenInYScale
            </Label>
          </div>
          <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
            Y domain: {yRange.yMin} – {yRange.yMax}
            {hidden.has(`forecast_${FORECAST_HIGH_ID}`)
              ? ' (high scenario hidden)'
              : ' (all series visible)'}
          </span>
        </div>
        <ChartAreaInteractive
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          pinMonth={undefined}
          onPinMonthChange={() => {}}
          chartData={chartData}
          forecastData={DEMO_FORECAST_ITEMS}
          loading={false}
          isDarkTheme={isDarkMode}
          toggleLegendSeries={toggleLegendSeries}
          ensureAnalysisSeriesVisible={ensureAnalysisSeriesVisible}
          hiddenSeries={hidden}
          includeHiddenInYScale={includeHiddenInYScale}
          yMin={yRange.yMin}
          yMax={yRange.yMax}
          autoScaleYAxis={false}
          disableTimeRangeSelector
        />
      </PageContentSection>
    </>
  );
}
