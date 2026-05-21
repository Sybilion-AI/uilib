import cn from 'classnames';

import { EyeClosedIcon, EyeIcon } from '@phosphor-icons/react';

import S from './PerformanceUnderChartLegend.styl';

export type PerformanceUnderChartLegendRowProps = {
  label: React.ReactNode;
  /** Line color (CSS color string). */
  lineColor: string;
  /** Historical uses solid bar; forecast lines use dashed preview. */
  lineStyle?: 'solid' | 'dashed';
  hidden: boolean;
  onToggle?: () => void;
};

export type PerformanceUnderChartLegendItemConfig =
  PerformanceUnderChartLegendRowProps & { id: string };

export function PerformanceUnderChartLegendRow({
  label,
  lineColor,
  lineStyle = 'solid',
  hidden,
  onToggle,
}: PerformanceUnderChartLegendRowProps) {
  return (
    <button type="button" className={S.row} onClick={onToggle}>
      {lineStyle === 'solid' ? (
        <span
          className={S.swatch}
          style={{ background: lineColor }}
          aria-hidden
        />
      ) : (
        <span
          className={cn(S.swatch, S.swatchDashed)}
          style={{ color: lineColor }}
          aria-hidden
        />
      )}
      <span className={S.label}>{label}</span>
      {onToggle &&
        (hidden ? (
          <EyeClosedIcon className={S.eye} />
        ) : (
          <EyeIcon className={S.eye} />
        ))}
    </button>
  );
}

/** Renders rows from tab-agnostic config (labels + toggles supplied by parent). */
export function PerformanceUnderChartLegendFromItems({
  items,
}: {
  items: PerformanceUnderChartLegendItemConfig[];
}) {
  if (items?.length === 0) return null;

  return (
    <PerformanceUnderChartLegend>
      {items.map(item => (
        <PerformanceUnderChartLegendRow
          key={item.id}
          label={item.label}
          lineColor={item.lineColor}
          lineStyle={item.lineStyle ?? 'solid'}
          hidden={item.hidden}
          onToggle={item.onToggle}
        />
      ))}
    </PerformanceUnderChartLegend>
  );
}

export function PerformanceUnderChartLegend({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={S.root}>{children}</div>;
}
