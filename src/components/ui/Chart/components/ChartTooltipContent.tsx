import cn from 'classnames';
import { useEffect, useMemo, useState } from 'react';

import { useChart } from '#uilib/components/ui/Chart/Chart.context';
import { getPayloadConfigFromPayload } from '#uilib/components/ui/Chart/Chart.helpers';
import { ChartTooltipContentProps } from '#uilib/components/ui/Chart/Chart.types';

import S from '../Chart.styl';
import { ChartTooltipItem } from './ChartTooltipItem';

type TooltipItem = {
  type: string;
  name: string;
  value: number | [number, number];
  payload: unknown;
  color: string;
  dataKey?: string;
};

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

  // Update last tooltip data when active
  useEffect(() => {
    // Clear lastTooltipData immediately if label changed (prevents stale data)
    // Only clear if label is explicitly provided and different (not undefined)
    if (lastTooltipData && label && lastTooltipData.label !== label) {
      setLastTooltipData(null);
    }

    if (active && payload?.length) {
      setLastTooltipData({
        active,
        payload: payload as TooltipItem[],
        label,
      });
    }
    // Don't clear lastTooltipData when mouse moves out - keep it for position maintenance
    // It will be cleared when label changes (above) or when new active data arrives
  }, [active, payload, label]);

  // Use last tooltip data if current is inactive, otherwise use current
  // lastTooltipData is already cleared in useEffect if label changed, so safe to use here
  const displayActive = active || (lastTooltipData?.active ?? false);
  const displayPayload: TooltipItem[] | undefined =
    active && payload?.length
      ? (payload as TooltipItem[])
      : lastTooltipData?.payload;
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
