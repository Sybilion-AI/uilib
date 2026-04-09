import { jsx, jsxs } from 'react/jsx-runtime';
import { memo } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../Select/Select.js';
import { ToggleGroup, ToggleGroupItem } from '../ToggleGroup/ToggleGroup.js';
import { TIME_RANGES } from './TimeRangeControls.constants.js';
import S from './TimeRangeControls.styl.js';

const TimeRangeControls = memo(({ timeRange, onTimeRangeChange, loading, }) => (jsx("div", { className: S.timeRangeContainer, children: jsx(ToggleGroup, { type: "single", value: timeRange, onValueChange: onTimeRangeChange, variant: "outline", disabled: loading, className: S.timeRangeToggleGroup, children: TIME_RANGES.map(range => (jsx(ToggleGroupItem, { value: range, className: S.timeRangeToggleItem, children: range }, range))) }) })));
TimeRangeControls.displayName = 'TimeRangeControls';
const TimeRangeSelect = memo(({ timeRange, onTimeRangeChange, loading, }) => (jsxs(Select, { value: timeRange, onValueChange: onTimeRangeChange, disabled: loading, children: [jsx(SelectTrigger, { className: S.timeRangeSelectTrigger, size: "sm", "aria-label": "Select a value", children: jsx(SelectValue, { placeholder: "1 year" }) }), jsx(SelectContent, { className: S.timeRangeSelectContent, children: TIME_RANGES.map(range => (jsx(SelectItem, { value: range, className: S.timeRangeSelectItem, children: range }, range))) })] })));
TimeRangeSelect.displayName = 'TimeRangeSelect';

export { TimeRangeControls, TimeRangeSelect };
