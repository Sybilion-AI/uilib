import { memo } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#uilib/components/ui/Select/Select';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '#uilib/components/ui/ToggleGroup/ToggleGroup';

import { TIME_RANGES } from './TimeRangeControls.constants';
import S from './TimeRangeControls.styl';

function toggleValueForTimeRange(timeRange: string): string {
  return (TIME_RANGES as readonly string[]).includes(timeRange)
    ? timeRange
    : '';
}

export type TimeRangeControlsProps = {
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  loading?: boolean;
  /**
   * The toggle row's look: `default` (plain buttons) or `segmented` (small
   * buttons on a grey track, the picked one raised). The select shown below
   * 768px is the same either way.
   */
  variant?: 'default' | 'segmented';
};

/**
 * The preset ranges as a select. A range that is not a preset (one dragged on
 * the chart) shows "Custom" rather than a preset it is not.
 */
export const TimeRangeSelect = memo(
  ({ timeRange, onTimeRangeChange, loading }: TimeRangeControlsProps) => (
    <Select
      // An empty value shows the placeholder; undefined would leave the
      // select uncontrolled and keep the last preset picked.
      value={toggleValueForTimeRange(timeRange)}
      onValueChange={onTimeRangeChange}
      disabled={loading}
    >
      <SelectTrigger
        className={S.timeRangeSelectTrigger}
        size="sm"
        aria-label="Time range"
      >
        <SelectValue placeholder="Custom" />
      </SelectTrigger>

      <SelectContent className={S.timeRangeSelectContent}>
        {TIME_RANGES.map(range => (
          <SelectItem
            key={range}
            value={range}
            className={S.timeRangeSelectItem}
          >
            {range}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
);

TimeRangeSelect.displayName = 'TimeRangeSelect';

/**
 * The preset ranges as a toggle row from 768px up, and as a select below it
 * (CSS shows one of the two), so the control stays on a phone.
 */
export const TimeRangeControls = memo(
  ({
    timeRange,
    onTimeRangeChange,
    loading,
    variant = 'default',
  }: TimeRangeControlsProps) => (
    <div className={S.timeRangeContainer}>
      <ToggleGroup
        type="single"
        value={toggleValueForTimeRange(timeRange)}
        onValueChange={onTimeRangeChange}
        variant={variant === 'segmented' ? 'segmented' : 'outline'}
        disabled={loading}
        className={S.timeRangeToggleGroup}
      >
        {TIME_RANGES.map(range => (
          <ToggleGroupItem
            key={range}
            value={range}
            className={S.timeRangeToggleItem}
          >
            {range}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <TimeRangeSelect
        timeRange={timeRange}
        onTimeRangeChange={onTimeRangeChange}
        loading={loading}
      />
    </div>
  ),
);

TimeRangeControls.displayName = 'TimeRangeControls';
