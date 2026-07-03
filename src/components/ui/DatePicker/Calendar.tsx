import cn from 'classnames';
import { useMemo } from 'react';

import { Button } from '../Button';
import S from './DatePicker.styl';
import type { CalendarProps } from './DatePicker.types';
import {
  formatDateString,
  getMonthMatrix,
  getTodayParts,
  getWeekdayLabels,
  isBetweenDates,
  isDateDisabled,
  isSameDate,
  normalizeDateRange,
  parseDateString,
} from './dateUtils';

export function Calendar({
  className,
  mode = 'single',
  value,
  rangeStart,
  rangeEnd,
  rangeHover,
  viewMonth,
  onViewMonthChange,
  onSelect,
  onDayHover,
  startOfWeek = 0,
  minDate,
  maxDate,
  disabledDate,
  size = 'md',
}: CalendarProps) {
  const selected = parseDateString(value);
  const today = getTodayParts();
  const visibleMonth = viewMonth ?? {
    year: selected?.year ?? today.year,
    month: selected?.month ?? today.month,
  };

  const rangeBounds = useMemo(() => {
    if (mode !== 'range') {
      return null;
    }
    const start = parseDateString(rangeStart);
    const tentativeEnd = parseDateString(rangeEnd ?? rangeHover);
    if (!start || !tentativeEnd) {
      if (start) {
        return { start, end: start };
      }
      return null;
    }
    const normalized = normalizeDateRange(
      formatDateString(start),
      formatDateString(tentativeEnd),
    );
    const end = parseDateString(normalized.end);
    return end ? { start: parseDateString(normalized.start)!, end } : null;
  }, [mode, rangeEnd, rangeHover, rangeStart]);

  const days = useMemo(
    () => getMonthMatrix(visibleMonth.year, visibleMonth.month, startOfWeek),
    [visibleMonth.month, visibleMonth.year, startOfWeek],
  );
  const weekdayLabels = useMemo(
    () => getWeekdayLabels(startOfWeek),
    [startOfWeek],
  );
  const isSelectingRange = mode === 'range' && rangeStart && !rangeEnd;

  return (
    <div
      className={cn(S.calendar, S[`calendarSize-${size}`], className)}
      data-slot="calendar"
      data-mode={mode}
      onMouseLeave={() => onDayHover?.(undefined)}
    >
      <div className={S.weekdayRow} role="row">
        {weekdayLabels.map(label => (
          <div key={label} className={S.weekdayCell} role="columnheader">
            {label}
          </div>
        ))}
      </div>
      <div className={S.dayGrid} role="grid">
        {days.map(day => {
          const inCurrentMonth = day.month === visibleMonth.month;
          const isSelected =
            mode === 'single' && selected ? isSameDate(day, selected) : false;
          const isToday = isSameDate(day, today);
          const disabled = isDateDisabled(day, {
            minDate,
            maxDate,
            disabledDate,
          });
          const dateValue = formatDateString(day);

          const isRangeStart =
            rangeBounds && isSameDate(day, rangeBounds.start);
          const isRangeEnd = rangeBounds && isSameDate(day, rangeBounds.end);
          const isInRange =
            rangeBounds &&
            isBetweenDates(day, rangeBounds.start, rangeBounds.end) &&
            !isRangeStart &&
            !isRangeEnd;
          const isPreview =
            isSelectingRange &&
            isInRange &&
            rangeHover &&
            !parseDateString(rangeEnd);

          return (
            <Button
              size={size}
              key={dateValue}
              type="button"
              role="gridcell"
              aria-selected={isSelected || isRangeStart || isRangeEnd}
              aria-current={isToday ? 'date' : undefined}
              aria-disabled={disabled || undefined}
              disabled={disabled}
              className={cn(
                S.dayCell,
                !inCurrentMonth && S.dayOutsideMonth,
                isSelected && S.daySelected,
                isToday && S.dayToday,
                isInRange && S.dayInRange,
                isPreview && S.dayInRangePreview,
                isRangeStart && S.dayRangeStart,
                isRangeEnd && S.dayRangeEnd,
              )}
              onMouseEnter={() => {
                if (disabled || mode !== 'range') {
                  return;
                }
                onDayHover?.(dateValue);
              }}
              onClick={() => {
                if (disabled) {
                  return;
                }
                onSelect?.(dateValue);
                if (
                  day.month !== visibleMonth.month ||
                  day.year !== visibleMonth.year
                ) {
                  onViewMonthChange?.({ year: day.year, month: day.month });
                }
              }}
            >
              {day.day}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
