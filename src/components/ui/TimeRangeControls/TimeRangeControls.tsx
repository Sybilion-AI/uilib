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
};

export const TimeRangeControls = memo(
  ({ timeRange, onTimeRangeChange, loading }: TimeRangeControlsProps) => (
    <div className={S.timeRangeContainer}>
      <ToggleGroup
        type="single"
        value={toggleValueForTimeRange(timeRange)}
        onValueChange={onTimeRangeChange}
        variant="outline"
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
    </div>
  ),
);

TimeRangeControls.displayName = 'TimeRangeControls';

export const TimeRangeSelect = memo(
  ({
    timeRange,
    onTimeRangeChange,
    loading,
  }: TimeRangeControlsProps & { loading: boolean }) => (
    <Select
      value={toggleValueForTimeRange(timeRange) || undefined}
      onValueChange={onTimeRangeChange}
      disabled={loading}
    >
      <SelectTrigger
        className={S.timeRangeSelectTrigger}
        size="sm"
        aria-label="Select a value"
      >
        <SelectValue placeholder="1 year" />
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
