'use client';

import {
  FORECAST_COLORS_MAP,
  getForecastQuantileBandColor,
} from '@/components/ui/ChartAreaInteractive/ChartLines';
import { Area } from 'recharts';

import type { QuantileBandConfig } from '../../ChartForecastProbabilistic/ChartForecastProbabilistic.types';

export const DEFAULT_QUANTILE_BAND_COLOR = FORECAST_COLORS_MAP['#04ADC3'];

interface QuantileBandsProps {
  color?: string;
  hiddenBands?: Set<string>;
  quantileBandKey?: string;
  animate?: boolean;
  animationDuration: number;
  animationBegin: number;
  customBands: QuantileBandConfig[];
  showLegend?: boolean;
}

/**
 * Renders quantile bands as Area components using array values
 * Each band uses [lower, upper] array format to fill between two values
 */
export function QuantileBands({
  color,
  hiddenBands = new Set(),
  quantileBandKey,
  animate = true,
  animationDuration,
  animationBegin,
  customBands,
  showLegend = true,
}: QuantileBandsProps) {
  return (
    <>
      {customBands.map((band: QuantileBandConfig, index: number) => {
        if (hiddenBands.has(band.key)) return null;

        const fillColor =
          color || band.color || getForecastQuantileBandColor(index);

        return (
          <Area
            key={
              quantileBandKey
                ? `${quantileBandKey}-${index}`
                : `quantile-band-${index}`
            }
            type={band.type || 'monotone'}
            dataKey={band.key}
            name={band.name}
            stroke={band.strokeWidth ? fillColor : 'none'}
            strokeWidth={band.strokeWidth || 0}
            strokeDasharray={band.strokeDasharray}
            strokeOpacity={band.strokeOpacity}
            fill={fillColor}
            // fillOpacity={band.opacity}
            legendType={showLegend === false ? 'none' : undefined}
            connectNulls
            dot={false}
            activeDot={false}
            isAnimationActive={animate}
            animationDuration={animationDuration}
            animationBegin={animationBegin}
            animationEasing="ease-out"
          />
        );
      })}
    </>
  );
}
