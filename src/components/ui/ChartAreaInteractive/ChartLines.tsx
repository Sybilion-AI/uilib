import { memo, useMemo } from 'react';

import { Line } from 'recharts';

import { ChartDataPoint } from './ChartAreaInteractive.types';

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

// Memoized component for chart lines - only re-renders when data/analyses/hiddenSeries change
export const ChartLines = memo(
  ({
    chartData,
    forecastData,
    hiddenSeries,
    isDarkTheme,
    shouldAnimate,
    historicalLineColor = isDarkTheme ? '#ffffff' : '#000000',
    showLegend = true,
    forecastLineStyle = 'dashed',
    disableHistoricalAnimation = false,
  }: {
    chartData: ChartDataPoint[];
    forecastData?: ForecastItemData[];
    hiddenSeries?: Set<string>;
    isDarkTheme: boolean;
    shouldAnimate?: boolean;
    historicalLineColor?: string;
    showLegend?: boolean;
    forecastLineStyle?: 'dashed' | 'solid';
    disableHistoricalAnimation?: boolean;
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

    // Memoize last historical index to avoid recalculating on every render call
    const lastHistoricalIndex = useMemo(() => {
      for (let i = chartData.length - 1; i >= 0; i--) {
        const value = chartData[i].historical;
        if (value !== undefined && value !== null) {
          return i;
        }
      }
      return -1;
    }, [chartData]);

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

    const renderHistoricalDot = (props: any) =>
      renderDot(props, lastHistoricalIndex, 'historical', historicalLineColor);

    const renderForecastDot = (props: any, id: number, color: string) =>
      renderDot(props, lastForecastIndices[id] ?? -1, `forecast_${id}`, color);
    return (
      <>
        {/* Historical Data Line */}
        <Line
          key="historical"
          type="monotone"
          dataKey="historical"
          stroke={historicalLineColor}
          strokeWidth={1}
          dot={props => renderHistoricalDot(props)}
          activeDot={activeDotHistorical}
          name="Historical Data"
          legendType={showLegend === false ? 'none' : undefined}
          strokeDasharray="0"
          hide={hiddenSeries?.has('historical')}
          isAnimationActive={shouldAnimate && !disableHistoricalAnimation}
          animationDuration={
            disableHistoricalAnimation ? 0 : ANIMATION_DURATION
          }
          animationBegin={0}
          animationEasing="ease-out"
        />

        {/* Forecast Lines */}
        {forecastData?.map((data: ForecastItemData, index: number) => {
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
              dot={props => renderForecastDot(props, id, color)}
              activeDot={activeDotForecast(color)}
              name={`${name || `${id}`}`}
              legendType={showLegend === false ? 'none' : undefined}
              hide={hiddenSeries?.has(dataKey)}
              isAnimationActive={shouldAnimate}
              animationDuration={ANIMATION_DURATION}
              animationBegin={0}
              animationEasing="ease-out"
              className="chart-line-blinking"
              // className={pending ? 'chart-line-blinking' : undefined}
            />
          );
        })}
      </>
    );
  },
);

ChartLines.displayName = 'ChartLines';
