import cn from 'classnames';
import { CSSProperties, ReactNode } from 'react';

import { getPayloadConfigFromPayload, type TooltipItem } from '../Chart.helpers';
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
};

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

            {item.value && (
              <span className={S.tooltipValue}>
                {Array.isArray(item.value)
                  ? `${item.value[0].toLocaleString(undefined, { maximumFractionDigits: 20 })} – ${item.value[1].toLocaleString(undefined, { maximumFractionDigits: 20 })}`
                  : item.value.toLocaleString(undefined, {
                      maximumFractionDigits: 20,
                    })}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
