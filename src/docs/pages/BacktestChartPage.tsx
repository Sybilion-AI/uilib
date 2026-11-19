import { useMemo, useState } from 'react';

import { PageContentSection } from '#uilib/components/ui/Page';
import { Tabs, TabsList, TabsTrigger } from '#uilib/components/ui/Tabs';
import {
  BacktestChart,
  type BacktestOrigin,
  type BacktestPoint,
} from '#uilib/components/widgets/BacktestChart';
import BacktestChartGuidance from '#uilib/components/widgets/BacktestChart/AGENT.md';
import { useTheme } from '#uilib/contexts/theme-context';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

const HORIZONS = [1, 3, 6] as const;

function monthKey(i: number): string {
  const y = 2021 + Math.floor(i / 12);
  return `${y}-${String((i % 12) + 1).padStart(2, '0')}-01`;
}

/** An invented monthly price. */
const ACTUALS: BacktestPoint[] = Array.from({ length: 48 }, (_, i) => ({
  date: monthKey(i),
  value: 100 + i * 0.8 + Math.sin(i * 0.45) * 9,
}));

/** A forecast that sees the trend and part of the swing, made each month. */
function buildOrigins(horizon: number): BacktestOrigin[] {
  const origins: BacktestOrigin[] = [];
  for (let o = 12; o + horizon < ACTUALS.length; o++) {
    origins.push({
      date: ACTUALS[o].date,
      value: ACTUALS[o].value,
      forecast: Array.from({ length: horizon }, (_, k) => {
        const i = o + k + 1;
        return {
          date: ACTUALS[i].date,
          value: 100 + i * 0.8 + Math.sin(i * 0.45 - 0.3) * 7,
        };
      }),
    });
  }
  return origins;
}

export default function BacktestChartPage() {
  const { isDarkMode } = useTheme();
  const [horizon, setHorizon] = useState<number>(3);
  const origins = useMemo(() => buildOrigins(horizon), [horizon]);
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Backtest chart' }]}
        title="BacktestChart"
        subheader="Past forecasts for one horizon against the last value held flat, with how much of its error they remove."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={BacktestChartGuidance} />
      <PageContentSection>
        <Tabs
          value={String(horizon)}
          onValueChange={v => setHorizon(Number(v))}
        >
          <TabsList>
            {HORIZONS.map(h => (
              <TabsTrigger key={h} value={String(h)}>
                {h}m
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <BacktestChart
          key={horizon}
          actuals={ACTUALS}
          origins={origins}
          isDarkTheme={isDarkMode}
          formatNumber={v => v.toFixed(0)}
        />
      </PageContentSection>
    </>
  );
}
