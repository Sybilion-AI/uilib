import cn from 'classnames';
import { CSSProperties } from 'react';

import ChartS from '#uilib/components/ui/Chart/Chart.styl';
import type { ChartConfig } from '#uilib/components/ui/Chart/Chart.types';

export type TooltipRow = {
  dataKey?: unknown;
  name?: unknown;
  value?: unknown;
  color?: string;
};

/**
 * Tooltip rows in series order, showing real zeros, and colouring each row
 * from the chart config (an area's own colour is its white stack stroke).
 */
export function StackedTooltip({
  active,
  payload,
  label,
  config,
  valueFormatter,
  labelFormatter,
}: {
  active?: boolean;
  payload?: ReadonlyArray<TooltipRow>;
  label?: unknown;
  config: ChartConfig;
  valueFormatter?: (value: number) => string;
  labelFormatter?: (value: string | number) => string;
}) {
  const rows = (payload ?? []).filter(
    row => typeof row.value === 'number' && Number.isFinite(row.value),
  );
  if (!active || rows.length === 0) return null;
  const x = typeof label === 'number' || typeof label === 'string' ? label : '';
  return (
    <div className={ChartS.tooltipContainer}>
      <div className="font-medium">
        {labelFormatter ? labelFormatter(x) : String(x)}
      </div>
      <div className={ChartS.tooltipContentGrid}>
        {rows.map(row => {
          const key = String(row.dataKey ?? row.name);
          const value = row.value as number;
          return (
            <div key={key} className={cn(ChartS.tooltipItem, 'items-center')}>
              <div
                className={cn(ChartS.tooltipIndicator, ChartS['indicator-dot'])}
                style={
                  {
                    '--color-bg': config[key]?.color ?? row.color,
                    '--color-border': config[key]?.color ?? row.color,
                  } as CSSProperties
                }
              />
              <div className={cn(ChartS.tooltipContent, 'items-center')}>
                <span
                  className={cn(
                    'text-muted-foreground',
                    ChartS.tooltipLabelText,
                  )}
                >
                  {config[key]?.label ?? String(row.name ?? key)}
                </span>
                <span className={ChartS.tooltipValue}>
                  {valueFormatter
                    ? valueFormatter(value)
                    : value.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
