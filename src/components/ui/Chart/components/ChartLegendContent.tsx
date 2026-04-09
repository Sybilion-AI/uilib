import cn from 'classnames';
import { ComponentProps } from 'react';

import { useChart } from '#uilib/components/ui/Chart/Chart.context';

import S from '../Chart.styl';
import { ChartLegendItem } from './ChartLegendItem';

export function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = 'bottom',
  nameKey,
}: ComponentProps<'div'> & {
  payload?: any[];
  verticalAlign?: 'top' | 'bottom';
  hideIcon?: boolean;
  nameKey?: string;
}) {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        S.legendContainer,
        verticalAlign === 'top' ? 'pb-3' : 'pt-3',
        className,
      )}
    >
      {payload
        .filter(item => item.type !== 'none')
        .map(item => (
          <ChartLegendItem
            key={item.value}
            item={item}
            config={config}
            hideIcon={hideIcon}
            nameKey={nameKey}
          />
        ))}
    </div>
  );
}
