import cn from 'classnames';
import { CSSProperties, ReactNode } from 'react';

import {
  type TooltipItem,
  getPayloadConfigFromPayload,
} from '../Chart.helpers';
import S from '../Chart.styl';
import { ChartConfig } from '../Chart.types';

type ChartTooltipItemProps = {
  item: TooltipItem;
  index: number;
  config: ChartConfig;
  indicator: 'line' | 'dot' | 'dashed';
  hideIndicator: boolean;
  nestLabel: boolean;
  tooltipLabel: ReactNode;
  color?: string;
  nameKey?: string;
  formatter?: (
    value: unknown,
    name: string,
    props: unknown,
    index: number,
    payload: unknown,
  ) => ReactNode;
  valueFormatter?: (value: number) => string;
};

const rawValue = (value: number) =>
  value.toLocaleString(undefined, { maximumFractionDigits: 20 });

const isMissing = (value: unknown) =>
  value == null || (typeof value === 'number' && Number.isNaN(value));

/**
 * A row's value as text: numbers through `format`, anything else as is, and
 * a missing one (null, NaN) as null. A range shows a missing end as a dash,
 * and is missing itself when both ends are.
 */
function valueText(
  value: unknown,
  format: (value: number) => string,
): string | null {
  const one = (v: unknown) =>
    isMissing(v) ? null : typeof v === 'number' ? format(v) : String(v);
  if (!Array.isArray(value)) return one(value);
  const [low, high] = [one(value[0]), one(value[1])];
  if (low == null && high == null) return null;
  return `${low ?? '—'} – ${high ?? '—'}`;
}

function TooltipValue({
  value,
  format,
}: {
  value: unknown;
  format: (value: number) => string;
}) {
  const text = valueText(value, format);
  return text == null ? null : <span className={S.tooltipValue}>{text}</span>;
}

export function ChartTooltipItem({
  item,
  index,
  config,
  indicator,
  hideIndicator,
  nestLabel,
  tooltipLabel,
  color,
  nameKey,
  formatter,
  valueFormatter = rawValue,
}: ChartTooltipItemProps) {
  const key = `${nameKey || item.name || item.dataKey || 'value'}`;
  const itemConfig = getPayloadConfigFromPayload(config, item, key);
  const payloadFill =
    item.payload &&
    typeof item.payload === 'object' &&
    'fill' in item.payload &&
    typeof (item.payload as { fill?: unknown }).fill === 'string'
      ? (item.payload as { fill: string }).fill
      : undefined;
  const indicatorColor = color || payloadFill || item.color;

  return (
    <div
      key={item.dataKey}
      className={cn(S.tooltipItem, indicator === 'dot' && 'items-center')}
    >
      {formatter && item?.value !== undefined && item.name ? (
        formatter(item.value, item.name, item, index, item.payload)
      ) : (
        <>
          {itemConfig?.icon ? (
            <itemConfig.icon />
          ) : (
            !hideIndicator && (
              <div
                className={cn(
                  S.tooltipIndicator,
                  S[`indicator-${indicator}`],
                  nestLabel && S.nested,
                )}
                style={
                  {
                    '--color-bg': indicatorColor,
                    '--color-border': indicatorColor,
                  } as CSSProperties
                }
              />
            )
          )}
          <div
            className={cn(
              S.tooltipContent,
              nestLabel ? 'items-end' : 'items-center',
            )}
          >
            <div className={S.tooltipLabel}>
              {nestLabel ? tooltipLabel : null}
              <span className={cn('text-muted-foreground', S.tooltipLabelText)}>
                {itemConfig?.label || item.name}
              </span>
            </div>

            <TooltipValue value={item.value} format={valueFormatter} />
          </div>
        </>
      )}
    </div>
  );
}
