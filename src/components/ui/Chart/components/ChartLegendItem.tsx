'use client';

import { getPayloadConfigFromPayload } from '../Chart.helpers';
import S from '../Chart.styl';
import { ChartConfig } from '../Chart.types';

type LegendItem = {
  type: string;
  value: string;
  color: string;
  dataKey?: string;
};

type ChartLegendItemProps = {
  item: LegendItem;
  config: ChartConfig;
  hideIcon: boolean;
  nameKey?: string;
};

export function ChartLegendItem({
  item,
  config,
  hideIcon,
  nameKey,
}: ChartLegendItemProps) {
  const key = `${nameKey || item.dataKey || 'value'}`;
  const itemConfig = getPayloadConfigFromPayload(config, item, key);

  return (
    <div key={item.value} className={S.legendItem}>
      {itemConfig?.icon && !hideIcon ? (
        <itemConfig.icon />
      ) : (
        <div
          className={S.legendIndicator}
          style={{
            backgroundColor: item.color,
          }}
        />
      )}
      {itemConfig?.label}
    </div>
  );
}
