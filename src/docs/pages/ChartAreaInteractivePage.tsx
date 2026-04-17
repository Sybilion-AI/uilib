import { useCallback, useState } from 'react';

import { ChartAreaInteractive } from '#uilib/components/ui/ChartAreaInteractive';
import type { TimeRange } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.helpers';
import type { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

const INITIAL_CHART: ChartDataPoint[] = [
  { date: '2023-01-01', historical: 10 },
  { date: '2023-02-01', historical: 12 },
  { date: '2023-03-01', historical: 11 },
  { date: '2023-04-01', historical: 14 },
  { date: '2023-05-01', historical: 13 },
];

export default function ChartAreaInteractivePage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('1y');
  const [pinMonth, setPinMonth] = useState<string | undefined>(undefined);
  const [chartData] = useState<ChartDataPoint[]>(INITIAL_CHART);
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const toggleLegendSeries = useCallback((key: string) => {
    setHidden(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const ensureAnalysisSeriesVisible = useCallback(() => {}, []);

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'ChartAreaInteractive' }]}
        title="ChartAreaInteractive"
        subheader="Interactive area chart shell with time range controls."
        actions={<DocsHeaderActions />}
      />
      <ChartAreaInteractive
        timeRange={timeRange}
        onTimeRangeChange={v => setTimeRange(v as TimeRange)}
        pinMonth={pinMonth}
        onPinMonthChange={setPinMonth}
        chartData={chartData}
        forecastData={[]}
        loading={false}
        isDarkTheme={false}
        toggleLegendSeries={toggleLegendSeries}
        ensureAnalysisSeriesVisible={ensureAnalysisSeriesVisible}
        hiddenSeries={hidden}
      />
    </>
  );
}
