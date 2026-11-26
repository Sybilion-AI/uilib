import cn from 'classnames';
import { type ReactNode, useCallback, useMemo, useState } from 'react';

import { BaseChartWrapper } from '#uilib/components/ui/Chart/components/BaseChartWrapper';
import {
  SeriesLegend,
  type SeriesLegendItem,
} from '#uilib/components/ui/Chart/components/SeriesLegend';
import type { ForecastItemData } from '#uilib/components/ui/ChartAreaInteractive/ChartLines';
import { HISTORY_SERIES_KEY } from '#uilib/components/ui/ChartAreaInteractive/chartHistories';

import S from './BacktestChart.styl';
import {
  type BacktestOrigin,
  type BacktestPoint,
  type BacktestScore,
  backtestBaselineId,
  backtestBaselineKey,
  backtestForecastId,
  backtestForecastKey,
  backtestScore,
  buildBacktestRows,
} from './backtestChart.helpers';

/** The legend's three groups; each hides or shows all of its lines. */
type Group = 'actual' | 'forecast' | 'baseline';

const DEFAULT_WINDOWS = [24, 12];

const PERCENT = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 1 });
const defaultFormatPercent = (v: number) => `${PERCENT.format(v)}%`;

export type BacktestChartProps = {
  /** The actual values, one per month. */
  actuals: BacktestPoint[];
  /** The past months forecasts were made from, each cut to one horizon. */
  origins: BacktestOrigin[];
  /**
   * The score windows under the chart: the last N calendar months up to the
   * latest actual (default: 24 and 12).
   */
  windows?: number[];
  actualLabel?: string;
  forecastLabel?: string;
  baselineLabel?: string;
  actualColor?: string;
  forecastColor?: string;
  baselineColor?: string;
  /** One score line; the default says "removes X% of the error". */
  renderScore?: (score: BacktestScore) => ReactNode;
  formatPercent?: (value: number) => string;
  formatNumber?: (value: number) => string;
  formatDate?: (value: string, detailed?: boolean) => string;
  height?: number;
  /** Draw the lines at once, with no animation. */
  disableAnimation?: boolean;
  isDarkTheme?: boolean;
  renderId?: string;
  className?: string;
};

/**
 * A backtest: the actual values (solid), and from each origin the forecast
 * out to its horizon (dashed, with a dot where it lands) and the last value
 * held flat over the same months (dotted, the baseline). Under it, for each
 * window, how much of the baseline's error the forecast removes.
 */
export function BacktestChart({
  actuals,
  origins,
  windows = DEFAULT_WINDOWS,
  actualLabel = 'Actual',
  forecastLabel = 'Forecast',
  baselineLabel = 'Last price held flat',
  actualColor,
  forecastColor = 'var(--sb-cyan-400)',
  baselineColor = 'var(--sb-gray-400)',
  renderScore,
  formatPercent = defaultFormatPercent,
  formatNumber,
  formatDate,
  height = 300,
  disableAnimation = false,
  isDarkTheme = false,
  renderId = 'backtest',
  className,
}: BacktestChartProps) {
  const [hiddenGroups, setHiddenGroups] = useState<ReadonlySet<Group>>(
    () => new Set(),
  );
  const toggle = useCallback((group: string) => {
    setHiddenGroups(prev => {
      const next = new Set(prev);
      if (next.has(group as Group)) next.delete(group as Group);
      else next.add(group as Group);
      return next;
    });
  }, []);

  const chartData = useMemo(
    () => buildBacktestRows(actuals, origins),
    [actuals, origins],
  );
  const historyColor = actualColor ?? (isDarkTheme ? '#ffffff' : '#000000');

  const forecastData = useMemo<ForecastItemData[]>(
    () =>
      origins.flatMap((_, i) => [
        // The baseline first, so each forecast is drawn over it.
        {
          id: backtestBaselineId(i),
          name: baselineLabel,
          color: baselineColor,
          lineStyle: 'dotted' as const,
          endDot: false,
        },
        {
          id: backtestForecastId(i),
          name: forecastLabel,
          color: forecastColor,
          lineStyle: 'dashed' as const,
          endDot: true,
        },
      ]),
    [origins, baselineLabel, baselineColor, forecastLabel, forecastColor],
  );

  // The chart hides lines by data key; the legend hides whole groups.
  const hiddenSeries = useMemo(() => {
    const keys = new Set<string>();
    if (hiddenGroups.has('actual')) keys.add(HISTORY_SERIES_KEY);
    origins.forEach((_, i) => {
      if (hiddenGroups.has('forecast')) keys.add(backtestForecastKey(i));
      if (hiddenGroups.has('baseline')) keys.add(backtestBaselineKey(i));
    });
    return keys;
  }, [hiddenGroups, origins]);

  const legend = useMemo<SeriesLegendItem[]>(
    () => [
      { dataKey: 'actual', label: actualLabel, color: historyColor },
      {
        dataKey: 'forecast',
        label: forecastLabel,
        color: forecastColor,
        dashed: true,
      },
      {
        dataKey: 'baseline',
        label: baselineLabel,
        color: baselineColor,
        dotted: true,
      },
    ],
    [
      actualLabel,
      historyColor,
      forecastLabel,
      forecastColor,
      baselineLabel,
      baselineColor,
    ],
  );

  const scores = useMemo(
    () =>
      [...new Set(windows)]
        .map(months => backtestScore(actuals, origins, months))
        .filter((s): s is BacktestScore => s !== null),
    [windows, actuals, origins],
  );

  const scoreLine =
    renderScore ??
    ((s: BacktestScore) => defaultScoreLine(s, formatPercent, baselineLabel));

  return (
    <div className={cn(S.root, className)}>
      <BaseChartWrapper
        className={S.chart}
        chartData={chartData}
        historicalLineColor={historyColor}
        forecastData={forecastData}
        hiddenSeries={hiddenSeries}
        // Each origin's lines share a month with its neighbours': a tooltip
        // would list them all.
        showTooltip={false}
        showLegend={false}
        showEndDots={false}
        connectHistoryNulls
        connectForecastNulls
        renderId={renderId}
        hasCombinedData={chartData.length > 0}
        loading={false}
        isDarkTheme={isDarkTheme}
        height={height}
        disableAnimation={disableAnimation}
        formatNumber={formatNumber}
        formatDate={formatDate}
      />
      {chartData.length > 0 ? (
        <SeriesLegend
          items={legend}
          hiddenSeries={hiddenGroups as ReadonlySet<string>}
          onToggle={toggle}
        />
      ) : null}
      {scores.length > 0 ? (
        <ul className={S.scores}>
          {scores.map(s => (
            <li key={s.months}>{scoreLine(s)}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function defaultScoreLine(
  s: BacktestScore,
  formatPercent: (value: number) => string,
  baselineLabel: string,
): ReactNode {
  // Mid-sentence: the first letter drops its capital, unless the label
  // starts with an acronym ("EUR spot held flat").
  const baseline = /^.[A-Z]/.test(baselineLabel)
    ? baselineLabel
    : baselineLabel.charAt(0).toLowerCase() + baselineLabel.slice(1);
  const head =
    s.errorRemoved === null
      ? s.forecastError > 0
        ? `more error than the ${baseline}`
        : null
      : formatPercent(Math.abs(s.errorRemoved)) === formatPercent(0)
        ? `about the same error as the ${baseline}`
        : s.errorRemoved > 0
          ? `removes ${formatPercent(s.errorRemoved)} of the error`
          : `${formatPercent(-s.errorRemoved)} more error than the ${baseline}`;
  return (
    <>
      <strong>Last {s.months} months:</strong> {head ? `${head} · ` : null}
      MAPE {formatPercent(s.forecastError)} forecast,{' '}
      {formatPercent(s.baselineError)} {baseline} ({s.count}{' '}
      {s.count === 1 ? 'forecast' : 'forecasts'})
    </>
  );
}
