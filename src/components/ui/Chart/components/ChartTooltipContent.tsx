import cn from 'classnames';
import { useEffect, useMemo, useState } from 'react';

import { useChart } from '#uilib/components/ui/Chart/Chart.context';
import {
  type TooltipItem,
  type TooltipPayloadEntry,
  getPayloadConfigFromPayload,
  normalizeTooltipPayload,
} from '#uilib/components/ui/Chart/Chart.helpers';
import { ChartTooltipContentProps } from '#uilib/components/ui/Chart/Chart.types';

import S from '../Chart.styl';
import { ChartTooltipItem } from './ChartTooltipItem';

export function ChartTooltipContent({
  active,
  className,
  indicator = 'dot',
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  payload,
  formatter,
  color,
  nameKey,
  labelKey,
}: ChartTooltipContentProps) {
  const { config } = useChart();

  // Keep last tooltip data in state to maintain position when inactive
  const [lastTooltipData, setLastTooltipData] = useState<{
    active: boolean;
    payload: TooltipItem[] | undefined;
    label: string | number | undefined;
  } | null>(null);

  const normalizedPayload = useMemo(
    () => normalizeTooltipPayload(payload as TooltipPayloadEntry[] | undefined),
    [payload],
  );

  // Update last tooltip data when active
  useEffect(() => {
    setLastTooltipData(prev => {
      // Clear when label changed (prevents stale data)
      let next = prev;
      if (prev && label && prev.label !== label) {
        next = null;
      }

      if (active && normalizedPayload?.length) {
        return {
          active: true,
          payload: normalizedPayload as TooltipItem[],
          label,
        };
      }

      // Keep frozen snapshot when inactive (position maintenance in BaseChartWrapper)
      if (!active && next) {
        return { ...next, active: false };
      }

      return next;
    });
  }, [active, normalizedPayload, label]);

  const displayPayload: TooltipItem[] | undefined =
    active && normalizedPayload?.length
      ? (normalizedPayload as TooltipItem[])
      : (lastTooltipData?.payload as TooltipItem[] | undefined);
  const displayLabel = active ? label : lastTooltipData?.label;

  const tooltipLabel = useMemo(() => {
    if (hideLabel || !displayPayload?.length) {
      return null;
    }

    const payloadArray = displayPayload as TooltipItem[];
    const [item] = payloadArray;
    const key = `${labelKey || item.dataKey || item.name || 'value'}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value =
      !labelKey && typeof displayLabel === 'string'
        ? config[displayLabel as keyof typeof config]?.label || displayLabel
        : itemConfig?.label;

    if (labelFormatter) {
      return (
        <div className={cn('font-medium', labelClassName)}>
          {labelFormatter(value, displayPayload)}
        </div>
      );
    }

    if (!value) {
      return null;
    }

    return <div className={cn('font-medium', labelClassName)}>{value}</div>;
  }, [
    displayLabel,
    labelFormatter,
    displayPayload,
    hideLabel,
    labelClassName,
    config,
    labelKey,
  ]);

  // Don't return null - keep rendering last tooltip to maintain position
  if (!displayPayload?.length) {
    return null;
  }

  const nestLabel = displayPayload.length === 1 && indicator !== 'dot';

  return (
    <div className={cn(S.tooltipContainer, className)}>
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {(displayPayload as TooltipItem[])
          .filter(item => item.type !== 'none')
          .map((item, index) => (
            <ChartTooltipItem
              key={item.dataKey || index}
              item={item}
              index={index}
              config={config}
              indicator={indicator}
              hideIndicator={hideIndicator}
              nestLabel={nestLabel}
              tooltipLabel={tooltipLabel}
              color={color}
              nameKey={nameKey}
              formatter={formatter}
            />
          ))}
      </div>
    </div>
  );
}
