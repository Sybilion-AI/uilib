import cn from 'classnames';

import ChartS from '../../Chart.styl';
import S from './SeriesLegend.styl';

export type SeriesLegendItem = {
  /** The series' data key; the legend hands it back on a click. */
  dataKey: string;
  label: string;
  color: string;
  /** Draw the swatch as a dashed line (a forecast line). */
  dashed?: boolean;
};

/**
 * A plain legend: one entry per series, in the order given, each a button
 * that hides or shows its series. A hidden series' entry is dimmed.
 */
export function SeriesLegend({
  items,
  hiddenSeries,
  onToggle,
  className,
}: {
  items: SeriesLegendItem[];
  hiddenSeries?: ReadonlySet<string>;
  /** Without it the entries are text, not buttons. */
  onToggle?: (dataKey: string) => void;
  className?: string;
}) {
  if (items.length === 0) return null;
  return (
    <div className={cn(ChartS.legendContainer, S.root, className)}>
      {items.map(item => {
        const dimmed = hiddenSeries?.has(item.dataKey) ?? false;
        const content = (
          <>
            <span
              className={cn(S.swatch, item.dashed && S.dashed)}
              style={{ color: item.color }}
              aria-hidden
            />
            {item.label}
          </>
        );
        return onToggle ? (
          <button
            key={item.dataKey}
            type="button"
            className={cn(ChartS.legendItem, S.button, dimmed && S.dimmed)}
            aria-pressed={!dimmed}
            onClick={() => onToggle(item.dataKey)}
          >
            {content}
          </button>
        ) : (
          <span key={item.dataKey} className={ChartS.legendItem}>
            {content}
          </span>
        );
      })}
    </div>
  );
}
