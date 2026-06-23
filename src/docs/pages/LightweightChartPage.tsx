import { useMemo } from 'react';

import { LightweightForecastChart } from '#uilib/components/ui/Chart';
import type { QuantileBandConfig } from '#uilib/components/ui/Chart/chartForecastVisualization.types';
import lightweightForecastChartGuidance from '#uilib/components/ui/Chart/lightweight/AGENT.md';
import type { ChartDataPoint } from '#uilib/components/ui/ChartAreaInteractive/ChartAreaInteractive.types';
import type { ForecastItemData } from '#uilib/components/ui/ChartAreaInteractive/ChartLines';
import { PageContentSection } from '#uilib/components/ui/Page';
import { useTheme } from '#uilib/contexts/theme-context';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';
import S from './LightweightChartPage.styl';

const DEMO_FORECAST_ID = 1;

const DEMO_FORECAST_DATES = ['2023-06-01', '2023-07-01', '2023-08-01'] as const;

const DEMO_OVERLAY_QUANTILES = {
  '0.1': [12.5, 13.2, 14],
  '0.25': [13, 13.6, 14.5],
  '0.5': [13.5, 14, 15],
  '0.75': [14, 14.5, 15.5],
  '0.9': [14.5, 15, 16.2],
} as const;

const DEMO_BASE: ChartDataPoint[] = [
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
  { id: DEMO_FORECAST_ID, name: 'My custom forecast' },
];

function withDemoBands(data: ChartDataPoint[]): ChartDataPoint[] {
  return data.map(row => {
    const idx = (DEMO_FORECAST_DATES as readonly string[]).indexOf(row.date);
    if (idx === -1) return row;
    const lowerWide = DEMO_OVERLAY_QUANTILES['0.1'][idx];
    const upperWide = DEMO_OVERLAY_QUANTILES['0.9'][idx];
    const lowerMid = DEMO_OVERLAY_QUANTILES['0.25'][idx];
    const upperMid = DEMO_OVERLAY_QUANTILES['0.75'][idx];
    return {
      ...row,
      demo_band_wide: [lowerWide, upperWide],
      demo_band_mid: [lowerMid, upperMid],
    };
  });
}

const DEMO_QUANTILE_BANDS: QuantileBandConfig[] = [
  {
    key: 'demo_band_wide',
    quantiles: ['0.1', '0.9'],
    opacity: 0.35,
    name: 'P10–P90',
    type: 'monotone',
    strokeWidth: 0,
  },
  {
    key: 'demo_band_mid',
    quantiles: ['0.25', '0.75'],
    opacity: 0.45,
    name: 'P25–P75',
    type: 'monotone',
    strokeWidth: 0,
  },
];

export default function LightweightChartPage() {
  const { isDarkMode } = useTheme();
  const historicalOnlyData = useMemo(
    () => DEMO_BASE.filter(r => r.date <= '2023-05-01'),
    [],
  );
  const bandsData = useMemo(() => withDemoBands(DEMO_BASE), []);

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'LightweightForecastChart' }]}
        title="LightweightForecastChart"
        subheader={
          <>
            TradingView{' '}
            <a href="https://www.tradingview.com/lightweight-charts/">
              Lightweight Charts
            </a>{' '}
            with historical + forecast lines, quantile fills, tooltip, legend,
            and shared <code>ensureChartForecastBridge</code> preprocessing.
          </>
        }
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={lightweightForecastChartGuidance} />
      <PageContentSection>
        <div className={S.stack}>
          <div>
            <h3 className={S.sectionTitle}>Historical line</h3>
            <p className={S.caption}>Subset of demo months through May 2023.</p>
            <div className={S.demo}>
              <LightweightForecastChart
                chartData={historicalOnlyData}
                forecastData={[]}
                isDarkTheme={isDarkMode}
                height={320}
                showLegend={false}
                formatNumber={v =>
                  Number.isFinite(v) ? v.toFixed(2) : String(v)
                }
              />
            </div>
          </div>

          <div>
            <h3 className={S.sectionTitle}>
              Historical + dashed forecast + bridge helper
            </h3>
            <p className={S.caption}>
              Rows use raw forecast anchors; the chart applies{' '}
              <code>ensureChartForecastBridge</code> internally (same defaults
              as <code>ChartAreaInteractive</code>).
            </p>
            <div className={S.demo}>
              <LightweightForecastChart
                chartData={DEMO_BASE}
                forecastData={DEMO_FORECAST_ITEMS}
                isDarkTheme={isDarkMode}
                height={320}
                forecastLineStyle="dashed"
                formatNumber={v =>
                  Number.isFinite(v) ? v.toFixed(2) : String(v)
                }
              />
            </div>
          </div>

          <div>
            <h3 className={S.sectionTitle}>
              Forecast lines + stacked quantile bands
            </h3>
            <p className={S.caption}>
              Each band key maps to tuples on forecast months; overlays from{' '}
              <code>ChartAreaInteractive</code> are intentionally omitted here.
            </p>
            <div className={S.demo}>
              <LightweightForecastChart
                chartData={bandsData}
                forecastData={DEMO_FORECAST_ITEMS}
                quantileBands={DEMO_QUANTILE_BANDS}
                isDarkTheme={isDarkMode}
                height={360}
                forecastLineStyle="dashed"
                formatNumber={v =>
                  Number.isFinite(v) ? v.toFixed(2) : String(v)
                }
              />
            </div>
          </div>
        </div>
      </PageContentSection>
    </>
  );
}
