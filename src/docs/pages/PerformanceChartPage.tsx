import { useMemo, useState } from 'react';

import type { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';
import { PageContentSection } from '#uilib/components/ui/Page';
import { Switch } from '#uilib/components/ui/Switch';
import {
  PerformanceChart,
  type PerformanceChartPayload,
  SPAGHETTI_TIME_SERIES_MATRIX_V,
} from '#uilib/components/widgets/PerformanceChart';
import PerformanceChartGuidance from '#uilib/components/widgets/PerformanceChart/AGENT.md';
import { useTheme } from '#uilib/contexts/theme-context';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}-01`;
}

function buildMonthlyHistorical(
  startYear: number,
  startMonth: number,
  count: number,
  base: number,
): ChartDataPoint[] {
  const out: ChartDataPoint[] = [];
  let y = startYear;
  let m = startMonth;
  for (let i = 0; i < count; i++) {
    out.push({
      date: monthKey(y, m),
      historical: base + Math.sin(i * 0.25) * 8 + i * 0.4,
    });
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out;
}

function buildHorizonForecasts(
  horizonKey: string,
  startYear: number,
  startMonth: number,
  count: number,
  base: number,
  drift: number,
): Record<string, number> {
  const out: Record<string, number> = {};
  let y = startYear;
  let m = startMonth;
  for (let i = 0; i < count; i++) {
    out[monthKey(y, m)] = base + Math.cos(i * 0.3 + drift) * 3 + i * 0.15;
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out;
}

const MOCK_PERFORMANCE: PerformanceChartPayload = {
  model: {
    forecasts: {
      horizon_1: buildHorizonForecasts('horizon_1', 2022, 1, 24, 112, 0),
      horizon_2: buildHorizonForecasts('horizon_2', 2022, 1, 24, 112, 0.5),
      horizon_3: buildHorizonForecasts('horizon_3', 2022, 1, 24, 112, 1),
    },
    metrics_history: {
      horizon_1: {
        mae: { '24m': 0.42 },
        mape: { '24m': 0.038 },
      },
      horizon_2: {
        mae: { '24m': 0.51 },
        mape: { '24m': 0.045 },
      },
      horizon_3: {
        mae: { '24m': 0.58 },
        mape: { '24m': 0.052 },
      },
    },
  },
  drift: {
    forecasts: {
      horizon_1: buildHorizonForecasts('horizon_1', 2022, 1, 24, 112, 1.2),
      horizon_2: buildHorizonForecasts('horizon_2', 2022, 1, 24, 112, 1.4),
      horizon_3: buildHorizonForecasts('horizon_3', 2022, 1, 24, 112, 1.6),
    },
    metrics_history: {
      horizon_1: {
        mae: { '24m': 0.62 },
        mape: { '24m': 0.055 },
      },
      horizon_2: {
        mae: { '24m': 0.71 },
        mape: { '24m': 0.061 },
      },
      horizon_3: {
        mae: { '24m': 0.79 },
        mape: { '24m': 0.068 },
      },
    },
  },
};

export default function PerformanceChartPage() {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [runAnalysisHint, setRunAnalysisHint] = useState(false);
  const [emptyPayload, setEmptyPayload] = useState(false);
  const [timeRange, setTimeRange] = useState<string>('All');

  const performanceData = useMemo(
    () => (emptyPayload ? null : MOCK_PERFORMANCE),
    [emptyPayload],
  );
  const historicalData = useMemo(
    () => buildMonthlyHistorical(2020, 1, 48, 108),
    [],
  );

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Performance chart' }]}
        title="PerformanceChart"
        subheader="Per-horizon and spaghetti performance plots with linked metrics table."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={PerformanceChartGuidance} />
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
        <PerformanceChart
          performanceData={performanceData}
          historicalData={historicalData}
          combinedData={historicalData}
          loading={loading}
          chartLoading={loading}
          performanceSectionPending={loading}
          performanceDataLoading={loading}
          perfFetchSettled={!loading}
          isEmpty={emptyPayload}
          runAnalysisHint={runAnalysisHint}
          statusHint={
            emptyPayload ? 'No performance data for this dataset.' : null
          }
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          isDarkTheme={isDarkMode}
          performanceAnalysisId={1}
          seriesInitKey={emptyPayload ? 'empty' : 'mock'}
          showAddEditCustomDataButton
          customPerformanceMatrix={
            emptyPayload
              ? null
              : {
                  v: SPAGHETTI_TIME_SERIES_MATRIX_V,
                  dates: ['2022-01-01', '2022-02-01'],
                  horizonKeys: ['horizon_1', 'horizon_2', 'horizon_3'],
                  grid: [
                    [111, 110.5, 110],
                    [112, 111.2, 110.8],
                  ],
                  perHorizonDates: [
                    ['2022-01-01', '2022-01-01', '2022-01-01'],
                    ['2022-02-01', '2022-02-01', '2022-02-01'],
                  ],
                }
          }
          customPerformanceLabel="Demo custom series"
        />
      </PageContentSection>
    </>
  );
}
