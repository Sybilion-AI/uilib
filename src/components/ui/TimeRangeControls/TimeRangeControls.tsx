import { memo } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select/Select';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/ToggleGroup/ToggleGroup';

import { TIME_RANGES } from './TimeRangeControls.constants';
import * as S from './TimeRangeControls.styles';
import { TimeRange } from './TimeRangeControls.types';

export const TimeRangeControls = memo(
  ({
    timeRange,
    onTimeRangeChange,
    loading,
  }: {
    timeRange: TimeRange;
    onTimeRangeChange: (range: string) => void;
    loading?: boolean;
  }) => (
    <div className={S.timeRangeContainer}>
      <ToggleGroup
        type="single"
        value={timeRange}
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
  }: {
    timeRange: TimeRange;
    onTimeRangeChange: (range: string) => void;
    loading: boolean;
  }) => (
    <Select
      value={timeRange}
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
