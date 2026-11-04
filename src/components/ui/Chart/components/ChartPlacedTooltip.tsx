import { type CSSProperties, type ComponentProps, useMemo } from 'react';

import {
  Tooltip,
  useChartHeight,
  useChartWidth,
  useIsTooltipActive,
} from 'recharts';

/** Charts narrower than this open their tooltip under the chart, not over it. */
export const NARROW_CHART_PX = 500;

/** Gap between the bottom of a narrow chart and its tooltip. */
export const NARROW_TOOLTIP_GAP_PX = 4;

/**
 * Set to 1 on the tooltip wrapper's style while it sits under the chart, so
 * code that moves the wrapper itself (BaseChartWrapper) leaves it alone
 * instead of deciding again.
 */
export const TOOLTIP_UNDER_VAR = '--chart-tooltip-under';

/** Whether a chart this wide opens its tooltip under itself. */
export function opensTooltipUnder(chartWidth: number | undefined): boolean {
  return chartWidth != null && chartWidth > 0 && chartWidth < NARROW_CHART_PX;
}

/** Whether ChartPlacedTooltip put this tooltip wrapper under its chart. */
export function isTooltipUnder(wrapper: HTMLElement): boolean {
  return wrapper.style.getPropertyValue(TOOLTIP_UNDER_VAR).trim() === '1';
}

type ChartPlacedTooltipProps = ComponentProps<typeof Tooltip>;

/**
 * A recharts Tooltip that, on a chart narrower than {@link NARROW_CHART_PX},
 * sits under the chart instead of over the lines, so a small chart stays
 * readable while it is hovered. It may then cover what follows the chart, be
 * clipped by a parent that hides overflow, or run past the page edge; that is
 * accepted. Under a chart it does not slide (no transition, whatever
 * `wrapperStyle` says), and while no point is hovered it takes no room
 * (`display: none`), so it never grows a scrolling parent. A caller's
 * `position.x` and `position.y` each win, as does `isAnimationActive`. With
 * `portal`, recharts places nothing, so neither does this.
 */
export function ChartPlacedTooltip(props: ChartPlacedTooltipProps) {
  const width = useChartWidth();
  const height = useChartHeight();
  const hovered = useIsTooltipActive();
  const open = props.active ?? hovered;

  const under =
    props.portal == null &&
    opensTooltipUnder(width) &&
    height != null &&
    height > 0;
  const callerPosition = props.position;
  const y = under
    ? (callerPosition?.y ?? height + NARROW_TOOLTIP_GAP_PX)
    : undefined;
  const position = useMemo(
    () => (y == null ? undefined : { ...callerPosition, y }),
    [callerPosition, y],
  );
  const callerWrapperStyle = props.wrapperStyle;
  const wrapperStyle = useMemo(
    () =>
      under
        ? ({
            ...callerWrapperStyle,
            [TOOLTIP_UNDER_VAR]: '1',
            transition: 'none',
            ...(open ? {} : { display: 'none' }),
          } as CSSProperties)
        : undefined,
    [under, open, callerWrapperStyle],
  );

  if (!under) return <Tooltip {...props} />;

  return (
    <Tooltip
      {...props}
      position={position}
      isAnimationActive={props.isAnimationActive ?? false}
      wrapperStyle={wrapperStyle}
    />
  );
}
