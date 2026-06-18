import { useMemo, useState } from 'react';

import type { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';
import { PageContentSection } from '#uilib/components/ui/Page';
import { Switch } from '#uilib/components/ui/Switch';
import { Tabs, TabsList, TabsTrigger } from '#uilib/components/ui/Tabs';
import { TIME_RANGES } from '#uilib/components/ui/TimeRangeControls/TimeRangeControls.constants';
import {
  DriversComparisonChart,
  type DriversComparisonViewTab,
} from '#uilib/components/widgets/DriversComparisonChart';
import DriversComparisonChartGuidance from '#uilib/components/widgets/DriversComparisonChart/AGENT.md';
import { useTheme } from '#uilib/contexts/theme-context';
import type { BacktestsComponentPayload } from '@sybilion/platform-sdk';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

const ALL_TIME_RANGE = TIME_RANGES[TIME_RANGES.length - 1];

function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}-01`;
}

function buildMonthlySeries(
  startYear: number,
  startMonth: number,
  count: number,
  base: number,
  drift = 0.08,
  phase = 0,
): Record<string, number> {
  const out: Record<string, number> = {};
  let y = startYear;
  let m = startMonth;
  for (let i = 0; i < count; i++) {
    out[monthKey(y, m)] = base + Math.sin(i * 0.4 + phase) * 0.35 + i * drift;
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out;
}

function buildTargetSeries(): Record<string, number> {
  return buildMonthlySeries(2018, 1, 48, 1.0, 0.012, 0.2);
}

const MOCK_PAYLOAD: BacktestsComponentPayload = {
  target: {
    id: 'target',
    name: 'Normalized target',
    normalized_series: buildTargetSeries(),
  },
  drivers: [
    {
      id: 'driver-us-pmi',
      name: 'U.S. manufacturing PMI composite',
      importance: 84.2,
      lag: '1 quarter(s)',
      normalized_series: buildMonthlySeries(2019, 4, 42, 0.45, 0.015, 0),
    },
    {
      id: 'driver-eu-orders',
      name: 'German industrial orders (domestic + foreign)',
      importance: 81.6,
      lag: '2 month(s)',
      normalized_series: buildMonthlySeries(2019, 1, 42, 0.52, -0.006, 1.1),
    },
    {
      id: 'driver-jp-machinery',
      name: 'Japan machinery orders (core private-sector)',
      importance: 77,
      lag: '~1 month(s)',
      normalized_series: buildMonthlySeries(2019, 7, 42, 0.38, 0.01, 2.4),
    },
    {
      id: 'driver-global-risk',
      name: 'Global equity risk appetite composite',
      importance: 66.5,
      lag: 'Unknown',
      normalized_series: buildMonthlySeries(2018, 10, 42, 0.41, 0.004, 3.8),
    },
    {
      id: 'driver-china-credit',
      name: 'China aggregate financing impulse',
      importance: 58.3,
      lag: '9 to 12 month(s)',
      normalized_series: buildMonthlySeries(2020, 1, 36, 0.29, 0.018, 4.2),
    },
  ],
};

function buildDatasetHistorical(): ChartDataPoint[] {
  const raw = buildMonthlySeries(2017, 7, 54, 112, 0.9, 0.5);
  return Object.entries(raw).map(([date, historical]) => ({
    date,
    historical,
  }));
}

export default function DriversComparisonChartPage() {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [runAnalysisHint, setRunAnalysisHint] = useState(false);
  const [emptyPayload, setEmptyPayload] = useState(false);
  const [timeRange, setTimeRange] = useState<string>(ALL_TIME_RANGE);
  const [viewTab, setViewTab] =
    useState<DriversComparisonViewTab>('overlapped');

  const payload = useMemo(
    () => (emptyPayload ? null : MOCK_PAYLOAD),
    [emptyPayload],
  );
  const datasetHistorical = useMemo(() => buildDatasetHistorical(), []);

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Drivers comparison chart' }]}
        title="DriversComparisonChart"
        subheader="Normalized target line with driver series; Lagged/Overlapped tabs shift driver alignment; table rows toggle chart visibility."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={DriversComparisonChartGuidance} />
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Switch
              id="loading-overlay"
              checked={loading}
              onCheckedChange={setLoading}
            />
            <label htmlFor="loading-overlay">Loading overlay</label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Switch
              id="run-analysis-hint"
              checked={runAnalysisHint}
              onCheckedChange={setRunAnalysisHint}
            />
            <label htmlFor="run-analysis-hint">Run analysis hint</label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Switch
              id="empty-payload"
              checked={emptyPayload}
              onCheckedChange={setEmptyPayload}
            />
            <label htmlFor="empty-payload">Empty payload</label>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: 16,
          }}
        >
          <Tabs
            variant="button"
            value={viewTab}
            onValueChange={v => {
              if (v === 'lagged' || v === 'overlapped') {
                setViewTab(v);
              }
            }}
          >
            <TabsList>
              <TabsTrigger value="lagged">Lagged</TabsTrigger>
              <TabsTrigger value="overlapped">Overlapped</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <DriversComparisonChart
          payload={payload}
          datasetHistorical={datasetHistorical}
          loading={loading}
          chartLoading={false}
          runAnalysisHint={runAnalysisHint}
          statusHint={
            emptyPayload
              ? 'No normalized driver series in the response yet.'
              : null
          }
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          isDarkTheme={isDarkMode}
          seriesInitKey={emptyPayload ? 'empty' : 'mock'}
          viewTab={viewTab}
          onViewTabChange={setViewTab}
        />
      </PageContentSection>
    </>
  );
}
