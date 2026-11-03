import { memo, useMemo } from 'react';

import { DefaultZIndexes, Line } from 'recharts';

import { ChartDataPoint } from './ChartAreaInteractive.types';
import {
  HISTORY_SERIES_KEY,
  HistoryItemData,
  historySeriesKey,
} from './chartHistories';

export interface LineConfig {
  dataKey: string;
  color: string;
  name: string;
}

export type ForecastItemData = {
  id: number;
  name?: string;
  color?: string;
  icon?: string;
  status?: string;
  // pending?: boolean;
  tooltip?: string;
  dimmed?: boolean;
  updated_at?: string;
  /**
   * Id of the history (`historyData`) this forecast continues. With several
   * histories, a forecast joins one only when this names it.
   */
  continues?: string | number;
};

export type Dot = {
  x: number;
  y: number;
  color: string;
};

const ANIMATION_DURATION = 300;

// Colors for different forecast series

export const FORECAST_COLORS_MAP = {
  '#C08F09': '#F9D56733',
  '#216BF7': '#84C6FB33',
  '#F103F1': '#EDB1F733',
  '#059643': '#80F3B033',
  '#FD1515': '#80F3B033',
  '#04ADC3': '#65EEFF33',
  '#3C42A9': '#ADB1F633',
  '#795548': '#D0B8AF33',
};
export const FORECAST_LINE_COLORS = Object.keys(FORECAST_COLORS_MAP);

export const getForecastColor = (index: number) =>
  FORECAST_LINE_COLORS[index % FORECAST_LINE_COLORS.length];

export const getForecastQuantileBandColor = (index: number) =>
  FORECAST_COLORS_MAP[
    FORECAST_LINE_COLORS[index % FORECAST_LINE_COLORS.length]
  ];

/** A history line as drawn: data key, label and colour with defaults applied. */
export type HistoryLine = { dataKey: string; name: string; color: string };

/** Default colour of the history at `index`: the forecast palette from its far end. */
export function getHistoryColor(index: number): string {
  const n = FORECAST_LINE_COLORS.length;
  return FORECAST_LINE_COLORS[n - 1 - (index % n)];
}

/** `historyData` with the defaults applied, in order (empty without it). */
export function resolveHistoryLines(
  histories?: HistoryItemData[],
): HistoryLine[] {
  return (histories ?? []).map((h, index) => ({
    dataKey: historySeriesKey(h.id),
    name: h.name || String(h.id),
    color: h.color ?? getHistoryColor(index),
  }));
}

/** Same tint logic as intervals/threshold overlays: band fill follows forecast line hex when known. */
export function resolveQuantileBandFillForForecastLine(
  lineColor: string,
  forecastIndex: number,
): string {
  const mapped =
    FORECAST_COLORS_MAP[lineColor as keyof typeof FORECAST_COLORS_MAP];
  return mapped ?? getForecastQuantileBandColor(forecastIndex);
}

// Memoized component for chart lines - only re-renders when data/analyses/hiddenSeries change
export const ChartLines = memo(
  ({
    chartData,
    forecastData,
    historyData,
    hiddenSeries,
    isDarkTheme,
    shouldAnimate,
    historicalLineColor = isDarkTheme ? '#ffffff' : '#000000',
    showLegend = true,
    forecastLineStyle = 'dashed',
    disableAnimation = false,
    disableHistoricalAnimation = false,
    connectHistoryNulls = false,
    connectForecastNulls = false,
    historyOnTop = false,
    showEndDots = true,
  }: {
    chartData: ChartDataPoint[];
    forecastData?: ForecastItemData[];
    /** Several history lines (one per product). Omit for the single `historical` line. */
    historyData?: HistoryItemData[];
    hiddenSeries?: Set<string>;
    isDarkTheme: boolean;
    shouldAnimate?: boolean;
    historicalLineColor?: string;
    showLegend?: boolean;
    forecastLineStyle?: 'dashed' | 'solid';
    disableAnimation?: boolean;
    disableHistoricalAnimation?: boolean;
    /** Draw each history line across months it has no value for. */
    connectHistoryNulls?: boolean;
    /** Draw each forecast line across months it has no value for. */
    connectForecastNulls?: boolean;
    /**
     * Draw the history lines after the forecast lines, over them (for many
     * faint forecasts that would otherwise cover the history).
     */
    historyOnTop?: boolean;
    /** Mark each line's last point with a dot (default: on). */
    showEndDots?: boolean;
  }) => {
    const dotStroke = isDarkTheme ? '#000000' : '#FFFFFF';

    const activeDotHistorical = {
      r: 6,
      fill: historicalLineColor,
      stroke: dotStroke,
      strokeWidth: 3,
      filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.2))',
      style: { zIndex: 20 },
    };

    const activeDotForecast = (color: string) => ({
      ...activeDotHistorical,
      fill: color,
    });

    // One entry per history line: the single `historical` line, or one per
    // `historyData` item under `historical_<id>`.
    const historyLines = useMemo(
      () =>
        historyData?.length
          ? resolveHistoryLines(historyData)
          : [
              {
                dataKey: HISTORY_SERIES_KEY,
                name: 'Historical Data',
                color: historicalLineColor,
              },
            ],
      [historyData, historicalLineColor],
    );

    // Memoize last index per history line to avoid recalculating on every render call
    const lastHistoryIndices = useMemo(() => {
      const indices: Record<string, number> = {};
      historyLines.forEach(({ dataKey }) => {
        indices[dataKey] = -1;
        for (let i = chartData.length - 1; i >= 0; i--) {
          const value = chartData[i][dataKey];
          if (value !== undefined && value !== null) {
            indices[dataKey] = i;
            break;
          }
        }
      });
      return indices;
    }, [chartData, historyLines]);

    // Memoize last forecast indices per forecast ID
    const lastForecastIndices = useMemo(() => {
      const indices: Record<number, number> = {};
      forecastData?.forEach(({ id }) => {
        const dataKey = `forecast_${id}`;
        for (let i = chartData.length - 1; i >= 0; i--) {
          const value = chartData[i][dataKey];
          if (value !== undefined && value !== null) {
            indices[id] = i;
            break;
          }
        }
      });
      return indices;
    }, [chartData, forecastData]);

    // Helper to render dot at last data point
    const renderDot = (
      props: any,
      lastIndex: number,
      dataKey: string,
      color: string,
    ) => {
      if (
        lastIndex >= 0 &&
        props.index === lastIndex &&
        chartData[props.index]?.[dataKey] != null &&
        props.cy != null &&
        props.cx != null
      ) {
        return <circle cx={props.cx} cy={props.cy} r={3} fill={color} />;
      }
      return null;
    };

    const renderHistoryDot = (props: any, dataKey: string, color: string) =>
      renderDot(props, lastHistoryIndices[dataKey] ?? -1, dataKey, color);

    const renderForecastDot = (props: any, id: number, color: string) =>
      renderDot(props, lastForecastIndices[id] ?? -1, `forecast_${id}`, color);

    const animationActive = Boolean(shouldAnimate) && !disableAnimation;
    const historicalAnimationActive =
      animationActive && !disableHistoricalAnimation;
    const forecastAnimationActive = animationActive;
    const animationDuration = disableAnimation ? 0 : ANIMATION_DURATION;
    const valueAnimationEnabled = !disableAnimation;

    // recharts draws each line into its z-index layer in mount order, not in
    // JSX order: a layer above the forecasts keeps history on top through
    // hiding, showing and added forecasts, and leaves the tooltip's order.
    const historyZIndex = historyOnTop ? DefaultZIndexes.line + 1 : undefined;

    const historyElements = historyLines.map(({ dataKey, name, color }) => (
      <Line
        key={dataKey}
        zIndex={historyZIndex}
        type="monotone"
        dataKey={dataKey}
        stroke={color}
        strokeWidth={1}
        dot={
          showEndDots ? props => renderHistoryDot(props, dataKey, color) : false
        }
        activeDot={{ ...activeDotHistorical, fill: color }}
        name={name}
        legendType={showLegend === false ? 'none' : undefined}
        strokeDasharray="0"
        connectNulls={connectHistoryNulls}
        hide={hiddenSeries?.has(dataKey)}
        isAnimationActive={historicalAnimationActive}
        animationDuration={animationDuration}
        animateNewValues={valueAnimationEnabled}
        animationBegin={0}
        animationEasing="ease-out"
      />
    ));

    const forecastElements = forecastData?.map(
      (data: ForecastItemData, index: number) => {
        const {
          id,
          name,
          color = FORECAST_LINE_COLORS[index % FORECAST_LINE_COLORS.length],
        } = data;
        const dataKey = `forecast_${id}`;

        return (
          <Line
            key={`forecast-${id}`}
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={1}
            strokeDasharray={forecastLineStyle === 'dashed' ? '4 2' : '0'}
            dot={
              showEndDots ? props => renderForecastDot(props, id, color) : false
            }
            activeDot={activeDotForecast(color)}
            name={`${name || `${id}`}`}
            legendType={showLegend === false ? 'none' : undefined}
            connectNulls={connectForecastNulls}
            hide={hiddenSeries?.has(dataKey)}
            isAnimationActive={forecastAnimationActive}
            animationDuration={animationDuration}
            animateNewValues={valueAnimationEnabled}
            animationBegin={0}
            animationEasing="ease-out"
            className={
              data.status === 'pending' ? 'chart-line-blinking' : undefined
            }
          />
        );
      },
    );

    return (
      <>
        {historyElements}
        {forecastElements}
      </>
    );
  },
);

ChartLines.displayName = 'ChartLines';
